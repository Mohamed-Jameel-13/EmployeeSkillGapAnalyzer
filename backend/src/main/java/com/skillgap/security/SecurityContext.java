package com.skillgap.security;

import com.skillgap.exception.ForbiddenException;
import com.skillgap.exception.UnauthorizedException;

/**
 * ThreadLocal security context providing centralized access to authenticated user identity.
 */
public final class SecurityContext {

    private static final ThreadLocal<UserPrincipal> CURRENT_USER = new ThreadLocal<>();

    private SecurityContext() {
    }

    public static void setPrincipal(UserPrincipal principal) {
        CURRENT_USER.set(principal);
    }

    public static UserPrincipal getPrincipal() {
        return CURRENT_USER.get();
    }

    public static void clear() {
        CURRENT_USER.remove();
    }

    public static UserPrincipal requireAuthenticated() {
        UserPrincipal principal = CURRENT_USER.get();
        if (principal == null) {
            throw new UnauthorizedException("Authentication token is missing or invalid");
        }
        return principal;
    }

    public static UserPrincipal requireAdmin() {
        UserPrincipal principal = requireAuthenticated();
        if (!principal.isAdmin()) {
            throw new ForbiddenException("Access denied: Administrative privilege required");
        }
        return principal;
    }

    public static void requireAdminOrOwner(int studentId) {
        UserPrincipal principal = requireAuthenticated();
        if (principal.isAdmin()) {
            return;
        }
        if (principal.getUserId() != studentId) {
            throw new ForbiddenException("Access denied: You cannot access or modify another student's resources");
        }
    }
}
