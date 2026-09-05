package com.skillgap.security;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Pure Java token and session management.
 * Generates cryptographically secure Bearer tokens and stores active sessions with expiration.
 */
public class TokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long SESSION_EXPIRY_SECONDS = 86400; // 24 hours

    private static class Session {
        final UserPrincipal principal;
        final Instant expiresAt;

        Session(UserPrincipal principal, Instant expiresAt) {
            this.principal = principal;
            this.expiresAt = expiresAt;
        }

        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    private final Map<String, Session> sessions = new ConcurrentHashMap<>();

    public String createToken(UserPrincipal principal) {
        cleanExpiredSessions();
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        StringBuilder sb = new StringBuilder(64);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        String token = "sga_" + sb.toString();
        Instant expiresAt = Instant.now().plusSeconds(SESSION_EXPIRY_SECONDS);
        sessions.put(token, new Session(principal, expiresAt));
        return token;
    }

    public UserPrincipal validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }
        Session session = sessions.get(token.trim());
        if (session == null) {
            return null;
        }
        if (session.isExpired()) {
            sessions.remove(token.trim());
            return null;
        }
        return session.principal;
    }

    public void revokeToken(String token) {
        if (token != null) {
            sessions.remove(token.trim());
        }
    }

    private void cleanExpiredSessions() {
        sessions.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}
