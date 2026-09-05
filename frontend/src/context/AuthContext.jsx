import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("skillbridge_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    if (user) {
      localStorage.setItem("skillbridge_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("skillbridge_user");
      localStorage.removeItem("skillbridge_token");
    }
  }, [user]);

  // Login using the Pure Java backend.
  // Admin: POST /api/auth/admin/login
  // User:  POST /api/auth/user/login
  const login = async (email, password, role = "USER") => {
    setLoading(true);
    try {
      const endpoint = role === "ADMIN"
        ? "http://localhost:8080/api/auth/admin/login"
        : "http://localhost:8080/api/auth/user/login";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Login failed");

      // Store token for subsequent API calls
      localStorage.setItem("skillbridge_token", data.token);

      // Normalize user object from Java backend: { id, name, email, role }
      setUser(data.user);
      addToast(`Welcome, ${data.user.name}!`, "success");
      return { success: true, user: data.user };
    } catch (err) {
      addToast(err.message, "error");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("skillbridge_token");
    if (token) {
      try {
        await fetch("http://localhost:8080/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (_) {}
    }
    setUser(null);
    addToast("Logged out successfully.", "info");
  };

  return (
    <AuthContext.Provider
      value={{ user, role: user?.role || "guest", loading, login, logout, toasts, addToast, removeToast }}
    >
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : toast.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-indigo-50 border-indigo-200 text-indigo-900"
            }`}
          >
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-700 ml-2">&times;</button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
