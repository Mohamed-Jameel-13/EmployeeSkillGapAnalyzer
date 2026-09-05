import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  ArrowRight, 
  User, 
  Briefcase,
  Sparkles
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { useRouter } from "../routes/Router";
import { getStudents } from "../api/students";
import { getJobs } from "../api/jobs";
import { getRecommendations } from "../api/recommendations";

export default function Recommendations() {
  const { params, navigate } = useRouter();

  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState(params.studentId ? parseInt(params.studentId, 10) : 101);
  const [selectedJobId, setSelectedJobId] = useState(params.jobId ? parseInt(params.jobId, 10) : 501);

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getStudents(), getJobs()])
      .then(([studentsList, jobsList]) => {
        setStudents(studentsList || []);
        setJobs(jobsList || []);

        if (studentsList?.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentsList[0].id);
        }
        if (jobsList?.length > 0 && !selectedJobId) {
          setSelectedJobId(jobsList[0].id);
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load candidates and jobs");
      });
  }, []);

  const loadRecommendations = async () => {
    if (!selectedStudentId || !selectedJobId) return;
    setLoading(true);
    setError(null);

    try {
      // Contract: GET /api/students/{studentId}/jobs/{jobId}/recommendations
      const data = await getRecommendations(selectedStudentId, selectedJobId);
      setRecommendations(data || []);
    } catch (err) {
      setError(err.message || "Failed to generate recommendations from REST API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId && selectedJobId) {
      loadRecommendations();
    }
  }, [selectedStudentId, selectedJobId]);

  const priorityStyles = {
    "HIGH PRIORITY": {
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      card: "border-l-4 border-l-rose-500",
      text: "text-rose-700"
    },
    "MEDIUM PRIORITY": {
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      card: "border-l-4 border-l-amber-500",
      text: "text-amber-800"
    },
    "LOW PRIORITY": {
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      card: "border-l-4 border-l-blue-500",
      text: "text-blue-700"
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Targeted Skill Recommendations"
        subtitle="Priority-based learning guidance generated directly by the backend Skill Gap Engine."
      />

      {/* Selector Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Employee / Student:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:border-indigo-600 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role || "Software Engineer"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              Target Job:
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:border-indigo-600 focus:outline-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} • {j.company}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching recommendations from REST API (GET /api/students/{id}/jobs/{id}/recommendations)..." />
      ) : error ? (
        <ErrorState title="Recommendations Error" message={error} onRetry={loadRecommendations} />
      ) : recommendations.length === 0 ? (
        <EmptyState
          title="No Skill Gaps Detected"
          description="This candidate already satisfies all required competencies for this position! No learning gap recommendations needed."
          action={
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() => navigate("skill-gap", { studentId: selectedStudentId, jobId: selectedJobId })}
            >
              View Skill Gap Matrix
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.map((rec, i) => {
            const style = priorityStyles[rec.priority] || priorityStyles["LOW PRIORITY"];
            return (
              <div
                key={i}
                className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${style.card}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg border font-extrabold text-[10px] uppercase tracking-wider ${style.badge}`}>
                      {rec.priority}
                    </span>
                    <span className="text-[11px] font-bold text-rose-600">
                      Gap: -{rec.gap} Level(s)
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {rec.skill}
                  </h3>

                  {/* Level Transition Pill */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">CURRENT</span>
                      <span className="font-extrabold text-slate-800">{rec.current} / 5</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-indigo-500" />
                    <div className="text-right">
                      <span className="text-indigo-600 block text-[10px] font-bold">TARGET</span>
                      <span className="font-extrabold text-indigo-700">{rec.target} / 5</span>
                    </div>
                  </div>

                  {/* Reason Callout */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500">Reason:</span>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {rec.reason}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => navigate("skill-gap", { studentId: selectedStudentId, jobId: selectedJobId })}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    View Gap Diagnosis <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}