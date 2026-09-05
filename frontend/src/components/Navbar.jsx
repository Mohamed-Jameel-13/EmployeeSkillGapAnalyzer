import React from "react";
import {
  LayoutDashboard,
  Users,
  Award,
  Briefcase,
  Sparkles,
  BookOpen,
  FileText,
  Server,
  LogOut
} from "lucide-react";
import { useRouter } from "../routes/Router";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../api/config";

export default function Navbar() {
  const { currentRoute, navigate } = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { id: "dashboard",       label: "Dashboard",            icon: LayoutDashboard },
    { id: "students",        label: "Employees / Students", icon: Users },
    { id: "skills",          label: "Skills",               icon: Award },
    { id: "jobs",            label: "Jobs",                 icon: Briefcase },
    { id: "skill-gap",       label: "Skill Gap Analyzer",   icon: Sparkles },
    { id: "recommendations", label: "Recommendations",      icon: BookOpen },
    { id: "applications",    label: "Applications",         icon: FileText }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div
            onClick={() => navigate("dashboard")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                Skill Gap Analyzer
              </span>
              <span className="text-[11px] font-semibold text-indigo-600 tracking-wide uppercase">
                Pure Java REST API
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.id ||
                (item.id === "students" && (currentRoute === "add-student" || currentRoute === "student-profile")) ||
                (item.id === "jobs" && currentRoute === "job-details");
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: API badge + user + logout */}
          <div className="flex items-center gap-2">
            {/* Live API badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 text-xs font-medium">
              <Server className="w-3.5 h-3.5 shrink-0" />
              <div className="leading-tight">
                <span className="block font-bold text-[10px] uppercase">Live API</span>
                <span className="text-[10px] opacity-70 font-mono">{API_BASE_URL}</span>
              </div>
            </div>

            {/* User info */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="font-semibold">{user.name}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                  {user.role}
                </span>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="flex xl:hidden items-center gap-1 py-2 border-t border-slate-100 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentRoute === item.id ||
              (item.id === "students" && (currentRoute === "add-student" || currentRoute === "student-profile")) ||
              (item.id === "jobs" && currentRoute === "job-details");
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}