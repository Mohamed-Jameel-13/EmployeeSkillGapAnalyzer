package com.skillgap.service;

import com.skillgap.dto.AuthResponse;
import com.skillgap.dto.LoginRequest;
import com.skillgap.dto.UserDto;
import com.skillgap.exception.ForbiddenException;
import com.skillgap.exception.UnauthorizedException;
import com.skillgap.exception.ValidationException;
import com.skillgap.model.Student;
import com.skillgap.repository.StudentRepository;
import com.skillgap.security.PasswordUtil;
import com.skillgap.security.Role;
import com.skillgap.security.TokenService;
import com.skillgap.security.UserPrincipal;

public class AuthService {

    private final StudentRepository studentRepository;
    private final TokenService tokenService;

    public AuthService(StudentRepository studentRepository, TokenService tokenService) {
        this.studentRepository = studentRepository;
        this.tokenService = tokenService;
    }

    public AuthResponse loginAdmin(LoginRequest request) {
        validateLoginRequest(request);

        Student student = studentRepository.findByEmail(request.getEmail().trim());
        if (student == null || !PasswordUtil.verify(request.getPassword(), student.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!"ADMIN".equalsIgnoreCase(student.getRole())) {
            throw new ForbiddenException("Access denied: You do not have administrator permissions");
        }

        UserPrincipal principal = new UserPrincipal(
                student.getStudentId(),
                student.getName(),
                student.getEmail(),
                Role.ADMIN
        );
        String token = tokenService.createToken(principal);

        return new AuthResponse(
                token,
                new UserDto(student.getStudentId(), student.getName(), student.getEmail(), student.getRole())
        );
    }

    public AuthResponse loginUser(LoginRequest request) {
        validateLoginRequest(request);

        Student student = studentRepository.findByEmail(request.getEmail().trim());
        if (student == null || !PasswordUtil.verify(request.getPassword(), student.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!"USER".equalsIgnoreCase(student.getRole()) && !"ADMIN".equalsIgnoreCase(student.getRole())) {
            throw new ForbiddenException("Invalid account role");
        }

        Role role = Role.fromString(student.getRole());
        UserPrincipal principal = new UserPrincipal(
                student.getStudentId(),
                student.getName(),
                student.getEmail(),
                role
        );
        String token = tokenService.createToken(principal);

        return new AuthResponse(
                token,
                new UserDto(student.getStudentId(), student.getName(), student.getEmail(), student.getRole())
        );
    }

    public void logout(String token) {
        if (token != null) {
            tokenService.revokeToken(token);
        }
    }

    public UserDto getCurrentUser(UserPrincipal principal) {
        if (principal == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        Student s = studentRepository.findById(principal.getUserId());
        if (s == null) {
            throw new UnauthorizedException("User record not found");
        }
        return new UserDto(s.getStudentId(), s.getName(), s.getEmail(), s.getRole());
    }

    private void validateLoginRequest(LoginRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ValidationException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new ValidationException("Password is required");
        }
    }
}
