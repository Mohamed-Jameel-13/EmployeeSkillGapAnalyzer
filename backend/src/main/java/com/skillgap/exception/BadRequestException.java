package com.skillgap.exception;

public class BadRequestException extends ApiException {
    public BadRequestException(String message) {
        super(400, "BAD_REQUEST", message);
    }
}
