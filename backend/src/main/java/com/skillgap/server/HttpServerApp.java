package com.skillgap.server;

import com.skillgap.config.AppConfig;
import com.skillgap.controller.*;
import com.skillgap.exception.ApiException;
import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;
import com.skillgap.router.Router;
import com.skillgap.security.SecurityContext;
import com.skillgap.security.TokenService;
import com.skillgap.security.UserPrincipal;
import com.skillgap.util.HttpResponseUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

public class HttpServerApp {

    private final AppConfig config;
    private final TokenService tokenService;
    private final Router router;
    private HttpServer server;

    public HttpServerApp(AppConfig config,
                         TokenService tokenService,
                         HealthController healthController,
                         AuthController authController,
                         StudentController studentController,
                         StudentSkillController studentSkillController,
                         SkillController skillController,
                         JobController jobController,
                         JobSkillController jobSkillController,
                         SkillGapController skillGapController,
                         RecommendationController recommendationController,
                         ApplicationController applicationController,
                         DashboardController dashboardController) {
        this.config = config;
        this.tokenService = tokenService;
        this.router = new Router();
        registerRoutes(
                healthController,
                authController,
                studentController,
                studentSkillController,
                skillController,
                jobController,
                jobSkillController,
                skillGapController,
                recommendationController,
                applicationController,
                dashboardController
        );
    }

    private void registerRoutes(HealthController healthController,
                                AuthController authController,
                                StudentController studentController,
                                StudentSkillController studentSkillController,
                                SkillController skillController,
                                JobController jobController,
                                JobSkillController jobSkillController,
                                SkillGapController skillGapController,
                                RecommendationController recommendationController,
                                ApplicationController applicationController,
                                DashboardController dashboardController) {
        // Health
        router.get("/api/health", healthController::checkHealth);

        // Auth
        router.post("/api/auth/admin/login", authController::adminLogin);
        router.post("/api/auth/user/login", authController::userLogin);
        router.post("/api/auth/logout", authController::logout);
        router.get("/api/auth/me", authController::me);

        // Students
        router.get("/api/students", studentController::getAllStudents);
        router.post("/api/students", studentController::createStudent);
        router.get("/api/students/{id}", studentController::getStudentById);
        router.put("/api/students/{id}", studentController::updateStudent);
        router.delete("/api/students/{id}", studentController::deleteStudent);

        // Student Skills
        router.get("/api/students/{id}/skills", studentSkillController::getSkills);
        router.post("/api/students/{id}/skills", studentSkillController::addOrUpdateSkill);
        router.delete("/api/students/{id}/skills/{skillId}", studentSkillController::deleteSkill);

        // Skills
        router.get("/api/skills", skillController::getAllSkills);
        router.get("/api/skills/{id}", skillController::getSkillById);
        router.post("/api/skills", skillController::createSkill);
        router.put("/api/skills/{id}", skillController::updateSkill);
        router.delete("/api/skills/{id}", skillController::deleteSkill);

        // Jobs
        router.get("/api/jobs", jobController::getAllJobs);
        router.get("/api/jobs/{id}", jobController::getJobById);
        router.post("/api/jobs", jobController::createJob);
        router.put("/api/jobs/{id}", jobController::updateJob);
        router.delete("/api/jobs/{id}", jobController::deleteJob);

        // Job Skills
        router.get("/api/jobs/{id}/skills", jobSkillController::getJobSkills);
        router.post("/api/jobs/{id}/skills", jobSkillController::addOrUpdateJobSkill);
        router.delete("/api/jobs/{id}/skills/{skillId}", jobSkillController::deleteJobSkill);

        // Skill Gap Engine
        router.get("/api/students/{studentId}/jobs/{jobId}/skill-gap", skillGapController::analyze);

        // Recommendation Engine
        router.get("/api/students/{studentId}/jobs/{jobId}/recommendations", recommendationController::getRecommendations);

        // Applications
        router.post("/api/applications", applicationController::apply);
        router.get("/api/applications", applicationController::listApplications);
        router.get("/api/applications/{id}", applicationController::getApplicationById);
        router.put("/api/applications/{id}/status", applicationController::updateStatus);

        // Dashboard
        router.get("/api/dashboard/summary", dashboardController::getSummary);
    }

    public void start() throws IOException {
        int port = config.getServerPort();
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.setExecutor(Executors.newFixedThreadPool(20));

        server.createContext("/", new HttpHandler() {
            @Override
            public void handle(HttpExchange exchange) throws IOException {
                handleRequest(exchange);
            }
        });

        server.start();
        System.out.println("=================================================");
        System.out.println(" Skill Gap Analyzer HTTP REST Server Started!");
        System.out.println(" Port: " + port);
        System.out.println(" Frontend Origin: " + config.getFrontendOrigin());
        System.out.println(" Health: http://localhost:" + port + "/api/health");
        System.out.println("=================================================");
    }

    public void stop() {
        if (server != null) {
            server.stop(1);
            System.out.println("Skill Gap Analyzer server stopped.");
        }
    }

    private void handleRequest(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod().toUpperCase();
        String path = exchange.getRequestURI().getPath();
        String allowedOrigin = config.getFrontendOrigin();

        // 1. CORS Preflight (OPTIONS)
        if ("OPTIONS".equals(method)) {
            HttpResponseUtil.setCorsHeaders(exchange, allowedOrigin);
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        try {
            // 2. Authentication & Token Extraction
            String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
            UserPrincipal principal = null;
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7).trim();
                principal = tokenService.validateToken(token);
            }
            SecurityContext.setPrincipal(principal);

            // 3. Read Body
            String body = readBody(exchange.getRequestBody());

            // 4. Create Context & Dispatch
            RequestContext ctx = new RequestContext(exchange, method, path, body);
            ctx.setUserPrincipal(principal);

            HttpResponse resp = router.dispatch(ctx);

            // 5. Send JSON Response
            HttpResponseUtil.sendJsonResponse(exchange, resp.getStatusCode(), resp.getBody(), allowedOrigin);

        } catch (ApiException ae) {
            HttpResponseUtil.sendErrorResponse(exchange, ae.getStatus(), ae.getError(), ae.getMessage(), ae.getDetails(), allowedOrigin);
        } catch (IllegalArgumentException | IllegalStateException ie) {
            HttpResponseUtil.sendErrorResponse(exchange, 400, "BAD_REQUEST", ie.getMessage(), null, allowedOrigin);
        } catch (Exception ex) {
            System.err.println("[ERROR] Internal error handling " + method + " " + path + ": " + ex.getMessage());
            HttpResponseUtil.sendErrorResponse(exchange, 500, "INTERNAL_SERVER_ERROR", "An unexpected internal server error occurred", null, allowedOrigin);
        } finally {
            SecurityContext.clear();
        }
    }

    private String readBody(InputStream is) throws IOException {
        if (is == null) return "";
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buf = new byte[1024];
        int read;
        while ((read = is.read(buf)) != -1) {
            baos.write(buf, 0, read);
        }
        return baos.toString(StandardCharsets.UTF_8.name());
    }
}
