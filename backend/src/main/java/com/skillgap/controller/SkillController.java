package com.skillgap.controller;

import com.skillgap.dto.CreateSkillRequest;
import com.skillgap.dto.SkillDto;
import com.skillgap.exception.ValidationException;
import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;
import com.skillgap.security.SecurityContext;
import com.skillgap.service.SkillService;
import com.skillgap.util.JsonUtil;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    public HttpResponse getAllSkills(RequestContext ctx) {
        List<SkillDto> list = skillService.getAllSkills();
        return HttpResponse.ok(list);
    }

    public HttpResponse getSkillById(RequestContext ctx) {
        int id = ctx.getIntPathParam("id");
        SkillDto skill = skillService.getSkillById(id);
        return HttpResponse.ok(skill);
    }

    public HttpResponse createSkill(RequestContext ctx) {
        SecurityContext.requireAdmin();
        if (ctx.getBody() == null || ctx.getBody().trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty");
        }
        Map<String, Object> map = JsonUtil.parseObject(ctx.getBody());
        CreateSkillRequest req = new CreateSkillRequest(
                JsonUtil.getString(map, "name"),
                JsonUtil.getString(map, "category")
        );
        SkillDto created = skillService.createSkill(req, ctx.getUserPrincipal());
        return HttpResponse.created(created);
    }

    public HttpResponse updateSkill(RequestContext ctx) {
        SecurityContext.requireAdmin();
        int id = ctx.getIntPathParam("id");
        if (ctx.getBody() == null || ctx.getBody().trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty");
        }
        Map<String, Object> map = JsonUtil.parseObject(ctx.getBody());
        CreateSkillRequest req = new CreateSkillRequest(
                JsonUtil.getString(map, "name"),
                JsonUtil.getString(map, "category")
        );
        SkillDto updated = skillService.updateSkill(id, req, ctx.getUserPrincipal());
        return HttpResponse.ok(updated);
    }

    public HttpResponse deleteSkill(RequestContext ctx) {
        SecurityContext.requireAdmin();
        int id = ctx.getIntPathParam("id");
        skillService.deleteSkill(id, ctx.getUserPrincipal());
        return HttpResponse.ok(Collections.singletonMap("message", "Skill deleted successfully"));
    }
}
