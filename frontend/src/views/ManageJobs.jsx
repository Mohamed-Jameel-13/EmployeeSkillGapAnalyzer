import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Check, 
  AlertCircle 
} from "lucide-react";
import Modal from "../components/Modal";
import SkillBadge from "../components/SkillBadge";
import { useAuth } from "../context/AuthContext";

export default function ManageJobs() {
  const { addToast } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [skillsCatalog, setSkillsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    department: "Engineering",
    location: "Remote",
    workType: "Remote",
    salary: "$120,000 - $140,000",
    experienceLevel: "Mid-Senior (3-5 yrs)",
    description: "",
    responsibilitiesText: "",
    requiredSkills: []
  });

  // Skill adding within modal
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState("Intermediate");
  const [isMandatory, setIsMandatory] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      setSkillsCatalog(data);
      if (data.length > 0) setSelectedSkillId(data[0].id);
    } catch (err) {
      console.error("Error fetching skills catalog:", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchJobs(), fetchSkills()]).finally(() => setLoading(false));
  }, []);

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      company: "SkillBridge Global",
      department: "Engineering",
      location: "Remote",
      workType: "Remote",
      salary: "$110,000 - $135,000",
      experienceLevel: "Mid-Level (2-4 yrs)",
      description: "Seeking a motivated engineer to join our dynamic team.",
      responsibilitiesText: "Write clean, robust code.\nCollaborate across engineering squads.\nParticipate in code reviews.",
      requiredSkills: [
        { skillId: "react", name: "React", minProficiency: "Intermediate", mandatory: true },
        { skillId: "typescript", name: "TypeScript", minProficiency: "Intermediate", mandatory: true }
      ]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      department: job.department,
      location: job.location,
      workType: job.workType,
      salary: job.salary,
      experienceLevel: job.experienceLevel,
      description: job.description,
      responsibilitiesText: (job.responsibilities || []).join("\n"),
      requiredSkills: [...(job.requiredSkills || [])]
    });
    setIsModalOpen(true);
  };

  const handleAddSkillToJob = () => {
    if (!selectedSkillId) return;
    const catalogItem = skillsCatalog.find((s) => s.id === selectedSkillId);
    if (!catalogItem) return;

    if (formData.requiredSkills.some((s) => s.skillId === selectedSkillId)) {
      addToast("Skill is already in the requirements list", "info");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      requiredSkills: [
        ...prev.requiredSkills,
        {
          skillId: catalogItem.id,
          name: catalogItem.name,
          minProficiency: selectedProficiency,
          mandatory: isMandatory
        }
      ]
    }));
  };

  const handleRemoveSkillFromJob = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s.skillId !== skillId)
    }));
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    const responsibilities = formData.responsibilitiesText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      responsibilities
    };

    try {
      let res;
      if (editingJob) {
        res = await fetch(`/api/jobs/${editingJob.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        addToast(editingJob ? "Job updated successfully!" : "Job created successfully!", "success");
        setIsModalOpen(false);
        fetchJobs();
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to save job", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Job deleted successfully", "success");
        fetchJobs();
      } else {
        addToast("Failed to delete job", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.requiredSkills.some((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = deptFilter === "all" || j.department.toLowerCase() === deptFilter.toLowerCase();
    return matchesSearch && matchesDept;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Post Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Job Postings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and edit job listings with target required skills and proficiency requirements.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by job title, company, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-700"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product Engineering">Product Engineering</option>
            <option value="AI Research & Platform">AI Research & Platform</option>
            <option value="Operations & SRE">Operations & SRE</option>
            <option value="Interactive Web">Interactive Web</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading jobs...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
          No jobs found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                    {job.department}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                    {job.workType}
                  </span>
                  <span className="text-slate-400 text-xs">• Posted {job.postedDate}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                <div className="text-xs font-semibold text-slate-600 flex items-center gap-4 flex-wrap">
                  <span>🏢 {job.company}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {job.salary}</span>
                </div>

                {/* Required Skills Badges */}
                <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Required Skills:</span>
                  {job.requiredSkills.map((sk) => (
                    <span
                      key={sk.skillId}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200"
                    >
                      {sk.name} <span className="opacity-70 text-[10px]">({sk.minProficiency})</span>
                      {sk.mandatory && <span className="text-rose-500 ml-0.5">*</span>}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <button
                  onClick={() => openEditModal(job)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteJob(job.id, job.title)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? "Edit Job Posting" : "Create New Job Posting"}
        subtitle="Define position requirements, responsibilities, and mandatory skill thresholds."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. CloudScale Systems"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Type</label>
              <select
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Salary Range</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g. $120,000 - $140,000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Experience Level</label>
              <input
                type="text"
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                placeholder="e.g. Mid-Senior (3-5 yrs)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Key Responsibilities (one per line)</label>
            <textarea
              rows={3}
              value={formData.responsibilitiesText}
              onChange={(e) => setFormData({ ...formData, responsibilitiesText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          {/* Required Skills Builder */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="block font-bold text-slate-800">
              Required Skills & Minimum Proficiency Thresholds
            </label>

            {/* Current Added Skills */}
            <div className="flex flex-wrap gap-2 min-h-[32px] p-2 bg-white rounded-lg border border-slate-200">
              {formData.requiredSkills.length === 0 ? (
                <span className="text-slate-400 text-xs italic">No required skills added yet.</span>
              ) : (
                formData.requiredSkills.map((sk) => (
                  <span
                    key={sk.skillId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium text-xs"
                  >
                    <span>{sk.name}</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded">
                      {sk.minProficiency}
                    </span>
                    {sk.mandatory && (
                      <span className="text-[10px] text-rose-600 font-bold">Mandatory</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkillFromJob(sk.skillId)}
                      className="ml-1 text-slate-400 hover:text-rose-600 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Skill Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
              >
                {skillsCatalog.map((sk) => (
                  <option key={sk.id} value={sk.id}>
                    {sk.name} ({sk.category})
                  </option>
                ))}
              </select>

              <select
                value={selectedProficiency}
                onChange={(e) => setSelectedProficiency(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Mandatory
              </label>

              <button
                type="button"
                onClick={handleAddSkillToJob}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
              >
                + Add Requirement
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
            >
              {editingJob ? "Save Changes" : "Publish Job"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
