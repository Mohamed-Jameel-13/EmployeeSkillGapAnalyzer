package com.skillgap.controller;

import com.skillgap.dto.CreateStudentRequest;
import com.skillgap.dto.UpdateStudentRequest;
import com.skillgap.dto.UserDto;
import com.skillgap.exception.ValidationException;
import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;
import com.skillgap.security.SecurityContext;
import com.skillgap.service.StudentService;
import com.skillgap.util.JsonUtil;

import java.util.List;
import java.util.Map;

public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    public HttpResponse getAllStudents(RequestContext ctx) {
        SecurityContext.requireAdmin();
        List<UserDto> students = studentService.getAllStudents(ctx.getUserPrincipal());
        return HttpResponse.ok(students);
    }

    public HttpResponse getStudentById(RequestContext ctx) {
        int studentId = ctx.getIntPathParam("id");
        SecurityContext.requireAdminOrOwner(studentId);
        UserDto student = studentService.getStudentById(studentId, ctx.getUserPrincipal());
        return HttpResponse.ok(student);
    }

    public HttpResponse createStudent(RequestContext ctx) {
        SecurityContext.requireAdmin();
        if (ctx.getBody() == null || ctx.getBody().trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty");
        }
        Map<String, Object> map = JsonUtil.parseObject(ctx.getBody());
        CreateStudentRequest req = new CreateStudentRequest(
                JsonUtil.getString(map, "name"),
                JsonUtil.getString(map, "email"),
                JsonUtil.getString(map, "password"),
                JsonUtil.getString(map, "role")
        );
        UserDto created = studentService.createStudent(req, ctx.getUserPrincipal());
        return HttpResponse.created(created);
    }

    public HttpResponse updateStudent(RequestContext ctx) {
        int studentId = ctx.getIntPathParam("id");
        SecurityContext.requireAdminOrOwner(studentId);
        if (ctx.getBody() == null || ctx.getBody().trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty");
        }
        Map<String, Object> map = JsonUtil.parseObject(ctx.getBody());
        UpdateStudentRequest req = new UpdateStudentRequest(
                JsonUtil.getString(map, "name"),
                JsonUtil.getString(map, "email"),
                JsonUtil.getString(map, "password")
        );
        UserDto updated = studentService.updateStudent(studentId, req, ctx.getUserPrincipal());
        return HttpResponse.ok(updated);
    }

    public HttpResponse deleteStudent(RequestContext ctx) {
        SecurityContext.requireAdmin();
        int studentId = ctx.getIntPathParam("id");
        studentService.deleteStudent(studentId, ctx.getUserPrincipal());
        return HttpResponse.ok(java.util.Collections.singletonMap("message", "Candidate deleted successfully"));
    }
}
