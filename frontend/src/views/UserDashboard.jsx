import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Award, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Briefcase 
} from "lucide-react";
import MatchScoreGauge from "../components/MatchScoreGauge";
import SkillBadge from "../components/SkillBadge";
import { useAuth } from "../context/AuthContext";

export default function UserDashboard({ setActiveTab, onSelectJob }) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/analytics/user/${user.id}`).then((res) => res.json()),
      fetch(`/api/jobs?userId=${user.id}`).then((res) => res.json())
    ])
      .then(([analyticsData, jobsData]) => {
        setAnalytics(analyticsData);
        setRecommendedJobs(jobsData.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading user dashboard:", err);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Candidate Career Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hi, {user?.name || "Candidate"}! 👋
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            Discover jobs scored against your exact skill set. Analyze skill gaps to unlock tailored learning recommendations and boost your hiring match score.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab("browse-jobs")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all"
          >
            <Compass className="w-4 h-4 text-indigo-600" />
            Browse Matched Jobs
          </button>
          <button
            onClick={() => setActiveTab("my-skills")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-sm transition-all"
          >
            <Award className="w-4 h-4 text-amber-300" />
            Update My Skills
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          onClick={() => setActiveTab("my-applications")}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Submitted Applications</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{analytics?.totalApplications ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Track interview progress</div>
        </div>

        <div 
          onClick={() => setActiveTab("my-applications")}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Active Interviews</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700">{analytics?.activeInterviews ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Scheduled by recruiters</div>
        </div>

        <div 
          onClick={() => setActiveTab("my-skills")}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Declared Skills</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{(user?.skills || []).length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Keep updated for best match</div>
        </div>

        <div 
          onClick={() => setActiveTab("browse-jobs")}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">High Match Jobs (70%+)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{analytics?.recommendedJobsCount ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready to apply today</div>
        </div>
      </div>

      {/* Top Recommendations Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Top Recommended Positions For You</h2>
            <p className="text-xs text-slate-500">Based on your verified skills and proficiency levels</p>
          </div>
          <button
            onClick={() => setActiveTab("browse-jobs")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Explore all jobs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px]">
                      {job.department}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium">{job.company}</div>
                  </div>
                  <MatchScoreGauge score={job.matchScore} size="sm" showLabel={false} />
                </div>

                <div className="text-xs text-slate-500 space-y-1 my-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location} ({job.workType})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{job.salary}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Required Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 3).map((sk) => (
                      <span
                        key={sk.skillId}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                      >
                        {sk.name}
                      </span>
                    ))}
                    {job.requiredSkills.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-semibold">
                        +{job.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectJob(job.id)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                Analyze Skill Gap <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
