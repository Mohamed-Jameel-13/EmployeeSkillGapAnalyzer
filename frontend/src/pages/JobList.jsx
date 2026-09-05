import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  MapPin, 
  Eye, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  Plus,
  Trash2,
  X,
  AlertCircle
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import MatchScoreGauge from "../components/MatchScoreGauge";
import { useRouter } from "../routes/Router";
import { useAnalysis } from "../context/AnalysisContext";
import { getJobs, createJob, deleteJob } from "../api/jobs";

export default function JobList() {
  const { navigate } = useRouter();
  const { selectedStudentId, setSelectedJobId, getMatchScore, preloadJobMatches } = useAnalysis();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Add Job Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newLocation, setNewLocation] = useState("Bangalore, India");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJobs();
      setJobs(data || []);
      if (selectedStudentId && Array.isArray(data)) {
        preloadJobMatches(selectedStudentId, data);
      }
    } catch (err) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [selectedStudentId]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!newTitle.trim() || !newCompany.trim() || !newLocation.trim()) {
      setFormError("Title, Company, and Location are required");
      return;
    }
    setSubmitting(true);
    try {
      await createJob({
        title: newTitle.trim(),
        company: newCompany.trim(),
        location: newLocation.trim()
      });
      setIsAddOpen(false);
      setNewTitle("");
      setNewCompany("");
      loadJobs();
    } catch (err) {
      setFormError(err.message || "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete job opening "${title}" (ID #${id})?`)) {
      return;
    }
    try {
      await deleteJob(id);
      loadJobs();
    } catch (err) {
      alert(err.message || "Failed to delete job");
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.skills && j.skills.some((s) => s.skillName.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Target Job Openings"
          subtitle="Explore open engineering positions and required skill baselines for candidate gap evaluation."
        />
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsAddOpen(true)}
          className="shrink-0"
        >
          Add Job Opening
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
        <input
          type="text"
          placeholder="Search by job title, company, or required skill (e.g. Java Full Stack Developer)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent border-none focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {loading ? (
        <LoadingState message="Fetching job listings from REST API..." />
      ) : error ? (
        <ErrorState title="Error Loading Jobs" message={error} onRetry={loadJobs} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const matchScore = getMatchScore(selectedStudentId, job.id);
            return (
              <div
                key={job.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                      {job.company}
                    </span>
                    <div className="flex items-center gap-2">
                      {matchScore !== null && (
                        <div className="flex items-center gap-1.5" title={`${matchScore}% Candidate Match`}>
                          <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Match:</span>
                          <MatchScoreGauge score={matchScore} size="sm" showLabel={false} />
                        </div>
                      )}
                      <button
                        type="button"
                        title="Delete job"
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {job.title}
                  </h3>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.location}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Required Skills Summary */}
                  <div className="pt-2 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Required Skills ({job.skills?.length || 0})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(job.skills || []).map((sk) => (
                        <span
                          key={sk.skillId}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                        >
                          {sk.skillName} ({sk.requiredProficiency}/5)
                          {sk.mandatory && <span className="text-rose-500 font-bold ml-0.5">*</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      navigate("job-details", { jobId: job.id });
                    }}
                  >
                    View Details
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      navigate("skill-gap", { jobId: job.id, studentId: selectedStudentId });
                    }}
                  >
                    Analyze Candidate
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Job Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Job Opening</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Amazon, Infosys"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore, India / Remote"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? "Posting..." : "Post Job Opening"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}