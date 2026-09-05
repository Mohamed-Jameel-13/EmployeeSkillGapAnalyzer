package com.skillgap.exception;

public class NotFoundException extends ApiException {
    public NotFoundException(String message) {
        super(404, "NOT_FOUND", message);
    }
}
