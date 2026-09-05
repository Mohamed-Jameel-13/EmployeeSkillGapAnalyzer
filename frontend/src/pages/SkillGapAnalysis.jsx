import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ArrowRight, 
  BookOpen, 
  Send, 
  User, 
  Briefcase,
  Check
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useRouter } from "../routes/Router";
import { getStudents } from "../api/students";
import { getJobs } from "../api/jobs";
import { getSkillGap } from "../api/skillGap";
import { createApplication } from "../api/applications";

export default function SkillGapAnalysis() {
  const { params, navigate } = useRouter();

  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState(params.studentId ? parseInt(params.studentId, 10) : 101);
  const [selectedJobId, setSelectedJobId] = useState(params.jobId ? parseInt(params.jobId, 10) : 501);

  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

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

  const runAnalysis = async () => {
    if (!selectedStudentId || !selectedJobId) return;
    setLoading(true);
    setError(null);
    setApplySuccess(false);

    try {
      // Contract: GET /api/students/{studentId}/jobs/{jobId}/skill-gap
      const result = await getSkillGap(selectedStudentId, selectedJobId);
      setGapData(result);
    } catch (err) {
      setError(err.message || "Skill gap analysis request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId && selectedJobId) {
      runAnalysis();
    }
  }, [selectedStudentId, selectedJobId]);

  const handleApply = async () => {
    if (!selectedStudentId || !selectedJobId) return;
    setApplying(true);
    try {
      // Contract: POST /api/applications
      await createApplication({
        studentId: selectedStudentId,
        jobId: selectedJobId
      });
      setApplySuccess(true);
    } catch (err) {
      alert("Application submission failed: " + err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Gap Analysis"
        subtitle="Side-by-side competency diagnosis comparing candidate proficiencies against role requirements."
      />

      {/* Candidate & Job Selection Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Select Employee / Student:
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
              Select Target Job:
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
        <LoadingState message="Executing skill gap engine via REST API (GET /api/students/{id}/jobs/{id}/skill-gap)..." />
      ) : error ? (
        <ErrorState title="Analysis Error" message={error} onRetry={runAnalysis} />
      ) : gapData ? (
        <div className="space-y-6">
          {/* Analysis Result Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Analysis Target
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Employee: <span className="text-indigo-600">{gapData.studentName}</span>
              </h2>
              <div className="text-sm font-semibold text-slate-600">
                Job: <span className="text-slate-900">{gapData.jobTitle}</span> • {gapData.company}
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  OVERALL MATCH
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-600">
                  {gapData.overallMatch}%
                </div>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-black text-xl">
                {gapData.overallMatch}%
              </div>
            </div>
          </div>

          {/* Skill-by-Skill Gap Table */}
          <Card
            title="Skill-by-Skill Gap Breakdown"
            subtitle="Formula: gap = max(required_level - current_level, 0). If current >= required -> MATCHED, else GAP."
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Skill</th>
                    <th className="px-6 py-3.5">Current Level</th>
                    <th className="px-6 py-3.5">Required Level</th>
                    <th className="px-6 py-3.5">Gap</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {gapData.breakdown.map((row, idx) => {
                    const isMatched = row.status === "MATCHED";
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-sm">{row.skill}</div>
                          {row.mandatory && (
                            <span className="text-[10px] text-rose-600 font-semibold">
                              * Mandatory Requirement
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                            {row.current} / 5
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                            {row.required} / 5
                          </span>
                        </td>

                        <td className="px-6 py-4 font-mono font-bold">
                          {row.gap === 0 ? (
                            <span className="text-emerald-600 font-bold">0</span>
                          ) : (
                            <span className="text-rose-600 font-bold">-{row.gap}</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isMatched ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              MATCHED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              GAP
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-100/70 rounded-3xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Next Steps for this Candidate</h3>
              <p className="text-xs text-slate-500">
                View priority-ranked skill recommendations or submit a formal job application.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="md"
                icon={BookOpen}
                onClick={() => navigate("recommendations", { studentId: selectedStudentId, jobId: selectedJobId })}
              >
                View Recommendations
              </Button>

              {applySuccess ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                  <Check className="w-4 h-4" /> Application Created!
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  icon={Send}
                  disabled={applying}
                  onClick={handleApply}
                >
                  {applying ? "Submitting..." : "Apply Candidate to Job"}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}