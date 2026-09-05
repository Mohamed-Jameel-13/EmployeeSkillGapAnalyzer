import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Send, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle,
  User,
  Briefcase,
  X
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { useRouter } from "../routes/Router";
import { getApplications, createApplication } from "../api/applications";
import { getStudents } from "../api/students";
import { getJobs } from "../api/jobs";

export default function Applications() {
  const { navigate } = useRouter();
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Create Application Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsData, studentsList, jobsList] = await Promise.all([
        getApplications(),
        getStudents(),
        getJobs()
      ]);

      setApplications(appsData || []);
      setStudents(studentsList || []);
      setJobs(jobsList || []);

      if (studentsList?.length > 0) setSelectedStudentId(studentsList[0].id);
      if (jobsList?.length > 0) setSelectedJobId(jobsList[0].id);
    } catch (err) {
      setError(err.message || "Failed to load application records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedStudentId || !selectedJobId) {
      setModalError("Please select both a student and a job");
      return;
    }

    setSubmitting(true);
    try {
      // Contract: POST /api/applications
      await createApplication({
        studentId: parseInt(selectedStudentId, 10),
        jobId: parseInt(selectedJobId, 10)
      });

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setModalError(err.message || "Failed to create application");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    "Applied": "bg-blue-50 text-blue-700 border-blue-200",
    "Under Review": "bg-amber-50 text-amber-800 border-amber-200",
    "Shortlisted": "bg-purple-50 text-purple-700 border-purple-200",
    "Selected": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Rejected": "bg-rose-50 text-rose-700 border-rose-200"
  };

  const filteredApps = applications.filter((app) => {
    const q = search.toLowerCase();
    return (
      app.studentName?.toLowerCase().includes(q) ||
      app.jobTitle?.toLowerCase().includes(q) ||
      app.company?.toLowerCase().includes(q) ||
      app.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Job Applications"
        subtitle="Manage and inspect submitted candidate applications, match scores, and status stages."
        action={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Create Application
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
        <input
          type="text"
          placeholder="Search by student name, job title, company, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent border-none focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {loading ? (
        <LoadingState message="Fetching applications from REST API..." />
      ) : error ? (
        <ErrorState title="Error Loading Applications" message={error} onRetry={loadData} />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          title="No Applications Found"
          description="No job applications have been submitted yet."
          action={
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Submit First Application
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Student / Employee</th>
                  <th className="px-6 py-3.5">Job Position</th>
                  <th className="px-6 py-3.5">Match Percentage</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{app.studentName}</div>
                      <div className="text-[11px] text-slate-400">{app.studentEmail}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{app.jobTitle}</div>
                      <div className="text-[11px] text-slate-500">{app.company}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                        {app.matchPercentage}% Match
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {app.appliedDate || "2026-09-02"}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${statusColors[app.status] || "bg-slate-100 text-slate-700"}`}>
                        {app.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate("skill-gap", { studentId: app.studentId, jobId: app.jobId })}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs transition-colors"
                      >
                        Inspect Gap
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Create Candidate Application
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Candidate</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:border-indigo-600 focus:outline-none"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Target Job</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:border-indigo-600 focus:outline-none"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} • {j.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  icon={Send}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}