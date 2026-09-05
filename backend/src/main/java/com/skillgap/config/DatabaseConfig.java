package com.skillgap.config;

import com.skillgap.exception.DatabaseException;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Pure Java JDBC Connection provider.
 * Manages database connectivity with proper error translation.
 */
public class DatabaseConfig {

    private final String dbUrl;
    private final String dbUser;
    private final String dbPassword;

    public DatabaseConfig(AppConfig config) {
        this.dbUrl = config.getDbUrl();
        this.dbUser = config.getDbUser();
        this.dbPassword = config.getDbPassword();

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new DatabaseException("MySQL JDBC Driver (com.mysql.cj.jdbc.Driver) not found in classpath. Ensure mysql-connector-j.jar is in lib/", e);
        }
    }

    public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
    }

    public boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn.isValid(3);
        } catch (SQLException e) {
            return false;
        }
    }
}
