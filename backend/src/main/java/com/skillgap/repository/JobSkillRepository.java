package com.skillgap.repository;

import com.skillgap.config.DatabaseConfig;
import com.skillgap.exception.DatabaseException;
import com.skillgap.model.JobSkill;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class JobSkillRepository {

    private final DatabaseConfig dbConfig;

    public JobSkillRepository(DatabaseConfig dbConfig) {
        this.dbConfig = dbConfig;
    }

    public List<JobSkill> findByJobId(int jobId) {
        String sql = "SELECT js.job_id, js.skill_id, js.required_level, js.mandatory, s.name AS skill_name, s.category " +
                     "FROM job_skills js " +
                     "JOIN skills s ON js.skill_id = s.skill_id " +
                     "WHERE js.job_id = ? " +
                     "ORDER BY js.mandatory DESC, s.name ASC";
        List<JobSkill> list = new ArrayList<>();
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, jobId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(new JobSkill(
                            rs.getInt("job_id"),
                            rs.getInt("skill_id"),
                            rs.getInt("required_level"),
                            rs.getBoolean("mandatory"),
                            rs.getString("skill_name"),
                            rs.getString("category")
                    ));
                }
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to get skill requirements for job: " + jobId, e);
        }
    }

    public JobSkill findByJobAndSkill(int jobId, int skillId) {
        String sql = "SELECT js.job_id, js.skill_id, js.required_level, js.mandatory, s.name AS skill_name, s.category " +
                     "FROM job_skills js " +
                     "JOIN skills s ON js.skill_id = s.skill_id " +
                     "WHERE js.job_id = ? AND js.skill_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, jobId);
            ps.setInt(2, skillId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new JobSkill(
                            rs.getInt("job_id"),
                            rs.getInt("skill_id"),
                            rs.getInt("required_level"),
                            rs.getBoolean("mandatory"),
                            rs.getString("skill_name"),
                            rs.getString("category")
                    );
                }
            }
            return null;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find job skill: " + jobId + ", skill: " + skillId, e);
        }
    }

    public JobSkill upsert(int jobId, int skillId, int requiredLevel, boolean mandatory) {
        String sql = "INSERT INTO job_skills (job_id, skill_id, required_level, mandatory) VALUES (?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE required_level = VALUES(required_level), mandatory = VALUES(mandatory)";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, jobId);
            ps.setInt(2, skillId);
            ps.setInt(3, requiredLevel);
            ps.setBoolean(4, mandatory);
            ps.executeUpdate();
            return findByJobAndSkill(jobId, skillId);
        } catch (SQLException e) {
            throw new DatabaseException("Failed to add/update job skill requirement", e);
        }
    }

    public boolean delete(int jobId, int skillId) {
        String sql = "DELETE FROM job_skills WHERE job_id = ? AND skill_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, jobId);
            ps.setInt(2, skillId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to delete job skill requirement", e);
        }
    }
}
