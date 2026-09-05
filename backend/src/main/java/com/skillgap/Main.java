package com.skillgap;

import com.skillgap.config.AppConfig;
import com.skillgap.config.DatabaseConfig;
import com.skillgap.config.EnvLoader;
import com.skillgap.controller.*;
import com.skillgap.repository.*;
import com.skillgap.security.TokenService;
import com.skillgap.server.HttpServerApp;
import com.skillgap.service.*;

public class Main {

    public static void main(String[] args) {
        System.out.println("=============================================================");
        System.out.println("  EMPLOYEE / STUDENT SKILL GAP ANALYZER - PURE JAVA BACKEND");
        System.out.println("=============================================================");

        // 1. Configuration
        EnvLoader env = new EnvLoader(".env");
        AppConfig config = new AppConfig(env);

        // 2. Database Connection
        DatabaseConfig dbConfig = new DatabaseConfig(config);
        System.out.println("[INFO] Testing database connectivity to: " + config.getDbUrl());
        boolean dbConnected = dbConfig.testConnection();
        if (dbConnected) {
            System.out.println("[SUCCESS] Database connected successfully.");
        } else {
            System.err.println("[WARNING] Could not connect to MySQL database.");
            System.err.println("          Please verify that MySQL is running and credentials in .env are correct.");
            System.err.println("          Make sure to run sql/schema.sql and sql/seed.sql before testing data endpoints.");
        }

        // 3. Security
        TokenService tokenService = new TokenService();

        // 4. Repositories (Pure JDBC with PreparedStatement)
        StudentRepository studentRepository = new StudentRepository(dbConfig);
        SkillRepository skillRepository = new SkillRepository(dbConfig);
        StudentSkillRepository studentSkillRepository = new StudentSkillRepository(dbConfig);
        JobRepository jobRepository = new JobRepository(dbConfig);
        JobSkillRepository jobSkillRepository = new JobSkillRepository(dbConfig);
        ApplicationRepository applicationRepository = new ApplicationRepository(dbConfig);
        RecommendationRepository recommendationRepository = new RecommendationRepository(dbConfig);

        // 5. Services (Business Logic)
        AuthService authService = new AuthService(studentRepository, tokenService);
        StudentService studentService = new StudentService(studentRepository, studentSkillRepository, skillRepository);
        SkillService skillService = new SkillService(skillRepository);
        SkillGapService skillGapService = new SkillGapService(studentRepository, jobRepository, studentSkillRepository, jobSkillRepository);
        RecommendationService recommendationService = new RecommendationService(skillGapService, recommendationRepository);
        ApplicationService applicationService = new ApplicationService(applicationRepository, studentRepository, jobRepository, skillGapService);
        JobService jobService = new JobService(jobRepository, jobSkillRepository, skillRepository);
        DashboardService dashboardService = new DashboardService(studentRepository, jobRepository, applicationRepository, recommendationRepository);

        // 6. Controllers
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

        // 7. Start HTTP Server
        HttpServerApp serverApp = new HttpServerApp(
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

        try {
            serverApp.start();
        } catch (Exception e) {
            System.err.println("[FATAL] Failed to start HTTP server: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }

        // Clean shutdown hook
        Runtime.getRuntime().addShutdownHook(new Thread(serverApp::stop));
    }
}
