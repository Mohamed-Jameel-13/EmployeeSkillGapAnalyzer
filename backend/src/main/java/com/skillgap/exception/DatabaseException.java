package com.skillgap.exception;

public class DatabaseException extends ApiException {
    public DatabaseException(String message) {
        super(500, "DATABASE_ERROR", message);
    }

    public DatabaseException(String message, Throwable cause) {
        super(500, "DATABASE_ERROR", message);
        initCause(cause);
    }
}
