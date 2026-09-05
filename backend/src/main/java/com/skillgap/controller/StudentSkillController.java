package com.skillgap.controller;

import com.skillgap.dto.StudentSkillRequest;
import com.skillgap.exception.ValidationException;
import com.skillgap.model.StudentSkill;
import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;
import com.skillgap.security.SecurityContext;
import com.skillgap.service.StudentService;
import com.skillgap.util.JsonUtil;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public class StudentSkillController {

    private final StudentService studentService;

    public StudentSkillController(StudentService studentService) {
        this.studentService = studentService;
    }

    public HttpResponse getSkills(RequestContext ctx) {
        int studentId = ctx.getIntPathParam("id");
        SecurityContext.requireAdminOrOwner(studentId);
        List<StudentSkill> skills = studentService.getStudentSkills(studentId, ctx.getUserPrincipal());
        return HttpResponse.ok(skills);
    }

    public HttpResponse addOrUpdateSkill(RequestContext ctx) {
        int studentId = ctx.getIntPathParam("id");
        SecurityContext.requireAdminOrOwner(studentId);

        if (ctx.getBody() == null || ctx.getBody().trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty");
        }
        Map<String, Object> map = JsonUtil.parseObject(ctx.getBody());
        Integer skillId = JsonUtil.getInteger(map, "skillId");
        String skillName = JsonUtil.getString(map, "skillName");
        Integer proficiency = JsonUtil.getInteger(map, "proficiency");

        StudentSkillRequest req = new StudentSkillRequest(skillId, skillName, proficiency);
        StudentSkill result = studentService.addOrUpdateStudentSkill(studentId, req, ctx.getUserPrincipal());
        return HttpResponse.ok(result);
    }

    public HttpResponse deleteSkill(RequestContext ctx) {
        int studentId = ctx.getIntPathParam("id");
        int skillId = ctx.getIntPathParam("skillId");
        SecurityContext.requireAdminOrOwner(studentId);

        studentService.deleteStudentSkill(studentId, skillId, ctx.getUserPrincipal());
        return HttpResponse.ok(Collections.singletonMap("message", "Skill removed successfully"));
    }
}
