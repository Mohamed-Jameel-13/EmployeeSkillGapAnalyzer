import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck
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
import { getJobById, getJobSkills } from "../api/jobs";

export default function JobDetails() {
  const { params, navigate } = useRouter();
  const { selectedStudentId, selectedJobId, setSelectedJobId, getMatchScore, fetchGapAnalysis } = useAnalysis();
  const jobId = parseInt(params.jobId || selectedJobId || 501, 10);

  const [job, setJob] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const matchScore = getMatchScore(selectedStudentId, jobId);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      setSelectedJobId(jobId);
      const [jobData, skillsData] = await Promise.all([
        getJobById(jobId),
        getJobSkills(jobId)
      ]);

      if (!jobData) throw new Error(`Job #${jobId} not found`);

      setJob(jobData);
      setSkills(skillsData || jobData.skills || []);

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

  if (loading) return <LoadingState message="Loading job specifications from REST API..." />;
  if (error) return <ErrorState title="Job Not Found" message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("jobs")}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs List
      </button>

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
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

        <div className="flex items-center gap-4 flex-wrap">
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
        </div>
      </div>

      {/* Description */}
      <Card title="Role Overview & Requirements">
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {job.description}
        </p>
      </Card>

      {/* Required Skills Table from Reference Design */}
      <Card
        title="Required Skills & Target Proficiency"
        subtitle="Exact competency thresholds and mandatory flags specified for this role"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Skill Name</th>
                <th className="px-6 py-3.5">Required Proficiency</th>
                <th className="px-6 py-3.5">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {skills.map((sk) => (
                <tr key={sk.skillId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                    {sk.skillName}
                  </td>

                  <td className="px-6 py-4">
                    <ProficiencyBadge level={sk.requiredProficiency} />
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}