package com.skillgap.controller;

import com.skillgap.dto.JobSkillDto;
import com.skillgap.dto.JobSkillRequest;
import com.skillgap.exception.ValidationException;
import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;
import com.skillgap.security.SecurityContext;
import com.skillgap.service.JobService;
import com.skillgap.util.JsonUtil;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public class JobSkillController {

    private final JobService jobService;

    public JobSkillController(JobService jobService) {
        this.jobService = jobService;
    }

    public HttpResponse getJobSkills(RequestContext ctx) {
        int jobId = ctx.getIntPathParam("id");
        List<JobSkillDto> skills = jobService.getJobSkills(jobId);
        return HttpResponse.ok(skills);
    }

    public HttpResponse addOrUpdateJobSkill(RequestContext ctx) {
        SecurityContext.requireAdmin();
        int jobId = ctx.getIntPathParam("id");
        if (ctx.getBody() == null || ctx.getBody().trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty");
        }
        Map<String, Object> map = JsonUtil.parseObject(ctx.getBody());
        Integer skillId = JsonUtil.getInteger(map, "skillId");
        String skillName = JsonUtil.getString(map, "skillName");
        Integer requiredLevel = JsonUtil.getInteger(map, "requiredLevel");
        Boolean mandatory = JsonUtil.getBoolean(map, "mandatory");

        JobSkillRequest req = new JobSkillRequest(skillId, skillName, requiredLevel, mandatory != null ? mandatory : true);
        JobSkillDto result = jobService.addOrUpdateJobSkill(jobId, req, ctx.getUserPrincipal());
        return HttpResponse.ok(result);
    }

    public HttpResponse deleteJobSkill(RequestContext ctx) {
        SecurityContext.requireAdmin();
        int jobId = ctx.getIntPathParam("id");
        int skillId = ctx.getIntPathParam("skillId");
        jobService.deleteJobSkill(jobId, skillId, ctx.getUserPrincipal());
        return HttpResponse.ok(Collections.singletonMap("message", "Job requirement removed successfully"));
    }
}
