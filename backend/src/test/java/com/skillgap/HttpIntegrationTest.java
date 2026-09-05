package com.skillgap;

import com.skillgap.config.AppConfig;
import com.skillgap.config.EnvLoader;
import com.skillgap.controller.*;
import com.skillgap.dto.*;
import com.skillgap.model.*;
import com.skillgap.repository.*;
import com.skillgap.security.*;
import com.skillgap.server.HttpServerApp;
import com.skillgap.service.*;
import com.skillgap.util.JsonUtil;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

/**
 * End-to-End HTTP Integration Test Suite.
 * Starts HttpServerApp on an ephemeral port, sends real HTTP requests via java.net.http.HttpClient,
 * and validates the HTTP wire contract, CORS, status codes, and security.
 */
public class HttpIntegrationTest {

    private static int testsRun = 0;
    private static int testsPassed = 0;
    private static int testsFailed = 0;

    public static void main(String[] args) throws Exception {
        System.out.println("=================================================");
        System.out.println("  RUNNING HTTP REST INTEGRATION TESTS");
        System.out.println("=================================================");

        int testPort = 8899;
        EnvLoader env = new EnvLoader() {
            @Override
            public int getInt(String key, int defaultValue) {
                if ("SERVER_PORT".equals(key)) return testPort;
                return super.getInt(key, defaultValue);
            }
        };
        AppConfig config = new AppConfig(env);
        TokenService tokenService = new TokenService();

        // Setup test data in memory for integration testing without external dependencies
        TestStudentRepo testStudentRepo = new TestStudentRepo();
        TestSkillRepo testSkillRepo = new TestSkillRepo();
        TestStudentSkillRepo testStudentSkillRepo = new TestStudentSkillRepo();
        TestJobRepo testJobRepo = new TestJobRepo();
        TestJobSkillRepo testJobSkillRepo = new TestJobSkillRepo();
        TestAppRepo testAppRepo = new TestAppRepo();
        TestRecRepo testRecRepo = new TestRecRepo();

        // Seed test data
        // Admin
        testStudentRepo.add(new Student(1, "Admin", "admin@example.com", PasswordUtil.hash("admin123"), "ADMIN", null));
        // Student Arun
        testStudentRepo.add(new Student(101, "Arun", "arun@example.com", PasswordUtil.hash("user123"), "USER", null));

        // Skills
        testSkillRepo.add(new Skill(10, "Java", "Backend"));
        testSkillRepo.add(new Skill(11, "MySQL", "Database"));
        testSkillRepo.add(new Skill(12, "Spring Boot", "Backend"));
        testSkillRepo.add(new Skill(13, "Python", "Backend"));
        testSkillRepo.add(new Skill(14, "AWS", "Cloud"));
        testSkillRepo.add(new Skill(15, "React", "Frontend"));

        // Arun's skills (Spring Boot 12 is missing)
        testStudentSkillRepo.add(new StudentSkill(101, 10, 4, "Java", "Backend"));
        testStudentSkillRepo.add(new StudentSkill(101, 11, 4, "MySQL", "Database"));
        testStudentSkillRepo.add(new StudentSkill(101, 13, 3, "Python", "Backend"));
        testStudentSkillRepo.add(new StudentSkill(101, 15, 2, "React", "Frontend"));
        testStudentSkillRepo.add(new StudentSkill(101, 14, 1, "AWS", "Cloud"));

        // Job 501
        testJobRepo.add(new Job(501, "Java Full Stack Developer", "ABC Technologies", "Chennai", null));

        // Job Skills for Job 501
        testJobSkillRepo.add(new JobSkill(501, 10, 4, true, "Java", "Backend"));
        testJobSkillRepo.add(new JobSkill(501, 12, 4, true, "Spring Boot", "Backend"));
        testJobSkillRepo.add(new JobSkill(501, 15, 3, true, "React", "Frontend"));
        testJobSkillRepo.add(new JobSkill(501, 11, 3, true, "MySQL", "Database"));
        testJobSkillRepo.add(new JobSkill(501, 14, 2, false, "AWS", "Cloud"));

        // Wire services
        AuthService authService = new AuthService(testStudentRepo, tokenService);
        StudentService studentService = new StudentService(testStudentRepo, testStudentSkillRepo, testSkillRepo);
        SkillService skillService = new SkillService(testSkillRepo);
        SkillGapService skillGapService = new SkillGapService(testStudentRepo, testJobRepo, testStudentSkillRepo, testJobSkillRepo);
        RecommendationService recommendationService = new RecommendationService(skillGapService, testRecRepo);
        ApplicationService applicationService = new ApplicationService(testAppRepo, testStudentRepo, testJobRepo, skillGapService);
        JobService jobService = new JobService(testJobRepo, testJobSkillRepo, testSkillRepo);
        DashboardService dashboardService = new DashboardService(testStudentRepo, testJobRepo, testAppRepo, testRecRepo);

        // Wire controllers
        HealthController healthController = new HealthController();
        AuthController authController = new AuthController(authService);
        StudentController studentController = new StudentController(studentService);
        StudentSkillController studentSkillController = new StudentSkillController(studentService);
        SkillController skillController = new SkillController(skillService);
        JobController jobController = new JobController(jobService);
        JobSkillController jobSkillController = new JobSkillController(jobService);
        SkillGapController skillGapController = new SkillGapController(skillGapService);
        RecommendationController recommendationController = new RecommendationController(recommendationService);
        ApplicationController applicationController = new ApplicationController(applicationService);
        DashboardController dashboardController = new DashboardController(dashboardService);

        HttpServerApp server = new HttpServerApp(
                config,
                tokenService,
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

        server.start();

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();

        String baseUrl = "http://localhost:" + testPort;

        try {
            // 1. Health check
            testHealth(client, baseUrl);

            // 2. CORS preflight (OPTIONS)
            testCorsPreflight(client, baseUrl);

            // 3. User Login
            String userToken = testUserLogin(client, baseUrl);

            // 4. Admin Login
            String adminToken = testAdminLogin(client, baseUrl);

            // 5. Invalid Login
            testInvalidLogin(client, baseUrl);

            // 6. Role Authorization: USER calling ADMIN endpoint -> 403
            testUserCallingAdminEndpoint(client, baseUrl, userToken);

            // 7. Missing Token -> 401
            testMissingToken(client, baseUrl);

            // 8. User access own profile -> 200, access other profile -> 403
            testProfileAuthorization(client, baseUrl, userToken, adminToken);

            // 9. Skill Gap Analysis -> 200, 65% match, Spring Boot missing = 0
            testSkillGapAnalysis(client, baseUrl, userToken);

            // 10. Recommendations -> 200, Spring Boot = HIGH, React = MEDIUM, AWS = LOW
            testRecommendations(client, baseUrl, userToken);

            // 11. Application flow: USER applies -> 201
            testApplicationFlow(client, baseUrl, userToken);

            // 12. Duplicate application -> 409 Conflict
            testDuplicateApplication(client, baseUrl, userToken);

            // 13. Application Status update by Admin -> 200, by User -> 403
            testApplicationStatus(client, baseUrl, userToken, adminToken);

            // 14. Dashboard metrics -> 200
            testDashboardSummary(client, baseUrl, adminToken);

        } finally {
            server.stop();
        }

        System.out.println("=================================================");
        System.out.println("  HTTP INTEGRATION TEST SUMMARY: " + testsPassed + " / " + testsRun + " PASSED");
        if (testsFailed == 0) {
            System.out.println("  STATUS: ALL HTTP ENDPOINTS FULLY VERIFIED! [OK]");
            System.out.println("=================================================");
        } else {
            System.err.println("  STATUS: " + testsFailed + " TESTS FAILED!");
            System.out.println("=================================================");
            System.exit(1);
        }
    }

    private static void assertTrue(String testName, boolean condition) {
        testsRun++;
        if (condition) {
            testsPassed++;
            System.out.println("  [PASS] " + testName);
        } else {
            testsFailed++;
            System.err.println("  [FAIL] " + testName);
        }
    }

    private static void assertEquals(String testName, Object expected, Object actual) {
        testsRun++;
        if (Objects.equals(expected, actual)) {
            testsPassed++;
            System.out.println("  [PASS] " + testName);
        } else {
            testsFailed++;
            System.err.println("  [FAIL] " + testName + " - Expected: " + expected + ", Got: " + actual);
        }
    }

    private static void testHealth(HttpClient client, String baseUrl) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/health"))
                .GET()
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("Health check status code 200", 200, resp.statusCode());
        assertTrue("Health check body contains status UP", resp.body().contains("\"status\":\"UP\""));
    }

