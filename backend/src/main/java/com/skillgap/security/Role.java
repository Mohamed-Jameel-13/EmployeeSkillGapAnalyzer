package com.skillgap.security;

public enum Role {
    ADMIN,
    USER;

    public static Role fromString(String roleStr) {
        if (roleStr == null) return USER;
        try {
            return Role.valueOf(roleStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return USER;
        }
    }
}
