package com.skillgap.router;

import com.skillgap.security.UserPrincipal;
import com.sun.net.httpserver.HttpExchange;

import java.util.HashMap;
import java.util.Map;

public class RequestContext {

    private final HttpExchange exchange;
    private final String method;
    private final String path;
    private final String body;
    private final Map<String, String> pathParams;
    private final Map<String, String> queryParams;
    private UserPrincipal userPrincipal;

    public RequestContext(HttpExchange exchange, String method, String path, String body) {
        this.exchange = exchange;
        this.method = method;
        this.path = path;
        this.body = body;
        this.pathParams = new HashMap<>();
        this.queryParams = parseQueryParams(exchange.getRequestURI().getRawQuery());
    }

    public HttpExchange getExchange() {
        return exchange;
    }

    public String getMethod() {
        return method;
    }

    public String getPath() {
        return path;
    }

    public String getBody() {
        return body;
    }

    public Map<String, String> getPathParams() {
        return pathParams;
    }

    public String getPathParam(String name) {
        return pathParams.get(name);
    }

    public int getIntPathParam(String name) {
        String val = pathParams.get(name);
        if (val == null) {
            throw new IllegalArgumentException("Missing path parameter: " + name);
        }
        return Integer.parseInt(val);
    }

    public Map<String, String> getQueryParams() {
        return queryParams;
    }

    public String getQueryParam(String name) {
        return queryParams.get(name);
    }

    public UserPrincipal getUserPrincipal() {
        return userPrincipal;
    }

    public void setUserPrincipal(UserPrincipal userPrincipal) {
        this.userPrincipal = userPrincipal;
    }

    private static Map<String, String> parseQueryParams(String rawQuery) {
        Map<String, String> map = new HashMap<>();
        if (rawQuery == null || rawQuery.trim().isEmpty()) {
            return map;
        }
        String[] pairs = rawQuery.split("&");
        for (String pair : pairs) {
            int eq = pair.indexOf('=');
            if (eq > 0) {
                String k = java.net.URLDecoder.decode(pair.substring(0, eq), java.nio.charset.StandardCharsets.UTF_8);
                String v = java.net.URLDecoder.decode(pair.substring(eq + 1), java.nio.charset.StandardCharsets.UTF_8);
                map.put(k, v);
            }
        }
        return map;
    }
}
