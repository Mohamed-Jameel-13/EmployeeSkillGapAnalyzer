import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  Briefcase, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import MatchScoreGauge from "../components/MatchScoreGauge";
import { useAuth } from "../context/AuthContext";

export default function MyApplications({ setActiveTab, onSelectJob }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyApps = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/applications?userId=${user.id}&role=candidate`);
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching candidate applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApps();
  }, [user]);

  const stages = [
    { key: "Applied", label: "Application Received" },
    { key: "Under Review", label: "Under Review" },
    { key: "Interview Scheduled", label: "Interview Scheduled" },
    { key: "Accepted", label: "Decision / Offer" }
  ];

  const getStageIndex = (status) => {
    if (status === "Applied") return 0;
    if (status === "Reviewing" || status === "Under Review") return 1;
    if (status === "Interview Scheduled") return 2;
    if (status === "Accepted" || status === "Rejected") return 3;
    return 0;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Job Applications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track real-time progress, interview updates, and recruiter feedback.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("browse-jobs")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          Browse More Jobs ➔
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading application records...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse active jobs, review your skill gap match, and submit applications directly with one click!
          </p>
          <button
            onClick={() => setActiveTab("browse-jobs")}
            className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Explore Open Positions
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isRejected = app.status === "Rejected";

            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5 hover:border-indigo-200 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{app.jobTitle}</h3>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">
                      🏢 {app.company} • Applied on {app.appliedDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MatchScoreGauge score={app.matchScore} size="sm" />
                    <button
                      onClick={() => onSelectJob(app.jobId)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      View Job Specs <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Stepper */}
                <div className="pt-2">
                  <div className="grid grid-cols-4 gap-2">
                    {stages.map((stage, idx) => {
                      const isPast = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;
                      const isFuture = idx > currentStageIdx;

                      let stepColor = "bg-slate-200 text-slate-400";
                      let textColor = "text-slate-400";

                      if (isPast) {
                        stepColor = "bg-emerald-500 text-white";
                        textColor = "text-emerald-700 font-semibold";
                      } else if (isCurrent) {
                        stepColor = isRejected
                          ? "bg-rose-500 text-white"
                          : "bg-indigo-600 text-white";
                        textColor = isRejected
                          ? "text-rose-600 font-bold"
                          : "text-indigo-700 font-bold";
                      }

                      return (
                        <div key={idx} className="space-y-1.5 text-center">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isPast
                                ? "bg-emerald-500"
                                : isCurrent
                                ? isRejected ? "bg-rose-500" : "bg-indigo-600"
                                : "bg-slate-100"
                            }`}
                          />
                          <div className={`text-[11px] leading-tight ${textColor}`}>
                            {isCurrent && isRejected ? "Application Not Selected" : stage.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recruiter Notes / Status Callout */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800">Employer Feedback & Notes:</span>
                    <p className="text-slate-600 leading-relaxed">
                      {app.notes || "Your application is being reviewed by the hiring committee."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
