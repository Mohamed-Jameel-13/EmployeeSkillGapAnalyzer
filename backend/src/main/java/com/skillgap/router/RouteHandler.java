package com.skillgap.router;

@FunctionalInterface
public interface RouteHandler {
    HttpResponse handle(RequestContext ctx) throws Exception;
}
