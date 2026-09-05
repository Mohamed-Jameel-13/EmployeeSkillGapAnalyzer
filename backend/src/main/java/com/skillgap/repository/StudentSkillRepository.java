package com.skillgap.repository;

import com.skillgap.config.DatabaseConfig;
import com.skillgap.exception.DatabaseException;
import com.skillgap.model.StudentSkill;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class StudentSkillRepository {

    private final DatabaseConfig dbConfig;

    public StudentSkillRepository(DatabaseConfig dbConfig) {
        this.dbConfig = dbConfig;
    }

    public List<StudentSkill> findByStudentId(int studentId) {
        String sql = "SELECT ss.student_id, ss.skill_id, ss.proficiency, s.name AS skill_name, s.category " +
                     "FROM student_skills ss " +
                     "JOIN skills s ON ss.skill_id = s.skill_id " +
                     "WHERE ss.student_id = ? " +
                     "ORDER BY s.name ASC";
        List<StudentSkill> list = new ArrayList<>();
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(new StudentSkill(
                            rs.getInt("student_id"),
                            rs.getInt("skill_id"),
                            rs.getInt("proficiency"),
                            rs.getString("skill_name"),
                            rs.getString("category")
                    ));
                }
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to get skills for student: " + studentId, e);
        }
    }

    public StudentSkill findByStudentAndSkill(int studentId, int skillId) {
        String sql = "SELECT ss.student_id, ss.skill_id, ss.proficiency, s.name AS skill_name, s.category " +
                     "FROM student_skills ss " +
                     "JOIN skills s ON ss.skill_id = s.skill_id " +
                     "WHERE ss.student_id = ? AND ss.skill_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ps.setInt(2, skillId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new StudentSkill(
                            rs.getInt("student_id"),
                            rs.getInt("skill_id"),
                            rs.getInt("proficiency"),
                            rs.getString("skill_name"),
                            rs.getString("category")
                    );
                }
            }
            return null;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find student skill: " + studentId + ", skill: " + skillId, e);
        }
    }

    public StudentSkill upsert(int studentId, int skillId, int proficiency) {
        String sql = "INSERT INTO student_skills (student_id, skill_id, proficiency) VALUES (?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE proficiency = VALUES(proficiency)";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ps.setInt(2, skillId);
            ps.setInt(3, proficiency);
            ps.executeUpdate();
            return findByStudentAndSkill(studentId, skillId);
        } catch (SQLException e) {
            throw new DatabaseException("Failed to add/update student skill", e);
        }
    }

    public boolean delete(int studentId, int skillId) {
        String sql = "DELETE FROM student_skills WHERE student_id = ? AND skill_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            ps.setInt(2, skillId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to delete student skill", e);
        }
    }
}
