package com.skillgap.controller;

import com.skillgap.dto.AuthResponse;
import com.skillgap.dto.LoginRequest;
import com.skillgap.dto.UserDto;
import com.skillgap.exception.ValidationException;
import com.skillgap.router.HttpResponse;
import com.skillgap.router.RequestContext;
import com.skillgap.security.SecurityContext;
import com.skillgap.security.UserPrincipal;
import com.skillgap.service.AuthService;
import com.skillgap.util.JsonUtil;

import java.util.Collections;
import java.util.Map;

public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    public HttpResponse adminLogin(RequestContext ctx) {
        LoginRequest req = parseLoginBody(ctx.getBody());
        AuthResponse resp = authService.loginAdmin(req);
        return HttpResponse.ok(resp);
    }

    public HttpResponse userLogin(RequestContext ctx) {
        LoginRequest req = parseLoginBody(ctx.getBody());
        AuthResponse resp = authService.loginUser(req);
        return HttpResponse.ok(resp);
    }

    public HttpResponse logout(RequestContext ctx) {
        String authHeader = ctx.getExchange().getRequestHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            authService.logout(token);
        }
        return HttpResponse.ok(Collections.singletonMap("message", "Successfully logged out"));
    }

    public HttpResponse me(RequestContext ctx) {
        UserPrincipal principal = SecurityContext.requireAuthenticated();
        UserDto user = authService.getCurrentUser(principal);
        return HttpResponse.ok(user);
    }

    private LoginRequest parseLoginBody(String body) {
        if (body == null || body.trim().isEmpty()) {
            throw new ValidationException("Request body cannot be empty");
        }
        Map<String, Object> map = JsonUtil.parseObject(body);
        String email = JsonUtil.getString(map, "email");
        String password = JsonUtil.getString(map, "password");
        return new LoginRequest(email, password);
    }
}
