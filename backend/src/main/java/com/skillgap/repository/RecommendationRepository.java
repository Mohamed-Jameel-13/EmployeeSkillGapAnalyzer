package com.skillgap.repository;

import com.skillgap.config.DatabaseConfig;
import com.skillgap.dto.TopSkillGapDto;
import com.skillgap.exception.DatabaseException;
import com.skillgap.model.Recommendation;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class RecommendationRepository {

    private final DatabaseConfig dbConfig;

    public RecommendationRepository(DatabaseConfig dbConfig) {
        this.dbConfig = dbConfig;
    }

    public List<Recommendation> findByStudentAndJob(int studentId, int jobId) {
        String sql = "SELECT r.id, r.student_id, r.job_id, r.skill_id, r.priority, r.reason, s.name AS skill_name " +
                     "FROM recommendations r " +
                     "JOIN skills s ON r.skill_id = s.skill_id " +
                     "WHERE r.student_id = ? AND r.job_id = ? " +
                     "ORDER BY CASE r.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END, s.name ASC";
        List<Recommendation> list = new ArrayList<>();
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ps.setInt(2, jobId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Recommendation rec = new Recommendation(
                            rs.getInt("id"),
                            rs.getInt("student_id"),
                            rs.getInt("job_id"),
                            rs.getInt("skill_id"),
                            rs.getString("priority"),
                            rs.getString("reason")
                    );
                    rec.setSkillName(rs.getString("skill_name"));
                    list.add(rec);
                }
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to query recommendations for student: " + studentId + ", job: " + jobId, e);
        }
    }

    /**
     * Atomically replaces recommendations for a (student_id, job_id) pair using a single JDBC transaction.
     */
    public void replaceRecommendations(int studentId, int jobId, List<Recommendation> recommendations) {
        String deleteSql = "DELETE FROM recommendations WHERE student_id = ? AND job_id = ?";
        String insertSql = "INSERT INTO recommendations (student_id, job_id, skill_id, priority, reason) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = dbConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                // 1. Delete outdated recommendations
                try (PreparedStatement delPs = conn.prepareStatement(deleteSql)) {
                    delPs.setInt(1, studentId);
                    delPs.setInt(2, jobId);
                    delPs.executeUpdate();
                }

                // 2. Insert current recommendations
                if (recommendations != null && !recommendations.isEmpty()) {
                    try (PreparedStatement insPs = conn.prepareStatement(insertSql)) {
                        for (Recommendation rec : recommendations) {
                            insPs.setInt(1, studentId);
                            insPs.setInt(2, jobId);
                            insPs.setInt(3, rec.getSkillId());
                            insPs.setString(4, rec.getPriority());
                            insPs.setString(5, rec.getReason());
                            insPs.addBatch();
                        }
                        insPs.executeBatch();
                    }
                }

                // Commit transaction atomically
                conn.commit();
            } catch (SQLException ex) {
                conn.rollback();
                throw new DatabaseException("Transaction failed: rolled back recommendations refresh", ex);
            } finally {
                conn.setAutoCommit(true);
            }
        } catch (SQLException e) {
            throw new DatabaseException("Database error during recommendations refresh", e);
        }
    }

    /**
     * Aggregates the most common skill gaps from the persisted recommendations.
     */
    public List<TopSkillGapDto> getTopSkillGaps(int limit) {
        String sql = "SELECT r.skill_id, s.name AS skill_name, COUNT(*) AS gap_count " +
                     "FROM recommendations r " +
                     "JOIN skills s ON r.skill_id = s.skill_id " +
                     "GROUP BY r.skill_id, s.name " +
                     "ORDER BY gap_count DESC, s.name ASC " +
                     "LIMIT ?";
        List<TopSkillGapDto> list = new ArrayList<>();
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit > 0 ? limit : 5);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(new TopSkillGapDto(
                            rs.getInt("skill_id"),
                            rs.getString("skill_name"),
                            rs.getInt("gap_count")
                    ));
                }
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to get top skill gaps", e);
        }
    }
}
