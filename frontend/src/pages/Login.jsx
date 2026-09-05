import React, { useState } from "react";
import { Sparkles, Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    const result = await login(email.trim(), password, role);
    if (!result.success) {
      setError(result.error || "Login failed. Please check your credentials.");
    }
  };

  const fillDemo = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword("password");
    setRole(demoRole);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            SkillBridge
          </h1>
          <p className="text-sm text-indigo-300 mt-1 font-medium">
            Employee & Student Skill Gap Analyzer
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Sign In</h2>
          <p className="text-xs text-slate-500 mb-6">
            Use your registered email and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRole("USER")}
                className={`flex-1 py-2.5 transition-all ${
                  role === "USER"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Student / Employee
              </button>
              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`flex-1 py-2.5 transition-all ${
                  role === "ADMIN"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Admin
              </button>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-indigo-200"
            >
              {loading ? (
                <span className="animate-pulse">Signing in…</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Demo Accounts (password: <code className="font-mono bg-slate-100 px-1 rounded">password</code>)
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: "Admin", email: "admin@example.com", role: "ADMIN", color: "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100" },
                { label: "Arun (Student)", email: "arun@example.com", role: "USER", color: "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100" },
                { label: "Priya (Student)", email: "priya@example.com", role: "USER", color: "bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100" },
              ].map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => fillDemo(u.email, u.role)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${u.color}`}
                >
                  <span className="font-bold">{u.label}</span>
                  <span className="ml-2 opacity-70 font-mono">{u.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-indigo-400 mt-4">
          Pure Java REST API • MySQL Database
        </p>
      </div>
    </div>
  );
}
