import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  Sparkles,
  SlidersHorizontal
} from "lucide-react";
import MatchScoreGauge from "../components/MatchScoreGauge";
import { useAuth } from "../context/AuthContext";

export default function BrowseJobs({ onSelectJob }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [workType, setWorkType] = useState("all");
  const [minMatch, setMinMatch] = useState(0);

  const fetchJobs = async () => {
    try {
      const url = user ? `/api/jobs?userId=${user.id}` : "/api/jobs";
      const res = await fetch(url);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const userSkillIds = new Set((user?.skills || []).map((s) => s.skillId.toLowerCase()));

  const filteredJobs = jobs.filter((job) => {
    const q = search.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.requiredSkills.some((s) => s.name.toLowerCase().includes(q));

    const matchesDept = department === "all" || job.department === department;
    const matchesWork = workType === "all" || job.workType === workType;
    const matchesScore = !user || (job.matchScore || 0) >= minMatch;

    return matchesSearch && matchesDept && matchesWork && matchesScore;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse Available Jobs</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Positions are scored based on your current skills. Click on any job to view detailed Skill Gap Analysis and Course Recommendations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, company, or required skill (e.g. React, Python)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs border border-slate-200 font-medium text-slate-700 bg-white"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product Engineering">Product Engineering</option>
              <option value="AI Research & Platform">AI Research & Platform</option>
              <option value="Operations & SRE">Operations & SRE</option>
              <option value="Interactive Web">Interactive Web</option>
            </select>

            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs border border-slate-200 font-medium text-slate-700 bg-white"
            >
              <option value="all">All Work Types</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>
        </div>

        {/* Match Percentage Filter Slider */}
        {user && (
          <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              Minimum Match Score: {minMatch}%
            </span>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minMatch}
              onChange={(e) => setMinMatch(parseInt(e.target.value, 10))}
              className="w-48 accent-indigo-600 cursor-pointer"
            />
            <span className="text-slate-400 text-[11px]">
              Showing {filteredJobs.length} matching opportunities
            </span>
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading available positions...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
          No positions found matching your search and filter criteria. Try lowering the match score threshold!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header: Dept & Match Score */}
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                    {job.department}
                  </span>
                  {user && <MatchScoreGauge score={job.matchScore} size="sm" />}
                </div>

                {/* Job Title & Company */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {job.title}
                  </h3>
                  <div className="text-xs font-semibold text-slate-600 mt-0.5">
                    🏢 {job.company}
                  </div>
                </div>

                {/* Meta details */}
                <div className="text-xs text-slate-500 space-y-1 py-1 border-t border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location} ({job.workType})</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{job.salary}</span>
                  </div>
                </div>

                {/* Required Skills list with Candidate Match Indicator */}
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Skills ({job.requiredSkills.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.map((sk) => {
                      const isCandidateSkill = userSkillIds.has(sk.skillId.toLowerCase());
                      return (
                        <span
                          key={sk.skillId}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                            isCandidateSkill
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
                              : "bg-slate-100 border-slate-200 text-slate-600"
                          }`}
                        >
                          {isCandidateSkill && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {sk.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2">
                <button
                  onClick={() => onSelectJob(job.id)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  Skill Gap & Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
