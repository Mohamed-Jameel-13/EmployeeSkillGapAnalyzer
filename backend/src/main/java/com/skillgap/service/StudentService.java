package com.skillgap.service;

import com.skillgap.dto.CreateStudentRequest;
import com.skillgap.dto.StudentSkillRequest;
import com.skillgap.dto.UpdateStudentRequest;
import com.skillgap.dto.UserDto;
import com.skillgap.exception.ConflictException;
import com.skillgap.exception.ForbiddenException;
import com.skillgap.exception.NotFoundException;
import com.skillgap.exception.ValidationException;
import com.skillgap.model.Skill;
import com.skillgap.model.Student;
import com.skillgap.model.StudentSkill;
import com.skillgap.repository.SkillRepository;
import com.skillgap.repository.StudentRepository;
import com.skillgap.repository.StudentSkillRepository;
import com.skillgap.security.PasswordUtil;
import com.skillgap.security.UserPrincipal;

import java.util.ArrayList;
import java.util.List;

public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillRepository skillRepository;

    public StudentService(StudentRepository studentRepository,
                          StudentSkillRepository studentSkillRepository,
                          SkillRepository skillRepository) {
        this.studentRepository = studentRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.skillRepository = skillRepository;
    }

    public List<UserDto> getAllStudents(UserPrincipal currentUser) {
        requireAdmin(currentUser);
        List<Student> students = studentRepository.findAll();
        List<UserDto> dtos = new ArrayList<>();
        for (Student s : students) {
            dtos.add(new UserDto(s.getStudentId(), s.getName(), s.getEmail(), s.getRole()));
        }
        return dtos;
    }

    public UserDto getStudentById(int studentId, UserPrincipal currentUser) {
        requireAdminOrOwner(currentUser, studentId);
        Student s = studentRepository.findById(studentId);
        if (s == null) {
            throw new NotFoundException("Student not found with ID: " + studentId);
        }
        return new UserDto(s.getStudentId(), s.getName(), s.getEmail(), s.getRole());
    }

    public UserDto createStudent(CreateStudentRequest request, UserPrincipal currentUser) {
        requireAdmin(currentUser);
        if (request == null) {
            throw new ValidationException("Request body cannot be empty");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ValidationException("Student name is required");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty() || !request.getEmail().contains("@")) {
            throw new ValidationException("Valid student email is required");
        }
        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : "password";

        if (rawPassword.length() < 4) {
            throw new ValidationException("Password must be at least 4 characters long");
        }

        Student existing = studentRepository.findByEmail(request.getEmail().trim());
        if (existing != null) {
            throw new ConflictException("A student or user with email " + request.getEmail() + " already exists");
        }

        String role = (request.getRole() != null && "ADMIN".equalsIgnoreCase(request.getRole().trim())) ? "ADMIN" : "USER";
        String passwordHash = PasswordUtil.hash(rawPassword);

        Student s = new Student();
        s.setName(request.getName().trim());
        s.setEmail(request.getEmail().trim());
        s.setPasswordHash(passwordHash);
        s.setRole(role);

        Student created = studentRepository.create(s);
        return new UserDto(created.getStudentId(), created.getName(), created.getEmail(), created.getRole());
    }

    public UserDto updateStudent(int studentId, UpdateStudentRequest request, UserPrincipal currentUser) {
        requireAdminOrOwner(currentUser, studentId);
        Student s = studentRepository.findById(studentId);
        if (s == null) {
            throw new NotFoundException("Student not found with ID: " + studentId);
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            s.setName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            Student existing = studentRepository.findByEmail(request.getEmail().trim());
            if (existing != null && existing.getStudentId() != studentId) {
                throw new ConflictException("Email " + request.getEmail() + " is already in use by another user");
            }
            s.setEmail(request.getEmail().trim());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            if (request.getPassword().length() < 4) {
                throw new ValidationException("Password must be at least 4 characters long");
            }
            s.setPasswordHash(PasswordUtil.hash(request.getPassword()));
        }

        Student updated = studentRepository.update(s);
        return new UserDto(updated.getStudentId(), updated.getName(), updated.getEmail(), updated.getRole());
    }

    // Student Skills
    public List<StudentSkill> getStudentSkills(int studentId, UserPrincipal currentUser) {
        requireAdminOrOwner(currentUser, studentId);
        Student s = studentRepository.findById(studentId);
        if (s == null) {
            throw new NotFoundException("Student not found with ID: " + studentId);
        }
        return studentSkillRepository.findByStudentId(studentId);
    }

    public StudentSkill addOrUpdateStudentSkill(int studentId, StudentSkillRequest request, UserPrincipal currentUser) {
        requireAdminOrOwner(currentUser, studentId);
        Student s = studentRepository.findById(studentId);
        if (s == null) {
            throw new NotFoundException("Student not found with ID: " + studentId);
        }

        if (request == null) {
            throw new ValidationException("Skill request cannot be empty");
        }
        if (request.getProficiency() == null || request.getProficiency() < 1 || request.getProficiency() > 5) {
            throw new ValidationException("Proficiency must be between 1 and 5");
        }

        Skill skill = null;
        if (request.getSkillId() != null) {
            skill = skillRepository.findById(request.getSkillId());
        }
        if (skill == null && request.getSkillName() != null && !request.getSkillName().trim().isEmpty()) {
            skill = skillRepository.findByName(request.getSkillName().trim());
            if (skill == null) {
                skill = skillRepository.create(new Skill(0, request.getSkillName().trim(), "General"));
            }
        }

        if (skill == null) {
            throw new ValidationException("Skill ID or a valid Skill Name is required");
        }

        return studentSkillRepository.upsert(studentId, skill.getSkillId(), request.getProficiency());
    }

    public boolean deleteStudentSkill(int studentId, int skillId, UserPrincipal currentUser) {
        requireAdminOrOwner(currentUser, studentId);
        Student s = studentRepository.findById(studentId);
        if (s == null) {
            throw new NotFoundException("Student not found with ID: " + studentId);
        }
        return studentSkillRepository.delete(studentId, skillId);
    }

    public boolean deleteStudent(int studentId, UserPrincipal currentUser) {
        requireAdmin(currentUser);
        Student s = studentRepository.findById(studentId);
        if (s == null) {
            throw new NotFoundException("Student not found with ID: " + studentId);
        }
        return studentRepository.delete(studentId);
    }

    private void requireAdmin(UserPrincipal currentUser) {
        if (currentUser == null || !currentUser.isAdmin()) {
            throw new ForbiddenException("Access denied: Administrative privilege required");
        }
    }

    private void requireAdminOrOwner(UserPrincipal currentUser, int studentId) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required");
        }
        if (currentUser.isAdmin()) {
            return;
        }
        if (currentUser.getUserId() != studentId) {
            throw new ForbiddenException("Access denied: You cannot view or modify another student's profile or skills");
        }
    }
}
