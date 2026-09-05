package com.skillgap.repository;

import com.skillgap.config.DatabaseConfig;
import com.skillgap.exception.DatabaseException;
import com.skillgap.model.Application;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ApplicationRepository {

    private final DatabaseConfig dbConfig;

    public ApplicationRepository(DatabaseConfig dbConfig) {
        this.dbConfig = dbConfig;
    }

    public Application create(Application app) {
        String sql = "INSERT INTO applications (student_id, job_id, match_percent, status) VALUES (?, ?, ?, ?)";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, app.getStudentId());
            ps.setInt(2, app.getJobId());
            ps.setInt(3, app.getMatchPercent());
            ps.setString(4, app.getStatus() != null ? app.getStatus() : "APPLIED");
            ps.executeUpdate();
            try (ResultSet gk = ps.getGeneratedKeys()) {
                if (gk.next()) {
                    app.setApplicationId(gk.getInt(1));
                }
            }
            return findById(app.getApplicationId());
        } catch (SQLException e) {
            throw new DatabaseException("Failed to create application", e);
        }
    }

    public Application findById(int applicationId) {
        String sql = "SELECT a.application_id, a.student_id, a.job_id, a.match_percent, a.status, a.created_at, " +
                     "s.name AS student_name, s.email AS student_email, " +
                     "j.title AS job_title, j.company AS job_company, j.location AS job_location " +
                     "FROM applications a " +
                     "JOIN students s ON a.student_id = s.student_id " +
                     "JOIN jobs j ON a.job_id = j.job_id " +
                     "WHERE a.application_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, applicationId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapJoinedRow(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find application by ID: " + applicationId, e);
        }
    }

    public Application findByStudentAndJob(int studentId, int jobId) {
        String sql = "SELECT a.application_id, a.student_id, a.job_id, a.match_percent, a.status, a.created_at, " +
                     "s.name AS student_name, s.email AS student_email, " +
                     "j.title AS job_title, j.company AS job_company, j.location AS job_location " +
                     "FROM applications a " +
                     "JOIN students s ON a.student_id = s.student_id " +
                     "JOIN jobs j ON a.job_id = j.job_id " +
                     "WHERE a.student_id = ? AND a.job_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ps.setInt(2, jobId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapJoinedRow(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to query application for student: " + studentId + ", job: " + jobId, e);
        }
    }

    public List<Application> findAll() {
        String sql = "SELECT a.application_id, a.student_id, a.job_id, a.match_percent, a.status, a.created_at, " +
                     "s.name AS student_name, s.email AS student_email, " +
                     "j.title AS job_title, j.company AS job_company, j.location AS job_location " +
                     "FROM applications a " +
                     "JOIN students s ON a.student_id = s.student_id " +
                     "JOIN jobs j ON a.job_id = j.job_id " +
                     "ORDER BY a.created_at DESC";
        List<Application> list = new ArrayList<>();
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapJoinedRow(rs));
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to list applications", e);
        }
    }

    public List<Application> findByStudentId(int studentId) {
        String sql = "SELECT a.application_id, a.student_id, a.job_id, a.match_percent, a.status, a.created_at, " +
                     "s.name AS student_name, s.email AS student_email, " +
                     "j.title AS job_title, j.company AS job_company, j.location AS job_location " +
                     "FROM applications a " +
                     "JOIN students s ON a.student_id = s.student_id " +
                     "JOIN jobs j ON a.job_id = j.job_id " +
                     "WHERE a.student_id = ? " +
                     "ORDER BY a.created_at DESC";
        List<Application> list = new ArrayList<>();
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapJoinedRow(rs));
                }
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to list applications for student: " + studentId, e);
        }
    }

    public boolean updateStatus(int applicationId, String status) {
        String sql = "UPDATE applications SET status = ? WHERE application_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, applicationId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to update application status: " + applicationId, e);
        }
    }

    public int countApplications() {
        String sql = "SELECT COUNT(*) FROM applications";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
            return 0;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to count applications", e);
        }
    }

    public double getAverageMatchPercent() {
        String sql = "SELECT COALESCE(AVG(match_percent), 0) FROM applications";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getDouble(1);
            }
            return 0.0;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to get average match percent", e);
        }
    }

    private Application mapJoinedRow(ResultSet rs) throws SQLException {
        Application app = new Application(
                rs.getInt("application_id"),
                rs.getInt("student_id"),
                rs.getInt("job_id"),
                rs.getInt("match_percent"),
                rs.getString("status"),
                rs.getTimestamp("created_at")
        );
        app.setStudentName(rs.getString("student_name"));
        app.setStudentEmail(rs.getString("student_email"));
        app.setJobTitle(rs.getString("job_title"));
        app.setJobCompany(rs.getString("job_company"));
        app.setJobLocation(rs.getString("job_location"));
        return app;
    }
}
