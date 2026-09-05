import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  User, 
  Briefcase, 
  Award, 
  AlertCircle 
} from "lucide-react";
import Modal from "../components/Modal";
import MatchScoreGauge from "../components/MatchScoreGauge";
import SkillBadge from "../components/SkillBadge";
import { useAuth } from "../context/AuthContext";

export default function AdminApplications() {
  const { addToast } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [selectedApp, setSelectedApp] = useState(null);
  const [gapDetails, setGapDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Status edit
  const [newStatus, setNewStatus] = useState("");
  const [recruiterNotes, setRecruiterNotes] = useState("");

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openAppDetails = async (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setRecruiterNotes(app.notes || "");
    setModalLoading(true);

    try {
      // Fetch dynamic gap analysis between this user and this job
      const res = await fetch(`/api/jobs/${app.jobId}?userId=${app.userId}`);
      if (res.ok) {
        const data = await res.json();
        setGapDetails(data.gapAnalysis);
      }
    } catch (err) {
      console.error("Error loading gap analysis for modal:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      const res = await fetch(`/api/applications/${selectedApp.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes: recruiterNotes })
      });

      if (res.ok) {
        addToast(`Application status updated to "${newStatus}"!`, "success");
        setSelectedApp(null);
        fetchApplications();
      } else {
        addToast("Failed to update status", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const statusBadges = {
    Applied: "bg-blue-50 text-blue-700 border-blue-200",
    Reviewing: "bg-amber-50 text-amber-700 border-amber-200",
    "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
    "Interview Scheduled": "bg-purple-50 text-purple-700 border-purple-200",
    Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200"
  };

  const filteredApps = applications.filter((app) => {
    const q = search.toLowerCase();
    const matchesSearch =
      app.applicantName.toLowerCase().includes(q) ||
      app.jobTitle.toLowerCase().includes(q) ||
      app.company.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Applicant Tracking & Match Review</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review candidates who applied for open positions, evaluate skill gap scores, and update candidate stages.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search applicants, positions, or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-slate-200 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Reviewing">Reviewing</option>
            <option value="Under Review">Under Review</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading applications...</div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
          No applications found matching criteria.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Applied Position</th>
                  <th className="px-6 py-3.5">Skill Match</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{app.applicantName}</div>
                      <div className="text-[11px] text-slate-400">{app.applicantEmail}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{app.jobTitle}</div>
                      <div className="text-[11px] text-slate-400">{app.company}</div>
                    </td>

                    <td className="px-6 py-4">
                      <MatchScoreGauge score={app.matchScore} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {app.appliedDate}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusBadges[app.status] || "bg-slate-100 text-slate-700"}`}>
                        {app.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openAppDetails(app)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors"
                      >
                        Inspect & Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Detail & Skill Gap Modal */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`Application: ${selectedApp.applicantName}`}
          subtitle={`Position: ${selectedApp.jobTitle} at ${selectedApp.company}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6 text-xs">
            {/* Header Match Badge */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-4">
                <MatchScoreGauge score={selectedApp.matchScore} size="lg" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedApp.matchScore}% Skill Fit Score
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Calculated by comparing declared competencies against job requirements.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Submitted</span>
                <span className="font-semibold text-slate-700">{selectedApp.appliedDate}</span>
              </div>
            </div>

            {/* Candidate Cover Note */}
            <div>
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                Candidate Note / Cover Statement
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-slate-700 italic leading-relaxed">
                "{selectedApp.coverNote || "No cover statement provided."}"
              </div>
            </div>

            {/* Live Skill Gap Breakdown for Recruiter */}
            <div>
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-600" />
                Candidate Skill Gap Breakdown
              </div>

              {modalLoading ? (
                <div className="p-4 text-center text-slate-400">Loading skill gap matrix...</div>
              ) : gapDetails ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Matched Skills */}
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <div className="font-bold text-emerald-900 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Matched Skills ({gapDetails.matchedCount})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {gapDetails.matched.length === 0 ? (
                        <span className="text-emerald-700 italic text-[11px]">None matched</span>
                      ) : (
                        gapDetails.matched.map((sk) => (
                          <span
                            key={sk.skillId}
                            className="px-2 py-0.5 rounded bg-white text-emerald-900 border border-emerald-200 text-[11px] font-semibold"
                          >
                            ✓ {sk.name} ({sk.userProficiency})
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                    <div className="font-bold text-rose-900 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      Missing Skills ({gapDetails.missingCount})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {gapDetails.missing.length === 0 ? (
                        <span className="text-rose-700 italic text-[11px]">Zero missing skills! Complete fit.</span>
                      ) : (
                        gapDetails.missing.map((sk) => (
                          <span
                            key={sk.skillId}
                            className="px-2 py-0.5 rounded bg-white text-rose-900 border border-rose-200 text-[11px] font-semibold"
                          >
                            ✗ {sk.name} (Requires {sk.minProficiency})
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Recruiter Action Form */}
            <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-200 space-y-3">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Recruitment Action & Feedback
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  >
                    <option value="Applied">Applied (New)</option>
                    <option value="Reviewing">Reviewing</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Accepted">Accepted / Make Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Recruiter Notes / Next Steps</label>
                  <input
                    type="text"
                    value={recruiterNotes}
                    onChange={(e) => setRecruiterNotes(e.target.value)}
                    placeholder="e.g. Technical screen scheduled for Thursday..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                >
                  Save Status & Notes
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
