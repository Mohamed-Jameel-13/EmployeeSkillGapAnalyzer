package com.skillgap.controller;

import com.skillgap.dto.ApplicationRequest;
import com.skillgap.dto.ApplicationResponse;
import com.skillgap.dto.UpdateStatusRequest;
import com.skillgap.exception.ValidationException;
import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;
import com.skillgap.security.SecurityContext;
import com.skillgap.security.UserPrincipal;
import com.skillgap.service.ApplicationService;
import com.skillgap.util.JsonUtil;

import java.util.List;
import java.util.Map;

public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    public HttpResponse apply(RequestContext ctx) {
        UserPrincipal currentUser = SecurityContext.requireAuthenticated();

        if (ctx.getBody() == null || ctx.getBody().trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty");
        }
        Map<String, Object> map = JsonUtil.parseObject(ctx.getBody());
        Integer studentId = JsonUtil.getInteger(map, "studentId");
        Integer jobId = JsonUtil.getInteger(map, "jobId");

        ApplicationRequest req = new ApplicationRequest(studentId, jobId);
        ApplicationResponse response = applicationService.apply(req, currentUser);
        return HttpResponse.created(response);
    }

    public HttpResponse listApplications(RequestContext ctx) {
        UserPrincipal currentUser = SecurityContext.requireAuthenticated();
        List<ApplicationResponse> list = applicationService.listApplications(currentUser);
        return HttpResponse.ok(list);
    }

    public HttpResponse getApplicationById(RequestContext ctx) {
        UserPrincipal currentUser = SecurityContext.requireAuthenticated();
        int applicationId = ctx.getIntPathParam("id");
        ApplicationResponse response = applicationService.getApplicationById(applicationId, currentUser);
        return HttpResponse.ok(response);
    }

    public HttpResponse updateStatus(RequestContext ctx) {
        UserPrincipal currentUser = SecurityContext.requireAdmin();
        int applicationId = ctx.getIntPathParam("id");

        if (ctx.getBody() == null || ctx.getBody().trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty");
        }
        Map<String, Object> map = JsonUtil.parseObject(ctx.getBody());
        String status = JsonUtil.getString(map, "status");

        ApplicationResponse response = applicationService.updateStatus(applicationId, status, currentUser);
        return HttpResponse.ok(response);
    }
}
