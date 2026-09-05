package com.skillgap.config;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Loads configuration from .env file or system environment variables.
 */
public class EnvLoader {

    private final Map<String, String> envMap = new HashMap<>();

    public EnvLoader() {
        loadDotEnv(".env");
    }

    public EnvLoader(String envFilePath) {
        loadDotEnv(envFilePath);
    }

    private void loadDotEnv(String filePath) {
        File file = new File(filePath);
        if (!file.exists()) {
            return;
        }
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eqIdx = line.indexOf('=');
                if (eqIdx > 0) {
                    String key = line.substring(0, eqIdx).trim();
                    String val = line.substring(eqIdx + 1).trim();
                    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.substring(1, val.length() - 1);
                    }
                    envMap.put(key, val);
                }
            }
        } catch (IOException ignored) {
        }
    }

    public String get(String key, String defaultValue) {
        // Priority: .env file -> System Environment -> System Properties -> defaultValue
        if (envMap.containsKey(key)) {
            return envMap.get(key);
        }
        String sysEnv = System.getenv(key);
        if (sysEnv != null && !sysEnv.isEmpty()) {
            return sysEnv;
        }
        String sysProp = System.getProperty(key);
        if (sysProp != null && !sysProp.isEmpty()) {
            return sysProp;
        }
        return defaultValue;
    }

    public int getInt(String key, int defaultValue) {
        String val = get(key, null);
        if (val == null) return defaultValue;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
