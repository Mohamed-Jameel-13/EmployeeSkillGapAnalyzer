package com.skillgap.router;

import com.skillgap.exception.ApiException;
import com.skillgap.exception.NotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Router {

    public static class RouteEntry {
        private final String method;
        private final String rawPath;
        private final Pattern regex;
        private final List<String> paramNames;
        private final RouteHandler handler;

        public RouteEntry(String method, String rawPath, Pattern regex, List<String> paramNames, RouteHandler handler) {
            this.method = method;
            this.rawPath = rawPath;
            this.regex = regex;
            this.paramNames = paramNames;
            this.handler = handler;
        }
    }

    private final List<RouteEntry> routes = new ArrayList<>();

    public void get(String path, RouteHandler handler) {
        addRoute("GET", path, handler);
    }

    public void post(String path, RouteHandler handler) {
        addRoute("POST", path, handler);
    }

    public void put(String path, RouteHandler handler) {
        addRoute("PUT", path, handler);
    }

    public void delete(String path, RouteHandler handler) {
        addRoute("DELETE", path, handler);
    }

    public void addRoute(String method, String rawPath, RouteHandler handler) {
        // Parse {param} in path
        List<String> paramNames = new ArrayList<>();
        Matcher m = Pattern.compile("\\{([a-zA-Z0-9_]+)\\}").matcher(rawPath);
        StringBuffer regexBuf = new StringBuffer("^");
        while (m.find()) {
            paramNames.add(m.group(1));
            m.appendReplacement(regexBuf, "([^/]+)");
        }
        m.appendTail(regexBuf);
        regexBuf.append("$");

        Pattern pattern = Pattern.compile(regexBuf.toString());
        routes.add(new RouteEntry(method.toUpperCase(), rawPath, pattern, paramNames, handler));
    }

    public HttpResponse dispatch(RequestContext ctx) throws Exception {
        String requestMethod = ctx.getMethod().toUpperCase();
        String requestPath = ctx.getPath();

        boolean pathMatchedOtherMethod = false;

        for (RouteEntry entry : routes) {
            Matcher matcher = entry.regex.matcher(requestPath);
            if (matcher.matches()) {
                if (entry.method.equalsIgnoreCase(requestMethod)) {
                    // Extract path parameters
                    for (int i = 0; i < entry.paramNames.size(); i++) {
                        String name = entry.paramNames.get(i);
                        String value = matcher.group(i + 1);
                        ctx.getPathParams().put(name, value);
                    }
                    return entry.handler.handle(ctx);
                } else {
                    pathMatchedOtherMethod = true;
                }
            }
        }

        if (pathMatchedOtherMethod) {
            throw new ApiException(405, "METHOD_NOT_ALLOWED", "HTTP method " + requestMethod + " is not allowed for " + requestPath);
        }

        throw new NotFoundException("Endpoint not found: " + requestMethod + " " + requestPath);
    }
}
