package com.skillgap.repository;

import com.skillgap.config.DatabaseConfig;
import com.skillgap.exception.DatabaseException;
import com.skillgap.model.Student;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class StudentRepository {

    private final DatabaseConfig dbConfig;

    public StudentRepository(DatabaseConfig dbConfig) {
        this.dbConfig = dbConfig;
    }

    public Student findById(int studentId) {
        String sql = "SELECT student_id, name, email, password_hash, role, created_at FROM students WHERE student_id = ?";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, studentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find student by ID: " + studentId, e);
        }
    }

    public Student findByEmail(String email) {
        String sql = "SELECT student_id, name, email, password_hash, role, created_at FROM students WHERE LOWER(email) = LOWER(?)";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
            return null;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to find student by email: " + email, e);
        }
    }

    public List<Student> findAll() {
        String sql = "SELECT student_id, name, email, password_hash, role, created_at FROM students ORDER BY student_id ASC";
        List<Student> list = new ArrayList<>();
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
            return list;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to list students", e);
        }
    }

    public Student create(Student student) {
        String sql = "INSERT INTO students (name, email, password_hash, role) VALUES (?, ?, ?, ?)";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, student.getName());
            ps.setString(2, student.getEmail());
            ps.setString(3, student.getPasswordHash());
            ps.setString(4, student.getRole() != null ? student.getRole() : "USER");
            ps.executeUpdate();
            try (ResultSet gk = ps.getGeneratedKeys()) {
                if (gk.next()) {
                    student.setStudentId(gk.getInt(1));
                }
            }
            return student;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to create student: " + student.getEmail(), e);
        }
    }

    public Student update(Student student) {
        StringBuilder sql = new StringBuilder("UPDATE students SET name = ?, email = ?");
        boolean updatePassword = student.getPasswordHash() != null && !student.getPasswordHash().isEmpty();
        if (updatePassword) {
            sql.append(", password_hash = ?");
        }
        sql.append(" WHERE student_id = ?");

        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            int paramIdx = 1;
            ps.setString(paramIdx++, student.getName());
            ps.setString(paramIdx++, student.getEmail());
            if (updatePassword) {
                ps.setString(paramIdx++, student.getPasswordHash());
            }
            ps.setInt(paramIdx, student.getStudentId());
            ps.executeUpdate();
            return findById(student.getStudentId());
        } catch (SQLException e) {
            throw new DatabaseException("Failed to update student: " + student.getStudentId(), e);
        }
    }

    public int countStudents() {
        String sql = "SELECT COUNT(*) FROM students WHERE role = 'USER'";
        try (Connection conn = dbConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
            return 0;
        } catch (SQLException e) {
            throw new DatabaseException("Failed to count students", e);
        }
    }

    private Student mapRow(ResultSet rs) throws SQLException {
        return new Student(
                rs.getInt("student_id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("password_hash"),
                rs.getString("role"),
                rs.getTimestamp("created_at")
        );
    }
}
