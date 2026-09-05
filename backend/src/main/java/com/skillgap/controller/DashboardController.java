package com.skillgap.controller;

import com.skillgap.dto.DashboardSummaryDto;
import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;
import com.skillgap.security.SecurityContext;
import com.skillgap.security.UserPrincipal;
import com.skillgap.service.DashboardService;

public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    public HttpResponse getSummary(RequestContext ctx) {
        UserPrincipal currentUser = SecurityContext.requireAuthenticated();
        DashboardSummaryDto summary = dashboardService.getSummary(currentUser);
        return HttpResponse.ok(summary);
    }
}
