import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  BookOpen, 
  ExternalLink, 
  Send, 
  Sparkles, 
  Briefcase, 
  Check 
} from "lucide-react";
import MatchScoreGauge from "../components/MatchScoreGauge";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

export default function JobDetailView({ jobId, onBack, onNavigateApplications }) {
  const { user, addToast } = useAuth();
  const [job, setJob] = useState(null);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);

    const url = user ? `/api/jobs/${jobId}?userId=${user.id}` : `/api/jobs/${jobId}`;

    Promise.all([
      fetch(url).then((res) => res.json()),
      user ? fetch(`/api/applications?userId=${user.id}&role=candidate`).then((res) => res.json()) : Promise.resolve([])
    ])
      .then(([jobData, userApps]) => {
        setJob(jobData.job);
        setGapAnalysis(jobData.gapAnalysis);
        
        // Check if user has already applied
        const already = userApps.some((a) => a.jobId === jobId);
        setHasApplied(already);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading job details:", err);
        setLoading(false);
      });
  }, [jobId, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast("Please log in as a candidate to apply", "info");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          userId: user.id,
          coverNote
        })
      });

      if (res.ok) {
        addToast(`Successfully applied to ${job.title}!`, "success");
        setHasApplied(true);
        setIsApplyModalOpen(false);
      } else {
        const data = await res.json();
        addToast(data.error || "Application failed", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500 text-xs">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Analyzing job requirements and computing skill gap...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">
        Job not found.
        <button onClick={onBack} className="block mx-auto mt-2 text-indigo-600 font-semibold text-xs">
          Return to jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs List
      </button>

      {/* Main Job Hero Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-xs">
              {job.department}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
              {job.workType}
            </span>
            <span className="text-slate-400 text-xs">• Posted {job.postedDate}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {job.title}
          </h1>

          <div className="text-xs font-semibold text-slate-600 flex items-center gap-4 flex-wrap">
            <span className="text-slate-800 font-bold">🏢 {job.company}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {job.salary}
            </span>
            <span className="text-slate-500">🎓 {job.experienceLevel}</span>
          </div>
        </div>

        {/* Apply CTA & Status */}
        <div className="flex flex-col sm:items-end gap-3">
          {hasApplied ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs shadow-sm">
              <Check className="w-4 h-4 text-emerald-600" />
              Applied for this Position
            </div>
          ) : (
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              Apply for Position
            </button>
          )}

          {hasApplied && (
            <button
              onClick={onNavigateApplications}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Track in My Applications ➔
            </button>
          )}
        </div>
      </div>

      {/* ================= SKILL GAP ANALYSIS MATRIX ================= */}
      {gapAnalysis && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Intelligent Skill Gap Matrix
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Candidate Competency Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation comparing your declared skill proficiency against {job.title} prerequisites.
              </p>
            </div>

            {/* Circular Match Gauge */}
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <MatchScoreGauge score={gapAnalysis.matchScore} size="lg" />
              <div className="text-xs">
                <div className="font-bold text-slate-900">{gapAnalysis.matchScore}% Overall Match</div>
                <div className="text-slate-500 text-[11px]">
                  {gapAnalysis.matchedCount} of {gapAnalysis.totalRequired} skills matched
                </div>
              </div>
            </div>
          </div>

          {/* 3 Matrix Columns: Matched, Level Gap, Missing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Matched Skills */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Matched Skills
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-extrabold text-[10px]">
                  {gapAnalysis.matchedCount}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700">
                You meet or exceed the required proficiency levels for these skills:
              </p>

              <div className="space-y-2">
                {gapAnalysis.matched.length === 0 ? (
                  <p className="text-xs text-emerald-600 italic">No skills currently matched.</p>
                ) : (
                  gapAnalysis.matched.map((sk) => (
                    <div
                      key={sk.skillId}
                      className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs space-y-1 shadow-2xs"
                    >
                      <div className="font-bold text-emerald-950 flex items-center justify-between">
                        <span>{sk.name}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                          {sk.userProficiency}
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-600">
                        Job requires: {sk.minProficiency} {sk.mandatory && "• Mandatory"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Proficiency Gaps */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Proficiency Level Gap
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[10px]">
                  {gapAnalysis.levelGapCount}
                </span>
              </div>
              <p className="text-[11px] text-amber-700">
                You know these skills, but the role seeks higher depth:
              </p>

              <div className="space-y-2">
                {gapAnalysis.levelGaps.length === 0 ? (
                  <p className="text-xs text-amber-600 italic">No proficiency gaps detected.</p>
                ) : (
                  gapAnalysis.levelGaps.map((sk) => (
                    <div
                      key={sk.skillId}
                      className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs space-y-1 shadow-2xs"
                    >
                      <div className="font-bold text-amber-950 flex items-center justify-between">
                        <span>{sk.name}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                          Level Up Needed
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-700">
                        You have: <span className="font-semibold">{sk.userProficiency}</span> ➔ Needs: <span className="font-semibold">{sk.minProficiency}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-900">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  Missing Skills
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-extrabold text-[10px]">
                  {gapAnalysis.missingCount}
                </span>
              </div>
              <p className="text-[11px] text-rose-700">
                Skills required by this role not currently present in your profile:
              </p>

              <div className="space-y-2">
                {gapAnalysis.missing.length === 0 ? (
                  <p className="text-xs text-rose-600 italic">You have every required skill!</p>
                ) : (
                  gapAnalysis.missing.map((sk) => (
                    <div
                      key={sk.skillId}
                      className="p-2.5 rounded-xl bg-white border border-rose-200 text-xs space-y-1 shadow-2xs"
                    >
                      <div className="font-bold text-rose-950 flex items-center justify-between">
                        <span>{sk.name}</span>
                        {sk.mandatory && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-rose-600">
                        Target proficiency: {sk.minProficiency}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bonus Skills */}
          {gapAnalysis.additionalUserSkills && gapAnalysis.additionalUserSkills.length > 0 && (
            <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-500">✨ Additional Skills You Bring:</span>
              {gapAnalysis.additionalUserSkills.map((sk) => (
                <span key={sk.skillId} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                  {sk.name} ({sk.proficiency})
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= RECOMMENDATIONS ENGINE ("BRIDGE THE GAP") ================= */}
      {gapAnalysis && gapAnalysis.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 rounded-3xl border border-indigo-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recommended Learning Roadmap
              </h2>
              <p className="text-xs text-slate-500">
                Curated courses and official guides to bridge your skill gap for this position.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gapAnalysis.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                      {rec.skillName} • {rec.gapType}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {rec.provider} ({rec.difficulty})
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {rec.title}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-1">
                    ⏱ Duration: {rec.duration} • Type: {rec.type}
                  </div>
                </div>

                <a
                  href={rec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-100"
                >
                  Start Learning <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Description & Responsibilities */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">About the Opportunity</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {job.description}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Key Responsibilities</h2>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside">
            {(job.responsibilities || []).map((resp, i) => (
              <li key={i}>{resp}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
        subtitle={`${job.company} • ${job.location}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleApply} className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Candidate: {user?.name}</span>
              <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                {gapAnalysis?.matchScore || 0}% Fit Score
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Your profile, contact details, and declared skills will automatically be submitted to the hiring manager.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cover Statement / Note to Recruiter
            </label>
            <textarea
              rows={4}
              required
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight your enthusiasm, relevant projects, or how you plan to address any skill gaps..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
