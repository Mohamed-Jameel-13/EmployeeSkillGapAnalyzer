package com.skillgap.exception;

import java.util.ArrayList;
import java.util.List;

public class ApiException extends RuntimeException {
    private final int status;
    private final String error;
    private final List<String> details;

    public ApiException(int status, String error, String message) {
        super(message);
        this.status = status;
        this.error = error;
        this.details = new ArrayList<>();
    }

    public ApiException(int status, String error, String message, List<String> details) {
        super(message);
        this.status = status;
        this.error = error;
        this.details = details != null ? details : new ArrayList<>();
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public List<String> getDetails() {
        return details;
    }
}
