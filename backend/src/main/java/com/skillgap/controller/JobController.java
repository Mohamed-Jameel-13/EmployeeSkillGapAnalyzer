package com.skillgap.controller;

import com.skillgap.dto.CreateJobRequest;
import com.skillgap.dto.JobDto;
import com.skillgap.exception.ValidationException;
import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;
import com.skillgap.security.SecurityContext;
import com.skillgap.service.JobService;
import com.skillgap.util.JsonUtil;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    public HttpResponse getAllJobs(RequestContext ctx) {
        List<JobDto> jobs = jobService.getAllJobs();
        return HttpResponse.ok(jobs);
    }

    public HttpResponse getJobById(RequestContext ctx) {
        int id = ctx.getIntPathParam("id");
        JobDto job = jobService.getJobById(id);
        return HttpResponse.ok(job);
    }

    public HttpResponse createJob(RequestContext ctx) {
        SecurityContext.requireAdmin();
        if (ctx.getBody() == null || ctx.getBody().trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty");
        }
        Map<String, Object> map = JsonUtil.parseObject(ctx.getBody());
        CreateJobRequest req = new CreateJobRequest(
                JsonUtil.getString(map, "title"),
                JsonUtil.getString(map, "company"),
                JsonUtil.getString(map, "location")
        );
        JobDto created = jobService.createJob(req, ctx.getUserPrincipal());
        return HttpResponse.created(created);
    }

    public HttpResponse updateJob(RequestContext ctx) {
        SecurityContext.requireAdmin();
        int id = ctx.getIntPathParam("id");
        if (ctx.getBody() == null || ctx.getBody().trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty");
        }
        Map<String, Object> map = JsonUtil.parseObject(ctx.getBody());
        CreateJobRequest req = new CreateJobRequest(
                JsonUtil.getString(map, "title"),
                JsonUtil.getString(map, "company"),
                JsonUtil.getString(map, "location")
        );
        JobDto updated = jobService.updateJob(id, req, ctx.getUserPrincipal());
        return HttpResponse.ok(updated);
    }

    public HttpResponse deleteJob(RequestContext ctx) {
        SecurityContext.requireAdmin();
        int id = ctx.getIntPathParam("id");
        jobService.deleteJob(id, ctx.getUserPrincipal());
        return HttpResponse.ok(Collections.singletonMap("message", "Job deleted successfully"));
    }
}
