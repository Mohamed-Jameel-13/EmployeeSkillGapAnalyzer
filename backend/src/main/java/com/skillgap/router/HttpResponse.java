package com.skillgap.router;

public class HttpResponse {
    private final int statusCode;
    private final Object body;

    public HttpResponse(int statusCode, Object body) {
        this.statusCode = statusCode;
        this.body = body;
    }

    public static HttpResponse ok(Object body) {
        return new HttpResponse(200, body);
    }

    public static HttpResponse created(Object body) {
        return new HttpResponse(201, body);
    }

    public static HttpResponse noContent() {
        return new HttpResponse(204, null);
    }

    public int getStatusCode() {
        return statusCode;
    }

    public Object getBody() {
        return body;
    }
}
