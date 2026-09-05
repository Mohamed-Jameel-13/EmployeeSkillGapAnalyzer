import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  MapPin, 
  Eye, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  ArrowRight 
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useRouter } from "../routes/Router";
import { getJobs } from "../api/jobs";

export default function JobList() {
  const { navigate } = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

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
      <PageHeader
        title="Target Job Openings"
        subtitle="Explore open engineering positions and required skill baselines for candidate gap evaluation."
      />

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
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                  {job.company}
                </span>

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
                  onClick={() => navigate("job-details", { jobId: job.id })}
                >
                  View Details
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => navigate("skill-gap", { jobId: job.id })}
                >
                  Analyze Candidate
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}