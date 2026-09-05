package com.skillgap.controller;

import com.skillgap.dto.SkillGapResponse;
import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;
import com.skillgap.security.SecurityContext;
import com.skillgap.service.SkillGapService;

public class SkillGapController {

    private final SkillGapService skillGapService;

    public SkillGapController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    public HttpResponse analyze(RequestContext ctx) {
        int studentId = ctx.getIntPathParam("studentId");
        int jobId = ctx.getIntPathParam("jobId");

        // Authorization: Admin can analyze any student; a normal user can only analyze their own gap
        SecurityContext.requireAdminOrOwner(studentId);

        SkillGapResponse response = skillGapService.analyzeSkillGap(studentId, jobId);
        return HttpResponse.ok(response);
    }
}
