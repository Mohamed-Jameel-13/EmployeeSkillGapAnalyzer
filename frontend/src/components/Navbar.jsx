import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Award,
  Briefcase,
  Sparkles,
  BookOpen,
  FileText,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useRouter } from "../routes/Router";
import { useAuth } from "../context/AuthContext";
import { useAnalysis } from "../context/AnalysisContext";

export default function Navbar() {
  const { currentRoute, navigate } = useRouter();
  const { user, logout } = useAuth();
  const { selectedStudentId, selectedJobId } = useAnalysis();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard",       label: "Dashboard",       icon: LayoutDashboard },
    { id: "students",        label: "Students",        icon: Users },
    { id: "skills",          label: "Skills",          icon: Award },
    { id: "jobs",            label: "Jobs",            icon: Briefcase },
    { id: "skill-gap",       label: "Skill Gap",       icon: Sparkles },
    { id: "recommendations", label: "Recommendations", icon: BookOpen },
    { id: "applications",    label: "Applications",    icon: FileText }
  ];

  const handleNav = (id) => {
    if (id === "skill-gap" || id === "recommendations") {
      navigate(id, { studentId: selectedStudentId, jobId: selectedJobId });
    } else {
      navigate(id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Simple Clean Logo: SkillBridge */}
          <div
            onClick={() => handleNav("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                SkillBridge
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.id ||
                (item.id === "students" && (currentRoute === "add-student" || currentRoute === "student-profile")) ||
                (item.id === "jobs" && currentRoute === "job-details");
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Section */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Minimal Live API indicator */}
            <div
              title="Connected to Pure Java REST API on port 8080"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-[11px]">API Live</span>
            </div>

            {/* User Badge */}
            {user && (
              <div className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="font-semibold max-w-[90px] truncate hidden sm:inline">
                  {user.name}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-indigo-100 text-indigo-700">
                  {user.role}
                </span>
              </div>
            )}

            {/* Sign Out Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.id ||
                (item.id === "students" && (currentRoute === "add-student" || currentRoute === "student-profile")) ||
                (item.id === "jobs" && currentRoute === "job-details");
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}