import React, { useState } from "react";
import { Briefcase, ArrowRight, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthView({ onLoginSuccess }) {
  const { login, register, loading, demoUsers } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [roleTab, setRoleTab] = useState("candidate"); // 'candidate' | 'admin'

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    title: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister) {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: roleTab,
        title: formData.title || (roleTab === "admin" ? "Recruiter" : "Software Engineer")
      });
      if (res.success && onLoginSuccess) onLoginSuccess();
    } else {
      const res = await login(formData.email, formData.password);
      if (res.success && onLoginSuccess) onLoginSuccess();
    }
  };

  const handleQuickDemoLogin = async (user) => {
    const res = await login(user.email, user.password || (user.role === "admin" ? "admin" : "user"));
    if (res.success && onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        
        {/* Left Branding & Highlights Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold tracking-wide backdrop-blur-sm mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Skill-Driven Recruitment
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight leading-tight mb-3">
              Bridge the gap between talent and opportunity.
            </h1>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Automated skill matching, personalized gap analysis, and tailored learning roadmaps for candidates and recruiters.
            </p>
          </div>

          {/* Quick Demo Logins Container */}
          <div className="mt-8 space-y-3 pt-6 border-t border-white/15">
            <div className="text-xs uppercase tracking-wider font-semibold text-indigo-200 mb-2">
              ⚡ 1-Click Instant Demo Login
            </div>

            {/* Admin Demo */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin({ email: "admin@skillbridge.io", role: "admin", password: "admin" })}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                  👑
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    Sarah Jenkins (Admin)
                  </div>
                  <div className="text-[11px] text-indigo-200">HR Director & Recruiter</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Candidate 1 Demo */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin({ email: "alex@example.com", role: "candidate", password: "user" })}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                  👤
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Alex Morgan (Candidate)
                  </div>
                  <div className="text-[11px] text-indigo-200">Frontend Dev (React, Tailwind)</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Candidate 2 Demo */}
            <button
              type="button"
              onClick={() => handleQuickDemoLogin({ email: "priya@example.com", role: "candidate", password: "user" })}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                  👤
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Priya Sharma (Candidate)
                  </div>
                  <div className="text-[11px] text-indigo-200">Full Stack (Python, Postgres)</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          {/* Role Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-6 max-w-xs mx-auto w-full">
            <button
              type="button"
              onClick={() => {
                setRoleTab("candidate");
                setFormData((prev) => ({ ...prev, email: "alex@example.com", password: "user" }));
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                roleTab === "candidate"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Candidate Login
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleTab("admin");
                setFormData((prev) => ({ ...prev, email: "admin@skillbridge.io", password: "admin" }));
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                roleTab === "admin"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Login
            </button>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              {isRegister ? "Create your account" : `Sign in as ${roleTab === "admin" ? "Admin" : "Candidate"}`}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isRegister
                ? "Join SkillBridge to analyze your skills and discover matched jobs"
                : `Enter your credentials or click any demo profile on the left`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Lee"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder={roleTab === "admin" ? "admin@skillbridge.io" : "alex@example.com"}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-indigo-600 font-medium cursor-pointer">
                  Demo pw: {roleTab === "admin" ? "admin" : "user"}
                </span>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                "Processing..."
              ) : isRegister ? (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Sign In as {roleTab === "admin" ? "Admin" : "Candidate"} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {isRegister
                ? "Already have an account? Sign In"
                : "Don't have an account? Register as Candidate"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
