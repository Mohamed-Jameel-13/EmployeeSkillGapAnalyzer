import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Plus,
  Trash2,
  X
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import ProficiencyBadge from "../components/ProficiencyBadge";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import MatchScoreGauge from "../components/MatchScoreGauge";
import { useRouter } from "../routes/Router";
import { useAnalysis } from "../context/AnalysisContext";
import { getJobById, getJobSkills, addOrUpdateJobSkill, deleteJobSkill, deleteJob } from "../api/jobs";
import { getSkills } from "../api/skills";

export default function JobDetails() {
  const { params, navigate } = useRouter();
  const { selectedStudentId, selectedJobId, setSelectedJobId, getMatchScore, fetchGapAnalysis } = useAnalysis();
  const jobId = parseInt(params.jobId || selectedJobId || 501, 10);

  const [job, setJob] = useState(null);
  const [skills, setSkills] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Skill Modal
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [requiredLevel, setRequiredLevel] = useState(3);
  const [mandatory, setMandatory] = useState(true);
  const [submittingSkill, setSubmittingSkill] = useState(false);
  const [skillFormError, setSkillFormError] = useState(null);

  const matchScore = getMatchScore(selectedStudentId, jobId);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      setSelectedJobId(jobId);
      const [jobData, skillsData, catalogData] = await Promise.all([
        getJobById(jobId),
        getJobSkills(jobId),
        getSkills()
      ]);

      if (!jobData) throw new Error(`Job #${jobId} not found`);

      setJob(jobData);
      setSkills(skillsData || jobData.skills || []);
      setCatalog(catalogData || []);
      if (catalogData && catalogData.length > 0) {
        setSelectedSkillId(catalogData[0].id);
        setNewSkillName(catalogData[0].name);
      }

      if (selectedStudentId && matchScore === null) {
        fetchGapAnalysis(selectedStudentId, jobId).catch(() => {});
      }
    } catch (err) {
      setError(err.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [jobId]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setSkillFormError(null);
    if (!newSkillName.trim()) {
      setSkillFormError("Skill name is required");
      return;
    }
    setSubmittingSkill(true);
    try {
      await addOrUpdateJobSkill(jobId, {
        skillId: selectedSkillId || undefined,
        skillName: newSkillName.trim(),
        requiredLevel: parseInt(requiredLevel, 10),
        mandatory: !!mandatory
      });
      const freshSkills = await getJobSkills(jobId);
      setSkills(freshSkills || []);
      setIsSkillModalOpen(false);
    } catch (err) {
      setSkillFormError(err.message || "Failed to add required skill");
    } finally {
      setSubmittingSkill(false);
    }
  };

  const handleDeleteJobSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to remove this skill requirement?")) return;
    try {
      await deleteJobSkill(jobId, skillId);
      const freshSkills = await getJobSkills(jobId);
      setSkills(freshSkills || []);
    } catch (err) {
      alert(err.message || "Failed to remove required skill");
    }
  };

  const handleDeleteJob = async () => {
    if (!window.confirm(`Are you sure you want to delete job "${job?.title}"?`)) return;
    try {
      await deleteJob(jobId);
      navigate("jobs");
    } catch (err) {
      alert(err.message || "Failed to delete job");
    }
  };

  if (loading) return <LoadingState message="Loading job opening and required skill baselines..." />;
  if (error) return <ErrorState title="Job Details Error" message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("jobs")}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs List
      </button>

      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
            <Briefcase className="w-3.5 h-3.5" />
            🏢 {job.company}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {job.title}
          </h1>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.location}
            </span>
            <span>Job ID: #{job.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {matchScore !== null && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <MatchScoreGauge score={matchScore} size="md" showLabel={true} />
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            icon={Sparkles}
            onClick={() => {
              setSelectedJobId(job.id);
              navigate("skill-gap", { jobId: job.id, studentId: selectedStudentId });
            }}
          >
            Analyze Candidate
          </Button>

          <Button
            variant="outline"
            size="lg"
            icon={Trash2}
            onClick={handleDeleteJob}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Delete Job
          </Button>
        </div>
      </div>

      {/* Description */}
      <Card title="Role Overview & Requirements">
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {job.description || "Comprehensive technical position requiring verified proficiency thresholds across engineering domains."}
        </p>
      </Card>

      {/* Required Skills Table */}
      <Card
        title="Required Skills & Target Proficiency"
        subtitle="Exact competency thresholds and mandatory flags specified for this role"
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setIsSkillModalOpen(true)}
          >
            Add Required Skill
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Skill Name</th>
                <th className="px-6 py-3.5">Required Proficiency</th>
                <th className="px-6 py-3.5">Classification</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {skills.map((sk) => (
                <tr key={sk.skillId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                    {sk.skillName}
                  </td>

                  <td className="px-6 py-4">
                    <ProficiencyBadge level={sk.requiredProficiency || sk.requiredLevel} />
                  </td>

                  <td className="px-6 py-4">
                    {sk.mandatory ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                        Mandatory
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                        Optional / Supporting
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      title="Remove skill requirement"
                      onClick={() => handleDeleteJobSkill(sk.skillId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Skill Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Skill Requirement to {job.title}</h3>
              <button
                onClick={() => setIsSkillModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {skillFormError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{skillFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Skill Name</label>
                <div className="space-y-2">
                  <select
                    value={selectedSkillId !== null ? selectedSkillId : "custom"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setSelectedSkillId(null);
                        setNewSkillName("");
                      } else {
                        const sId = parseInt(val, 10);
                        setSelectedSkillId(sId);
                        const match = catalog.find((c) => c.id === sId);
                        if (match) setNewSkillName(match.name);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:border-indigo-600 focus:outline-none"
                  >
                    {catalog.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                    <option value="custom">+ Type a different skill...</option>
                  </select>

                  {selectedSkillId === null && (
                    <input
                      type="text"
                      placeholder="Enter custom skill name (e.g. Docker, GraphQL)"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-indigo-600 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Required Level (1 - 5)</label>
                <select
                  value={requiredLevel}
                  onChange={(e) => setRequiredLevel(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:border-indigo-600 focus:outline-none"
                >
                  <option value={1}>1 - Beginner</option>
                  <option value={2}>2 - Basic</option>
                  <option value={3}>3 - Intermediate</option>
                  <option value={4}>4 - Advanced</option>
                  <option value={5}>5 - Expert</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mandatoryCheck"
                  checked={mandatory}
                  onChange={(e) => setMandatory(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <label htmlFor="mandatoryCheck" className="font-bold text-slate-700 cursor-pointer">
                  Mandatory Requirement (must be met for full match)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setIsSkillModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submittingSkill}>
                  {submittingSkill ? "Adding..." : "Add Requirement"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}