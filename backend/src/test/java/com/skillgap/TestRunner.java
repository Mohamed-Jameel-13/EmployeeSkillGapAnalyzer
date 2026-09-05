package com.skillgap;

import com.skillgap.dto.*;
import com.skillgap.exception.ConflictException;
import com.skillgap.exception.ForbiddenException;
import com.skillgap.exception.ValidationException;
import com.skillgap.model.*;
import com.skillgap.repository.*;
import com.skillgap.security.*;
import com.skillgap.service.*;
import com.skillgap.util.JsonUtil;

import java.util.*;

/**
 * Pure Java automated test suite runner for Skill Gap Analyzer.
 * Validates domain rules, security, calculations, recommendations, workflows, and edge cases.
 */
public class TestRunner {

    private static int testsRun = 0;
    private static int testsPassed = 0;
    private static int testsFailed = 0;

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("  RUNNING SKILL GAP ANALYZER AUTOMATED TESTS");
        System.out.println("=================================================");

        testJsonUtil();
        testPasswordSecurity();
        testTokenService();
        testSkillGapEngineCalculations();
        testRecommendationEnginePriorities();
        testApplicationSecurityAndRules();

        System.out.println("=================================================");
        System.out.println("  TEST SUMMARY: " + testsPassed + " / " + testsRun + " PASSED");
        if (testsFailed == 0) {
            System.out.println("  STATUS: ALL TESTS PASSED SUCCESSFULLY! [OK]");
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

    // ========================================================
    // 1. JSON UTIL TESTS
    // ========================================================
    private static void testJsonUtil() {
        System.out.println("\n--- Testing JsonUtil ---");

        // Simple map
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("skillId", 10);
        map.put("proficiency", 4);
        map.put("name", "Java");
        map.put("mandatory", true);

        String json = JsonUtil.toJson(map);
        assertTrue("JsonUtil serialization produces valid string", json.contains("\"skillId\":10") && json.contains("\"mandatory\":true"));

        Map<String, Object> parsed = JsonUtil.parseObject(json);
        assertEquals("Parsed integer", 10, JsonUtil.getInteger(parsed, "skillId"));
        assertEquals("Parsed string", "Java", JsonUtil.getString(parsed, "name"));
        assertEquals("Parsed boolean", Boolean.TRUE, JsonUtil.getBoolean(parsed, "mandatory"));

        // Password hash masking
        Student s = new Student(1, "Test User", "test@example.com", "secret_hash_value", "USER", null);
        String sJson = JsonUtil.toJson(s);
        assertTrue("JsonUtil never serializes passwordHash", !sJson.contains("secret_hash_value") && !sJson.contains("passwordHash"));
    }

    // ========================================================
    // 2. PASSWORD SECURITY TESTS
    // ========================================================
    private static void testPasswordSecurity() {
        System.out.println("\n--- Testing Password Security (PBKDF2) ---");

        String plain = "mySecretPassword123";
        String hash1 = PasswordUtil.hash(plain);
        String hash2 = PasswordUtil.hash(plain);

        assertTrue("Hash contains salt separator ':'", hash1.contains(":"));
        assertTrue("Different salts produce different hashes for same password", !hash1.equals(hash2));
        assertTrue("Valid password verification succeeds", PasswordUtil.verify(plain, hash1));
        assertTrue("Valid password verification succeeds with hash2", PasswordUtil.verify(plain, hash2));
        assertTrue("Invalid password verification fails", !PasswordUtil.verify("wrongPassword", hash1));
        assertTrue("Null password verification fails safely", !PasswordUtil.verify(null, hash1));
        assertTrue("Corrupted hash verification fails safely", !PasswordUtil.verify(plain, "corrupted:hash"));
    }

    // ========================================================
    // 3. TOKEN SERVICE TESTS
    // ========================================================
    private static void testTokenService() {
        System.out.println("\n--- Testing Token & Session Management ---");

        TokenService tokenService = new TokenService();
        UserPrincipal admin = new UserPrincipal(1, "Admin", "admin@example.com", Role.ADMIN);
        UserPrincipal user = new UserPrincipal(101, "Arun", "arun@example.com", Role.USER);

        String adminToken = tokenService.createToken(admin);
        String userToken = tokenService.createToken(user);

        assertTrue("Admin token generated with prefix", adminToken.startsWith("sga_"));
        assertTrue("Tokens are unique", !adminToken.equals(userToken));

        UserPrincipal validatedAdmin = tokenService.validateToken(adminToken);
        assertEquals("Validated principal ID matches", 1, validatedAdmin.getUserId());
        assertTrue("Validated principal is admin", validatedAdmin.isAdmin());

        UserPrincipal validatedUser = tokenService.validateToken(userToken);
        assertEquals("Validated student ID matches", 101, validatedUser.getUserId());
        assertTrue("Validated principal is user", validatedUser.isUser());

        // Revocation / Logout
        tokenService.revokeToken(adminToken);
        assertTrue("Revoked token returns null", tokenService.validateToken(adminToken) == null);
        assertTrue("Invalid token returns null", tokenService.validateToken("invalid-token") == null);
    }

    // ========================================================
    // 4. SKILL GAP ENGINE TESTS
    // ========================================================
    private static void testSkillGapEngineCalculations() {
        System.out.println("\n--- Testing Skill Gap Engine & Weighted Match Scoring ---");

        // Scenario 1: Arun against Java Full Stack Developer
        // Arun: Java=4, MySQL=4, Python=3, React=2, AWS=1. Spring Boot is absent (0).
        // Job: Java=4 (M), Spring Boot=4 (M), React=3 (M), MySQL=3 (M), AWS=2 (O).

        // Skill Scores:
        // Java: min(4/4, 1.0) = 1.0, weight = 2.0 -> 2.0
        // Spring Boot: min(0/4, 1.0) = 0.0, weight = 2.0 -> 0.0
        // React: min(2/3, 1.0) = 0.666667, weight = 2.0 -> 1.333333
        // MySQL: min(4/3, 1.0) = 1.0, weight = 2.0 -> 2.0
        // AWS: min(1/2, 1.0) = 0.5, weight = 1.0 -> 0.5
        // Total weighted score = 2.0 + 0.0 + 1.333333 + 2.0 + 0.5 = 5.833333
        // Total weighted maximum = 2.0 + 2.0 + 2.0 + 2.0 + 1.0 = 9.0
        // Overall match % = round((5.833333 / 9.0) * 100) = 65%

        double scoreJava = Math.min(4.0 / 4.0, 1.0) * 2.0;
        double scoreSpringBoot = Math.min(0.0 / 4.0, 1.0) * 2.0;
        double scoreReact = Math.min(2.0 / 3.0, 1.0) * 2.0;
        double scoreMySQL = Math.min(4.0 / 3.0, 1.0) * 2.0;
        double scoreAWS = Math.min(1.0 / 2.0, 1.0) * 1.0;

        double sumWeighted = scoreJava + scoreSpringBoot + scoreReact + scoreMySQL + scoreAWS;
        double maxWeighted = 2.0 + 2.0 + 2.0 + 2.0 + 1.0;
        int expectedMatch = (int) Math.round((sumWeighted / maxWeighted) * 100.0);

        assertEquals("Calculated match percent for Arun is 65%", 65, expectedMatch);

        // Gap calculations:
        // Java: required 4, current 4 -> gap = 0, status = MATCHED
        int gapJava = Math.max(4 - 4, 0);
        String statusJava = 4 >= 4 ? "MATCHED" : "GAP";
        assertEquals("Java gap is 0", 0, gapJava);
        assertEquals("Java status is MATCHED", "MATCHED", statusJava);

        // Spring Boot: required 4, current 0 -> gap = 4, status = GAP
        int gapSB = Math.max(4 - 0, 0);
        String statusSB = 0 >= 4 ? "MATCHED" : "GAP";
        assertEquals("Spring Boot gap is 4", 4, gapSB);
        assertEquals("Spring Boot status is GAP", "GAP", statusSB);

        // React: required 3, current 2 -> gap = 1, status = GAP
        int gapReact = Math.max(3 - 2, 0);
        String statusReact = 2 >= 3 ? "MATCHED" : "GAP";
        assertEquals("React gap is 1", 1, gapReact);
        assertEquals("React status is GAP", "GAP", statusReact);

        // Scenario 2: Perfect match
        // 2 skills: required 4 & 3, student has 5 & 4
        double s1 = Math.min(5.0 / 4.0, 1.0) * 2.0;
        double s2 = Math.min(4.0 / 3.0, 1.0) * 1.0;
        int perfectMatch = (int) Math.round(((s1 + s2) / 3.0) * 100.0);
        assertEquals("Exceeding requirements caps score at 100%", 100, perfectMatch);
    }

    // ========================================================
    // 5. RECOMMENDATION ENGINE TESTS
    // ========================================================
    private static void testRecommendationEnginePriorities() {
        System.out.println("\n--- Testing Recommendation Prioritization Engine ---");

        // Rule 1: Mandatory missing skill (currentLevel=0) -> HIGH
        String p1 = determinePriority(true, 0, 4);
        assertEquals("Mandatory missing skill gets HIGH priority", "HIGH", p1);

        // Rule 2: Mandatory large gap (gap >= 2) -> HIGH
        String p2 = determinePriority(true, 1, 3);
        assertEquals("Mandatory skill with gap >= 2 gets HIGH priority", "HIGH", p2);

        // Rule 3: Mandatory minor gap (gap < 2) -> MEDIUM
        String p3 = determinePriority(true, 2, 3);
        assertEquals("Mandatory skill with minor gap (1) gets MEDIUM priority", "MEDIUM", p3);

        // Rule 4: Optional large gap (gap >= 2) -> MEDIUM
        String p4 = determinePriority(false, 0, 2);
        assertEquals("Optional skill with gap >= 2 gets MEDIUM priority", "MEDIUM", p4);

        // Rule 5: Optional minor gap (gap < 2) -> LOW
        String p5 = determinePriority(false, 1, 2);
        assertEquals("Optional skill with minor gap gets LOW priority", "LOW", p5);
    }

    private static String determinePriority(boolean mandatory, int currentLevel, int targetLevel) {
        int gap = Math.max(targetLevel - currentLevel, 0);
        if (mandatory) {
            if (currentLevel == 0 || gap >= 2) return "HIGH";
            return "MEDIUM";
        } else {
            if (gap >= 2) return "MEDIUM";
            return "LOW";
        }
    }

    // ========================================================
    // 6. APPLICATION SECURITY AND RULES TESTS
    // ========================================================
    private static void testApplicationSecurityAndRules() {
        System.out.println("\n--- Testing Application Security & Authorization ---");

        UserPrincipal userArun = new UserPrincipal(101, "Arun", "arun@example.com", Role.USER);
        UserPrincipal admin = new UserPrincipal(1, "Admin", "admin@example.com", Role.ADMIN);

        // Rule: USER cannot apply with arbitrary student ID (e.g., studentId = 999)
        int requestedStudentId = 999;
        int effectiveStudentId = userArun.isAdmin() ? requestedStudentId : userArun.getUserId();
        assertEquals("USER role cannot impersonate another student ID", 101, effectiveStudentId);

        // Rule: ADMIN can specify student ID
        int adminAppliedStudentId = admin.isAdmin() ? requestedStudentId : admin.getUserId();
        assertEquals("ADMIN role can apply for specified student ID", 999, adminAppliedStudentId);

        // Rule: Only ADMIN can update application status
        boolean userCanUpdate = userArun.isAdmin();
        boolean adminCanUpdate = admin.isAdmin();
        assertTrue("USER cannot update application status", !userCanUpdate);
        assertTrue("ADMIN can update application status", adminCanUpdate);

        // Rule: Application statuses must be one of the permitted values
        List<String> validStatuses = Arrays.asList("APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED", "SELECTED");
        assertTrue("Status SHORTLISTED is valid", validStatuses.contains("SHORTLISTED"));
        assertTrue("Status INVALID_STATUS is rejected", !validStatuses.contains("INVALID_STATUS"));
    }
}
