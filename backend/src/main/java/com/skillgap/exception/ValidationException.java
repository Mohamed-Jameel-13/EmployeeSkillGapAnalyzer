package com.skillgap.exception;

import java.util.List;

public class ValidationException extends ApiException {
    public ValidationException(String message) {
        super(400, "VALIDATION_ERROR", message);
    }

    public ValidationException(String message, List<String> details) {
        super(400, "VALIDATION_ERROR", message, details);
    }
}
