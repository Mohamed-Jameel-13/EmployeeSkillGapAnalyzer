package com.skillgap.controller;

import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;

import java.util.Collections;
import java.util.Map;

public class HealthController {

    public HttpResponse checkHealth(RequestContext ctx) {
        Map<String, String> res = Collections.singletonMap("status", "UP");
        return HttpResponse.ok(res);
    }
}
