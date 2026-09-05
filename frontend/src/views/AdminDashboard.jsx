import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Users, 
  FileText, 
  Award, 
  TrendingUp, 
  ArrowUpRight, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  UserCheck 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/admin")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching admin stats:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading analytics dashboard...
      </div>
    );
  }

  const kpis = [
    { label: "Active Job Listings", value: stats?.totalJobs || 0, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50", tab: "admin-jobs" },
    { label: "Candidate Profiles", value: stats?.totalCandidates || 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", tab: "admin-users" },
    { label: "Total Applications", value: stats?.totalApplications || 0, icon: FileText, color: "text-amber-600", bg: "bg-amber-50", tab: "admin-applications" },
    { label: "Skills Taxonomy Catalog", value: stats?.totalSkillsCatalog || 0, icon: Award, color: "text-violet-600", bg: "bg-violet-50", tab: "admin-skills" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/20">
            👑 Admin & Recruiter Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || "Administrator"}
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Monitor real-time talent applications, manage job postings with skill requirements, and review candidate skill-gap match scores.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setActiveTab("admin-jobs")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Job
          </button>
          <button
            onClick={() => setActiveTab("admin-applications")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            Review Applications
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(kpi.tab)}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Grid: Funnel & Skill Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Application Funnel */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Application Pipeline Funnel</h2>
              <p className="text-xs text-slate-500">Live candidate status distribution</p>
            </div>
            <button
              onClick={() => setActiveTab("admin-applications")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all
            </button>
          </div>

          <div className="space-y-4">
            {[
              { label: "Applied / New", count: stats?.funnel?.applied || 0, color: "bg-blue-500", text: "text-blue-700", bgLight: "bg-blue-50" },
              { label: "Under Review", count: stats?.funnel?.reviewing || 0, color: "bg-amber-500", text: "text-amber-700", bgLight: "bg-amber-50" },
              { label: "Interview Scheduled", count: stats?.funnel?.interview || 0, color: "bg-purple-500", text: "text-purple-700", bgLight: "bg-purple-50" },
              { label: "Accepted / Offer", count: stats?.funnel?.hired || 0, color: "bg-emerald-500", text: "text-emerald-700", bgLight: "bg-emerald-50" },
              { label: "Rejected", count: stats?.funnel?.rejected || 0, color: "bg-rose-500", text: "text-rose-700", bgLight: "bg-rose-50" }
            ].map((stage, idx) => {
              const max = Math.max(1, stats?.totalApplications || 1);
              const pct = Math.round((stage.count / max) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{stage.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] ${stage.bgLight} ${stage.text}`}>
                      {stage.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Most Demanded Skills in Jobs */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Highest In-Demand Skills</h2>
              <p className="text-xs text-slate-500">Skills most frequently required across all open jobs</p>
            </div>
            <button
              onClick={() => setActiveTab("admin-skills")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Catalog
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(stats?.topSkillsDemanded || []).map((skill, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800">{skill.name}</div>
                  <div className="text-[11px] text-slate-500">Required in {skill.count} jobs</div>
                </div>
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
