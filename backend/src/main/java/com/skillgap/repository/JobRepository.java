package com.skillgap.repository;

import com.skillgap.config.DatabaseConfig;
import com.skillgap.exception.DatabaseException;
import com.skillgap.model.Job;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class JobRepository {

    private final DatabaseConfig dbConfig;

    public JobRepository(DatabaseConfig dbConfig) {
        this.dbConfig = dbConfig;
    }

    public List<Job> findAll() {
        String sql = "SELECT job_id, title, company, location, created_at FROM jobs ORDER BY job_id DESC";
        List<Job> list = new ArrayList<>();
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to list jobs", e);
        }
    }

    public Job findById(int jobId) {
        String sql = "SELECT job_id, title, company, location, created_at FROM jobs WHERE job_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, jobId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find job by ID: " + jobId, e);
        }
    }

    public Job create(Job job) {
        String sql = "INSERT INTO jobs (title, company, location) VALUES (?, ?, ?)";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, job.getTitle());
            ps.setString(2, job.getCompany());
            ps.setString(3, job.getLocation());
            ps.executeUpdate();
            try (ResultSet gk = ps.getGeneratedKeys()) {
                if (gk.next()) {
                    job.setJobId(gk.getInt(1));
                }
            }
            return job;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to create job", e);
        }
    }

    public Job update(Job job) {
        String sql = "UPDATE jobs SET title = ?, company = ?, location = ? WHERE job_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, job.getTitle());
            ps.setString(2, job.getCompany());
            ps.setString(3, job.getLocation());
            ps.setInt(4, job.getJobId());
            ps.executeUpdate();
            return job;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to update job: " + job.getJobId(), e);
        }
    }

    public boolean delete(int jobId) {
        String sql = "DELETE FROM jobs WHERE job_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, jobId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to delete job: " + jobId, e);
        }
    }

    public int countJobs() {
        String sql = "SELECT COUNT(*) FROM jobs";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
            return 0;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to count jobs", e);
        }
    }

    private Job mapRow(ResultSet rs) throws SQLException {
        return new Job(
                rs.getInt("job_id"),
                rs.getString("title"),
                rs.getString("company"),
                rs.getString("location"),
                rs.getTimestamp("created_at")
        );
    }
}
