package com.skillgap.util;

import com.skillgap.dto.ErrorResponse;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public final class HttpResponseUtil {

    private HttpResponseUtil() {
    }

    public static void setCorsHeaders(HttpExchange exchange, String allowedOrigin) {
        Headers headers = exchange.getResponseHeaders();
        headers.set("Access-Control-Allow-Origin", allowedOrigin != null ? allowedOrigin : "*");
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
        headers.set("Access-Control-Allow-Credentials", "true");
        headers.set("Access-Control-Max-Age", "3600");
    }

    public static void sendJsonResponse(HttpExchange exchange, int statusCode, Object body, String allowedOrigin) throws IOException {
        setCorsHeaders(exchange, allowedOrigin);

        if (statusCode == 204 || body == null) {
            exchange.sendResponseHeaders(statusCode, -1);
            exchange.close();
            return;
        }

        String json = (body instanceof String) ? (String) body : JsonUtil.toJson(body);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);

        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
            os.flush();
        } finally {
            exchange.close();
        }
    }

    public static void sendErrorResponse(HttpExchange exchange, int statusCode, String error, String message, java.util.List<String> details, String allowedOrigin) throws IOException {
        ErrorResponse err = new ErrorResponse(statusCode, error, message, details);
        sendJsonResponse(exchange, statusCode, err, allowedOrigin);
    }
}
