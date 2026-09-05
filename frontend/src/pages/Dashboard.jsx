import React, { useState, useEffect } from "react";
import { 
  Users, 
  Briefcase, 
  FileText, 
  Percent, 
  ArrowRight, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Award, 
  BookOpen 
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useRouter } from "../routes/Router";
import { getDashboardStats } from "../api/dashboard";

export default function Dashboard() {
  const { navigate } = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <LoadingState message="Loading dashboard metrics from REST API..." />;
  if (error) return <ErrorState title="Dashboard Unavailable" message={error} onRetry={fetchStats} />;

  const metrics = [
    {
      title: "Total Employees / Students",
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      route: "students"
    },
    {
      title: "Total Jobs",
      value: stats?.totalJobs ?? 120,
      icon: Briefcase,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      route: "jobs"
    },
    {
      title: "Total Applications",
      value: stats?.totalApplications ?? 45,
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
      route: "applications"
    },
    {
      title: "Average Skill Match",
      value: `${stats?.averageSkillMatch ?? 74}%`,
      icon: Percent,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      route: "skill-gap"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Title & Subtitle */}
      <PageHeader
        title="Employee Skill Gap Analyzer"
        subtitle="Real-time competency tracking, skill-by-skill gap diagnostics, and automated career path recommendations."
      />

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(m.route)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-500">{m.title}</span>
                <div className={`w-10 h-10 rounded-xl ${m.bg} ${m.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{m.value}</div>
              <div className="mt-2 text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Top Skill Gaps & System Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* TOP SKILL GAPS */}
        <div className="lg:col-span-7">
          <Card
            title="TOP SKILL GAPS"
            subtitle="Most frequent competency deficits identified across all analyzed candidates"
            headerAction={
              <button
                onClick={() => navigate("recommendations")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View Recommendations <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="space-y-5">
              {(stats?.topSkillGaps || []).map((gapItem, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      {gapItem.skillName}
                    </span>
                    <span className="text-slate-500">
                      {gapItem.count} candidate{gapItem.count !== 1 ? "s" : ""} affected
                    </span>
                  </div>
                  <ProgressBar
                    value={gapItem.count}
                    max={Math.max(...(stats?.topSkillGaps || [{ count: 1 }]).map((g) => g.count), 1)}
                    color={i === 0 ? "bg-rose-500" : i === 1 ? "bg-amber-500" : "bg-indigo-500"}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Navigation Panel */}
        <div className="lg:col-span-5">
          <Card
            title="SYSTEM MODULES"
            subtitle="Direct navigation across core analyzer workflows"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Employees / Students", desc: "Manage candidate profiles & skills", icon: Users, route: "students" },
                { title: "Skills Catalog", desc: "Browse categorized technical skills", icon: Award, route: "skills" },
                { title: "Job Openings", desc: "Inspect required job competencies", icon: Briefcase, route: "jobs" },
                { title: "Skill Gap Analyzer", desc: "Run side-by-side gap matrix", icon: Sparkles, route: "skill-gap" },
                { title: "Recommendations", desc: "Priority-based learning roadmaps", icon: BookOpen, route: "recommendations" },
                { title: "Applications", desc: "Track candidate job submissions", icon: FileText, route: "applications" }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => navigate(item.route)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      {item.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}