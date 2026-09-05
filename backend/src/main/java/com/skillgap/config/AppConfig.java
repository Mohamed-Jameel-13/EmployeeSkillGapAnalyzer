package com.skillgap.config;

public class AppConfig {
    private final int serverPort;
    private final String frontendOrigin;
    private final String dbUrl;
    private final String dbUser;
    private final String dbPassword;

    public AppConfig(EnvLoader env) {
        this.serverPort = env.getInt("SERVER_PORT", 8080);
        this.frontendOrigin = env.get("FRONTEND_ORIGIN", "http://localhost:5173");
        this.dbUrl = env.get("DB_URL", "jdbc:mysql://localhost:3306/skill_gap_analyzer?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
        this.dbUser = env.get("DB_USER", "root");
        this.dbPassword = env.get("DB_PASSWORD", "");
    }

    public int getServerPort() {
        return serverPort;
    }

    public String getFrontendOrigin() {
        return frontendOrigin;
    }

    public String getDbUrl() {
        return dbUrl;
    }

    public String getDbUser() {
        return dbUser;
    }

    public String getDbPassword() {
        return dbPassword;
    }
}
