import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Award, 
  Sparkles, 
  Mail, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  X
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import ProficiencyBadge from "../components/ProficiencyBadge";
import ProgressBar from "../components/ProgressBar";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useRouter } from "../routes/Router";
import { useAnalysis } from "../context/AnalysisContext";
import { getStudentById, getStudentSkills, addOrUpdateStudentSkill } from "../api/students";
import { getSkills } from "../api/skills";
import { PROFICIENCY_LEVELS, isValidProficiency } from "../utils/proficiency";

export default function StudentProfile() {
  const { params, navigate } = useRouter();
  const { setSelectedStudentId, invalidateStudentCache } = useAnalysis();
  const studentId = parseInt(params.studentId || 101, 10);

  const [student, setStudent] = useState(null);
  const [skills, setSkills] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Skill Modal
  const [isModalOpen, setIsModalOpen] = useState(params.openAddSkill === "true");
  const [newSkillName, setNewSkillName] = useState("");
  const [newProficiency, setNewProficiency] = useState(3);
  const [submittingSkill, setSubmittingSkill] = useState(false);
  const [skillFormError, setSkillFormError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentData, skillsData, catalogData] = await Promise.all([
        getStudentById(studentId),
        getStudentSkills(studentId),
        getSkills()
      ]);

      if (!studentData) throw new Error(`Student with ID #${studentId} not found`);

      setStudent(studentData);
      setSkills(skillsData || []);
      setCatalog(catalogData || []);
      if (catalogData && catalogData.length > 0) {
        setNewSkillName(catalogData[0].name);
      }
    } catch (err) {
      setError(err.message || "Failed to load candidate profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setSkillFormError(null);

    if (!newSkillName.trim()) {
      setSkillFormError("Skill name is required");
      return;
    }

    if (!isValidProficiency(newProficiency)) {
      setSkillFormError("Proficiency must be an integer between 1 and 5");
      return;
    }

    setSubmittingSkill(true);
    try {
      // Contract: POST /api/students/{id}/skills
      const updatedSkills = await addOrUpdateStudentSkill(studentId, {
        skillName: newSkillName.trim(),
        proficiency: parseInt(newProficiency, 10)
      });

      setSkills(updatedSkills);
      invalidateStudentCache(studentId);
      setIsModalOpen(false);
    } catch (err) {
      setSkillFormError(err.message || "Failed to save skill");
    } finally {
      setSubmittingSkill(false);
    }
  };

  if (loading) return <LoadingState message="Loading candidate profile and skills from REST API..." />;
  if (error) return <ErrorState title="Profile Error" message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("students")}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students List
      </button>

      {/* Candidate Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
            <Award className="w-3.5 h-3.5" />
            Candidate ID: #{student.id}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Employee: {student.name}
          </h1>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
            <span className="flex items-center gap-1 text-indigo-700 font-bold">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              Role: {student.role || "Java Full Stack Developer"}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {student.email}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Add Skill
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            onClick={() => {
              setSelectedStudentId(student.id);
              navigate("skill-gap", { studentId: student.id });
            }}
          >
            Analyze Skill Gap
          </Button>
        </div>
      </div>

      {/* Skills Inventory Grid */}
      <Card
        title={`Declared Skills & Proficiencies (${skills.length})`}
        subtitle="1 = Beginner, 2 = Basic, 3 = Intermediate, 4 = Advanced, 5 = Expert"
        headerAction={
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Add Skill
          </Button>
        }
      >
        {skills.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-2xl">
            No skills have been added yet for this candidate. Click [Add Skill] above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((sk) => {
              const proficiencyVal = parseInt(sk.proficiency, 10) || 1;
              const pct = (proficiencyVal / 5) * 100;
              return (
                <div
                  key={sk.skillId || sk.skillName}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{sk.skillName}</span>
                    <ProficiencyBadge level={proficiencyVal} />
                  </div>

                  {/* Horizontal visual progress meter */}
                  <div className="space-y-1">
                    <ProgressBar
                      value={proficiencyVal}
                      max={5}
                      color={
                        proficiencyVal >= 4 
                          ? "bg-emerald-500" 
                          : proficiencyVal >= 3 
                          ? "bg-indigo-500" 
                          : "bg-blue-400"
                      }
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                      <span>Beginner (1)</span>
                      <span>Expert (5)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Add Skill to {student.name}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
              {/* Skill Selection or Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Skill Name</label>
                <div className="space-y-2">
                  <select
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:border-indigo-600 focus:outline-none"
                  >
                    {catalog.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                    <option value="custom">+ Type a different skill...</option>
                  </select>

                  {newSkillName === "custom" && (
                    <input
                      type="text"
                      placeholder="Enter custom skill name (e.g. Spring Boot)"
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-indigo-600 focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Controlled Proficiency Dropdown (1-5 only) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Proficiency Level (1 - 5)
                </label>
                <select
                  value={newProficiency}
                  onChange={(e) => setNewProficiency(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:border-indigo-600 focus:outline-none"
                >
                  <option value={1}>1 - Beginner</option>
                  <option value={2}>2 - Basic</option>
                  <option value={3}>3 - Intermediate</option>
                  <option value={4}>4 - Advanced</option>
                  <option value={5}>5 - Expert</option>
                </select>
                <p className="text-slate-400 text-[11px] mt-1">
                  Strict numerical scale: 1 = Beginner to 5 = Expert
                </p>
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
                  disabled={submittingSkill}
                >
                  {submittingSkill ? "Saving..." : "Save Skill"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}