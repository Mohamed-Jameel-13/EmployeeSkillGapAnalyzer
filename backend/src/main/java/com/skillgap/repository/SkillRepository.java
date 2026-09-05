package com.skillgap.repository;

import com.skillgap.config.DatabaseConfig;
import com.skillgap.exception.DatabaseException;
import com.skillgap.model.Skill;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SkillRepository {

    private final DatabaseConfig dbConfig;

    public SkillRepository(DatabaseConfig dbConfig) {
        this.dbConfig = dbConfig;
    }

    public List<Skill> findAll() {
        String sql = "SELECT skill_id, name, category FROM skills ORDER BY name ASC";
        List<Skill> list = new ArrayList<>();
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to list skills", e);
        }
    }

    public Skill findById(int skillId) {
        String sql = "SELECT skill_id, name, category FROM skills WHERE skill_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, skillId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find skill by ID: " + skillId, e);
        }
    }

    public Skill findByName(String name) {
        String sql = "SELECT skill_id, name, category FROM skills WHERE LOWER(name) = LOWER(?)";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, name);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find skill by name: " + name, e);
        }
    }

    public Skill create(Skill skill) {
        String sql = "INSERT INTO skills (name, category) VALUES (?, ?)";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, skill.getName());
            ps.setString(2, skill.getCategory());
            ps.executeUpdate();
            try (ResultSet gk = ps.getGeneratedKeys()) {
                if (gk.next()) {
                    skill.setSkillId(gk.getInt(1));
                }
            }
            return skill;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to create skill: " + skill.getName(), e);
        }
    }

    public Skill update(Skill skill) {
        String sql = "UPDATE skills SET name = ?, category = ? WHERE skill_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, skill.getName());
            ps.setString(2, skill.getCategory());
            ps.setInt(3, skill.getSkillId());
            ps.executeUpdate();
            return skill;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to update skill: " + skill.getSkillId(), e);
        }
    }

    public boolean delete(int skillId) {
        String sql = "DELETE FROM skills WHERE skill_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, skillId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to delete skill: " + skillId, e);
        }
    }

    private Skill mapRow(ResultSet rs) throws SQLException {
        return new Skill(
                rs.getInt("skill_id"),
                rs.getString("name"),
                rs.getString("category")
        );
    }
}
