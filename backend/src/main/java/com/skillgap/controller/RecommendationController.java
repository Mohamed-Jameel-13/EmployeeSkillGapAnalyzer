package com.skillgap.controller;

import com.skillgap.dto.RecommendationDto;
import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;
import com.skillgap.security.SecurityContext;
import com.skillgap.service.RecommendationService;

import java.util.List;

public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    public HttpResponse getRecommendations(RequestContext ctx) {
        int studentId = ctx.getIntPathParam("studentId");
        int jobId = ctx.getIntPathParam("jobId");

        // Authorization: Admin can view any student's recommendations; normal user can only view their own
        SecurityContext.requireAdminOrOwner(studentId);

        List<RecommendationDto> recommendations = recommendationService.getRecommendations(studentId, jobId);
        return HttpResponse.ok(recommendations);
    }
}
