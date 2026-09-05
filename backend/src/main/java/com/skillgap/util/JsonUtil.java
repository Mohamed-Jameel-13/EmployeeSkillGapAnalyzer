package com.skillgap.util;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

/**
 * Lightweight, zero-dependency JSON parser and serializer in Pure Java.
 * Compliant with RFC 8259.
 */
public final class JsonUtil {

    private JsonUtil() {
    }

    // ==========================================
    // SERIALIZATION (Object -> JSON string)
    // ==========================================

    public static String toJson(Object obj) {
        StringBuilder sb = new StringBuilder();
        serializeValue(obj, sb);
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private static void serializeValue(Object obj, StringBuilder sb) {
        if (obj == null) {
            sb.append("null");
        } else if (obj instanceof String) {
            sb.append('"').append(escapeString((String) obj)).append('"');
        } else if (obj instanceof Number || obj instanceof Boolean) {
            sb.append(obj.toString());
        } else if (obj instanceof Timestamp) {
            sb.append('"').append(escapeString(obj.toString())).append('"');
        } else if (obj instanceof Instant) {
            sb.append('"').append(escapeString(obj.toString())).append('"');
        } else if (obj instanceof Map) {
            serializeMap((Map<String, Object>) obj, sb);
        } else if (obj instanceof Collection) {
            serializeCollection((Collection<?>) obj, sb);
        } else if (obj.getClass().isArray()) {
            serializeArray(obj, sb);
        } else {
            serializePojo(obj, sb);
        }
    }

    private static void serializeMap(Map<String, Object> map, StringBuilder sb) {
        sb.append('{');
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) sb.append(',');
            sb.append('"').append(escapeString(entry.getKey())).append("\":");
            serializeValue(entry.getValue(), sb);
            first = false;
        }
        sb.append('}');
    }

    private static void serializeCollection(Collection<?> col, StringBuilder sb) {
        sb.append('[');
        boolean first = true;
        for (Object item : col) {
            if (!first) sb.append(',');
            serializeValue(item, sb);
            first = false;
        }
        sb.append(']');
    }

    private static void serializeArray(Object array, StringBuilder sb) {
        sb.append('[');
        int len = java.lang.reflect.Array.getLength(array);
        for (int i = 0; i < len; i++) {
            if (i > 0) sb.append(',');
            serializeValue(java.lang.reflect.Array.get(array, i), sb);
        }
        sb.append(']');
    }

    private static void serializePojo(Object pojo, StringBuilder sb) {
        sb.append('{');
        boolean first = true;
        Class<?> clazz = pojo.getClass();
        while (clazz != null && clazz != Object.class) {
            Field[] fields = clazz.getDeclaredFields();
            for (Field field : fields) {
                if (Modifier.isStatic(field.getModifiers()) || Modifier.isTransient(field.getModifiers())) {
                    continue;
                }
                // Do not expose password hashes or sensitive security fields
                if (field.getName().equalsIgnoreCase("passwordHash") || field.getName().equalsIgnoreCase("password")) {
                    continue;
                }
                field.setAccessible(true);
                try {
                    Object val = field.get(pojo);
                    if (!first) sb.append(',');
                    sb.append('"').append(escapeString(field.getName())).append("\":");
                    serializeValue(val, sb);
                    first = false;
                } catch (IllegalAccessException ignored) {
                }
            }
            clazz = clazz.getSuperclass();
        }
        sb.append('}');
    }

    public static String escapeString(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                    break;
            }
        }
        return sb.toString();
    }

    // ==========================================
    // PARSING (JSON string -> Map/List/Value)
    // ==========================================

    public static Object parse(String json) {
        if (json == null) return null;
        json = json.trim();
        if (json.isEmpty()) return null;
        return new Parser(json).parseValue();
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> parseObject(String json) {
        Object res = parse(json);
        if (res instanceof Map) {
            return (Map<String, Object>) res;
        }
        throw new IllegalArgumentException("Expected JSON object but got: " + (res == null ? "null" : res.getClass().getSimpleName()));
    }

    @SuppressWarnings("unchecked")
    public static List<Object> parseArray(String json) {
        Object res = parse(json);
        if (res instanceof List) {
            return (List<Object>) res;
        }
        throw new IllegalArgumentException("Expected JSON array but got: " + (res == null ? "null" : res.getClass().getSimpleName()));
    }

    // ==========================================
    // EXTRACTION HELPERS
    // ==========================================

    public static String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString().trim() : null;
    }

    public static Integer getInteger(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).intValue();
        try {
            return Integer.parseInt(val.toString().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static Boolean getBoolean(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return null;
        if (val instanceof Boolean) return (Boolean) val;
        return Boolean.parseBoolean(val.toString().trim());
    }

    public static Double getDouble(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val == null) return null;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try {
            return Double.parseDouble(val.toString().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // ==========================================
    // RECURSIVE DESCENT PARSER
    // ==========================================

    private static class Parser {
        private final String src;
        private int idx;

        Parser(String src) {
            this.src = src;
            this.idx = 0;
        }

        Object parseValue() {
            skipWhitespace();
            if (idx >= src.length()) {
                return null;
            }
            char c = src.charAt(idx);
            if (c == '{') {
                return parseObject();
            } else if (c == '[') {
                return parseArray();
            } else if (c == '"') {
                return parseString();
            } else if (c == 't' || c == 'f') {
                return parseBoolean();
            } else if (c == 'n') {
                return parseNull();
            } else if (c == '-' || Character.isDigit(c)) {
                return parseNumber();
            }
            throw new IllegalArgumentException("Unexpected char at position " + idx + ": '" + c + "'");
        }

        private Map<String, Object> parseObject() {
            Map<String, Object> map = new LinkedHashMap<>();
            idx++; // skip '{'
            skipWhitespace();
            if (idx < src.length() && src.charAt(idx) == '}') {
                idx++;
                return map;
            }
            while (idx < src.length()) {
                skipWhitespace();
                if (idx >= src.length() || src.charAt(idx) != '"') {
                    throw new IllegalArgumentException("Expected string key in object at position " + idx);
                }
                String key = parseString();
                skipWhitespace();
                if (idx >= src.length() || src.charAt(idx) != ':') {
                    throw new IllegalArgumentException("Expected ':' after key at position " + idx);
                }
                idx++; // skip ':'
                Object val = parseValue();
                map.put(key, val);
                skipWhitespace();
                if (idx < src.length() && src.charAt(idx) == ',') {
                    idx++; // skip ','
                } else if (idx < src.length() && src.charAt(idx) == '}') {
                    idx++; // skip '}'
                    break;
                } else {
                    throw new IllegalArgumentException("Expected ',' or '}' in object at position " + idx);
                }
            }
            return map;
        }

        private List<Object> parseArray() {
            List<Object> list = new ArrayList<>();
            idx++; // skip '['
            skipWhitespace();
            if (idx < src.length() && src.charAt(idx) == ']') {
                idx++;
                return list;
            }
            while (idx < src.length()) {
                Object val = parseValue();
                list.add(val);
                skipWhitespace();
                if (idx < src.length() && src.charAt(idx) == ',') {
                    idx++; // skip ','
                } else if (idx < src.length() && src.charAt(idx) == ']') {
                    idx++; // skip ']'
                    break;
                } else {
                    throw new IllegalArgumentException("Expected ',' or ']' in array at position " + idx);
                }
            }
            return list;
        }

        private String parseString() {
            idx++; // skip opening '"'
            StringBuilder sb = new StringBuilder();
            while (idx < src.length()) {
                char c = src.charAt(idx++);
                if (c == '"') {
                    return sb.toString();
                }
                if (c == '\\') {
                    if (idx >= src.length()) throw new IllegalArgumentException("Unterminated escape sequence");
                    char esc = src.charAt(idx++);
                    switch (esc) {
                        case '"': sb.append('"'); break;
                        case '\\': sb.append('\\'); break;
                        case '/': sb.append('/'); break;
                        case 'b': sb.append('\b'); break;
                        case 'f': sb.append('\f'); break;
                        case 'n': sb.append('\n'); break;
                        case 'r': sb.append('\r'); break;
                        case 't': sb.append('\t'); break;
                        case 'u':
                            if (idx + 4 > src.length()) throw new IllegalArgumentException("Invalid unicode escape");
                            String hex = src.substring(idx, idx + 4);
                            idx += 4;
                            sb.append((char) Integer.parseInt(hex, 16));
                            break;
                        default:
                            sb.append(esc);
                            break;
                    }
                } else {
                    sb.append(c);
                }
            }
            throw new IllegalArgumentException("Unterminated string");
        }

        private Boolean parseBoolean() {
            if (src.startsWith("true", idx)) {
                idx += 4;
                return Boolean.TRUE;
            } else if (src.startsWith("false", idx)) {
                idx += 5;
                return Boolean.FALSE;
            }
            throw new IllegalArgumentException("Invalid boolean at position " + idx);
        }

        private Object parseNull() {
            if (src.startsWith("null", idx)) {
                idx += 4;
                return null;
            }
            throw new IllegalArgumentException("Invalid null literal at position " + idx);
        }

        private Number parseNumber() {
            int start = idx;
            if (src.charAt(idx) == '-') idx++;
            boolean isFloating = false;
            while (idx < src.length()) {
                char c = src.charAt(idx);
                if (Character.isDigit(c)) {
                    idx++;
                } else if (c == '.' || c == 'e' || c == 'E' || c == '+' || c == '-') {
                    isFloating = true;
                    idx++;
                } else {
                    break;
                }
            }
            String numStr = src.substring(start, idx);
            if (isFloating) {
                return Double.parseDouble(numStr);
            }
            try {
                return Integer.parseInt(numStr);
            } catch (NumberFormatException e) {
                return Long.parseLong(numStr);
            }
        }

        private void skipWhitespace() {
            while (idx < src.length()) {
                char c = src.charAt(idx);
                if (c == ' ' || c == '\t' || c == '\n' || c == '\r') {
                    idx++;
                } else {
                    break;
                }
            }
        }
    }
}