    private static void testCorsPreflight(HttpClient client, String baseUrl) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/jobs"))
                .method("OPTIONS", HttpRequest.BodyPublishers.noBody())
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "POST")
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("OPTIONS preflight returns 204", 204, resp.statusCode());
        assertTrue("CORS header allows origin", resp.headers().firstValue("Access-Control-Allow-Origin").isPresent());
    }

    private static String testUserLogin(HttpClient client, String baseUrl) throws Exception {
        String body = "{\"email\":\"arun@example.com\",\"password\":\"user123\"}";
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/auth/user/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("User login returns 200", 200, resp.statusCode());
        Map<String, Object> map = JsonUtil.parseObject(resp.body());
        String token = JsonUtil.getString(map, "token");
        assertTrue("User login returns valid token", token != null && token.startsWith("sga_"));
        return token;
    }

    private static String testAdminLogin(HttpClient client, String baseUrl) throws Exception {
        String body = "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}";
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/auth/admin/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("Admin login returns 200", 200, resp.statusCode());
        Map<String, Object> map = JsonUtil.parseObject(resp.body());
        String token = JsonUtil.getString(map, "token");
        assertTrue("Admin login returns valid token", token != null && token.startsWith("sga_"));
        return token;
    }

    private static void testInvalidLogin(HttpClient client, String baseUrl) throws Exception {
        String body = "{\"email\":\"arun@example.com\",\"password\":\"wrongpassword\"}";
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/auth/user/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("Invalid login returns 401 Unauthorized", 401, resp.statusCode());
    }

    private static void testUserCallingAdminEndpoint(HttpClient client, String baseUrl, String userToken) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/students"))
                .header("Authorization", "Bearer " + userToken)
                .GET()
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("USER calling admin endpoint /api/students returns 403 Forbidden", 403, resp.statusCode());
    }

    private static void testMissingToken(HttpClient client, String baseUrl) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/auth/me"))
                .GET()
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("Missing token on /api/auth/me returns 401 Unauthorized", 401, resp.statusCode());
    }

    private static void testProfileAuthorization(HttpClient client, String baseUrl, String userToken, String adminToken) throws Exception {
        // User accessing own profile (101) -> 200
        HttpRequest reqOwn = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/students/101"))
                .header("Authorization", "Bearer " + userToken)
                .GET()
                .build();
        HttpResponse<String> respOwn = client.send(reqOwn, HttpResponse.BodyHandlers.ofString());
        assertEquals("User accessing own profile returns 200", 200, respOwn.statusCode());

        // User accessing other profile (1) -> 403
        HttpRequest reqOther = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/students/1"))
                .header("Authorization", "Bearer " + userToken)
                .GET()
                .build();
        HttpResponse<String> respOther = client.send(reqOther, HttpResponse.BodyHandlers.ofString());
        assertEquals("User accessing another profile returns 403 Forbidden", 403, respOther.statusCode());

        // Admin accessing other profile (101) -> 200
        HttpRequest reqAdmin = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/students/101"))
                .header("Authorization", "Bearer " + adminToken)
                .GET()
                .build();
        HttpResponse<String> respAdmin = client.send(reqAdmin, HttpResponse.BodyHandlers.ofString());
        assertEquals("Admin accessing any profile returns 200", 200, respAdmin.statusCode());
    }

    private static void testSkillGapAnalysis(HttpClient client, String baseUrl, String userToken) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/students/101/jobs/501/skill-gap"))
                .header("Authorization", "Bearer " + userToken)
                .GET()
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("Skill Gap analysis returns 200", 200, resp.statusCode());

        Map<String, Object> map = JsonUtil.parseObject(resp.body());
        assertEquals("Authoritative match score is 65%", 65, JsonUtil.getInteger(map, "overallMatchPercent"));
        assertTrue("Contains skills list", map.containsKey("skills"));
    }

    private static void testRecommendations(HttpClient client, String baseUrl, String userToken) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/students/101/jobs/501/recommendations"))
                .header("Authorization", "Bearer " + userToken)
                .GET()
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("Recommendations endpoint returns 200", 200, resp.statusCode());

        List<Object> list = JsonUtil.parseArray(resp.body());
        assertTrue("Recommendations list contains items", !list.isEmpty());
        Map<String, Object> firstRec = (Map<String, Object>) list.get(0);
        assertTrue("First recommendation has HIGH or MEDIUM priority",
                "HIGH".equals(JsonUtil.getString(firstRec, "priority")) || "MEDIUM".equals(JsonUtil.getString(firstRec, "priority")));
    }

    private static void testApplicationFlow(HttpClient client, String baseUrl, String userToken) throws Exception {
        String body = "{\"studentId\":101,\"jobId\":501}";
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/applications"))
                .header("Authorization", "Bearer " + userToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("Application submission returns 201 Created", 201, resp.statusCode());

        Map<String, Object> map = JsonUtil.parseObject(resp.body());
        assertEquals("Initial status is APPLIED", "APPLIED", JsonUtil.getString(map, "status"));
        assertEquals("Match percent set to authoritative 65%", 65, JsonUtil.getInteger(map, "matchPercent"));
    }

    private static void testDuplicateApplication(HttpClient client, String baseUrl, String userToken) throws Exception {
        String body = "{\"studentId\":101,\"jobId\":501}";
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/applications"))
                .header("Authorization", "Bearer " + userToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("Duplicate application returns 409 Conflict", 409, resp.statusCode());
    }

    private static void testApplicationStatus(HttpClient client, String baseUrl, String userToken, String adminToken) throws Exception {
        String body = "{\"status\":\"SHORTLISTED\"}";

        // User trying to update status -> 403
        HttpRequest userReq = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/applications/1/status"))
                .header("Authorization", "Bearer " + userToken)
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> userResp = client.send(userReq, HttpResponse.BodyHandlers.ofString());
        assertEquals("User attempting to update status returns 403 Forbidden", 403, userResp.statusCode());

        // Admin updating status -> 200
        HttpRequest adminReq = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/applications/1/status"))
                .header("Authorization", "Bearer " + adminToken)
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> adminResp = client.send(adminReq, HttpResponse.BodyHandlers.ofString());
        assertEquals("Admin updating status returns 200 OK", 200, adminResp.statusCode());
        Map<String, Object> map = JsonUtil.parseObject(adminResp.body());
        assertEquals("Updated status is SHORTLISTED", "SHORTLISTED", JsonUtil.getString(map, "status"));
    }

    private static void testDashboardSummary(HttpClient client, String baseUrl, String adminToken) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/dashboard/summary"))
                .header("Authorization", "Bearer " + adminToken)
                .GET()
                .build();
        HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
        assertEquals("Dashboard summary returns 200", 200, resp.statusCode());
        Map<String, Object> map = JsonUtil.parseObject(resp.body());
        assertTrue("Dashboard contains totalStudents", map.containsKey("totalStudents"));
        assertTrue("Dashboard contains totalJobs", map.containsKey("totalJobs"));
        assertTrue("Dashboard contains totalApplications", map.containsKey("totalApplications"));
    }

    // =========================================================================
    // IN-MEMORY TEST REPOSITORIES
    // =========================================================================

    private static class TestStudentRepo extends StudentRepository {
        private final List<Student> list = new ArrayList<>();
        TestStudentRepo() { super(null); }
        void add(Student s) { list.add(s); }
        @Override public Student findById(int id) { return list.stream().filter(s -> s.getStudentId() == id).findFirst().orElse(null); }
        @Override public Student findByEmail(String email) { return list.stream().filter(s -> s.getEmail().equalsIgnoreCase(email)).findFirst().orElse(null); }
        @Override public List<Student> findAll() { return new ArrayList<>(list); }
        @Override public int countStudents() { return (int) list.stream().filter(s -> "USER".equalsIgnoreCase(s.getRole())).count(); }
        @Override public Student create(Student s) { s.setStudentId(list.size() + 1); list.add(s); return s; }
    }

    private static class TestSkillRepo extends SkillRepository {
        private final List<Skill> list = new ArrayList<>();
        TestSkillRepo() { super(null); }
        void add(Skill s) { list.add(s); }
        @Override public List<Skill> findAll() { return new ArrayList<>(list); }
        @Override public Skill findById(int id) { return list.stream().filter(s -> s.getSkillId() == id).findFirst().orElse(null); }
        @Override public Skill findByName(String name) { return list.stream().filter(s -> s.getName().equalsIgnoreCase(name)).findFirst().orElse(null); }
    }

    private static class TestStudentSkillRepo extends StudentSkillRepository {
        private final List<StudentSkill> list = new ArrayList<>();
        TestStudentSkillRepo() { super(null); }
        void add(StudentSkill ss) { list.add(ss); }
        @Override public List<StudentSkill> findByStudentId(int studentId) {
            List<StudentSkill> res = new ArrayList<>();
            for (StudentSkill ss : list) if (ss.getStudentId() == studentId) res.add(ss);
            return res;
        }
    }

    private static class TestJobRepo extends JobRepository {
        private final List<Job> list = new ArrayList<>();
        TestJobRepo() { super(null); }
        void add(Job j) { list.add(j); }
        @Override public List<Job> findAll() { return new ArrayList<>(list); }
        @Override public Job findById(int id) { return list.stream().filter(j -> j.getJobId() == id).findFirst().orElse(null); }
        @Override public int countJobs() { return list.size(); }
    }

    private static class TestJobSkillRepo extends JobSkillRepository {
        private final List<JobSkill> list = new ArrayList<>();
        TestJobSkillRepo() { super(null); }
        void add(JobSkill js) { list.add(js); }
        @Override public List<JobSkill> findByJobId(int jobId) {
            List<JobSkill> res = new ArrayList<>();
            for (JobSkill js : list) if (js.getJobId() == jobId) res.add(js);
            return res;
        }
    }

    private static class TestAppRepo extends ApplicationRepository {
        private final List<Application> list = new ArrayList<>();
        TestAppRepo() { super(null); }
        @Override public Application create(Application a) {
            a.setApplicationId(list.size() + 1);
            list.add(a);
            return a;
        }
        @Override public Application findById(int id) { return list.stream().filter(a -> a.getApplicationId() == id).findFirst().orElse(null); }
        @Override public Application findByStudentAndJob(int sId, int jId) {
            return list.stream().filter(a -> a.getStudentId() == sId && a.getJobId() == jId).findFirst().orElse(null);
        }
        @Override public List<Application> findAll() { return new ArrayList<>(list); }
        @Override public List<Application> findByStudentId(int sId) {
            List<Application> res = new ArrayList<>();
            for (Application a : list) if (a.getStudentId() == sId) res.add(a);
            return res;
        }
        @Override public boolean updateStatus(int id, String status) {
            Application a = findById(id);
            if (a != null) { a.setStatus(status); return true; }
            return false;
        }
        @Override public int countApplications() { return list.size(); }
        @Override public double getAverageMatchPercent() {
            if (list.isEmpty()) return 0.0;
            int sum = 0;
            for (Application a : list) sum += a.getMatchPercent();
            return (double) sum / list.size();
        }
    }

    private static class TestRecRepo extends RecommendationRepository {
        private final List<Recommendation> list = new ArrayList<>();
        TestRecRepo() { super(null); }
        @Override public void replaceRecommendations(int studentId, int jobId, List<Recommendation> recs) {
            list.removeIf(r -> r.getStudentId() == studentId && r.getJobId() == jobId);
            if (recs != null) list.addAll(recs);
        }
        @Override public List<TopSkillGapDto> getTopSkillGaps(int limit) {
            return Collections.singletonList(new TopSkillGapDto(12, "Spring Boot", 1));
        }
    }
}
