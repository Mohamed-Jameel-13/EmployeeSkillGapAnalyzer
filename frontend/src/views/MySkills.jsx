import React, { useState, useEffect } from "react";
import { Award, Plus, Trash2, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import SkillBadge from "../components/SkillBadge";
import { useAuth } from "../context/AuthContext";

export default function MySkills({ setActiveTab }) {
  const { user, refreshUser, addToast } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add skill state
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState("Intermediate");
  const [years, setYears] = useState(2);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => res.json())
      .then((data) => {
        setCatalog(data);
        if (data.length > 0) setSelectedSkillId(data[0].id);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading skills catalog:", err);
        setLoading(false);
      });
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    const catalogSkill = catalog.find((s) => s.id === selectedSkillId);
    if (!catalogSkill) return;

    const currentSkills = user?.skills || [];
    if (currentSkills.some((s) => s.skillId.toLowerCase() === selectedSkillId.toLowerCase())) {
      addToast("You have already added this skill. Remove it first to update level.", "info");
      return;
    }

    const updatedSkills = [
      ...currentSkills,
      {
        skillId: catalogSkill.id,
        name: catalogSkill.name,
        proficiency: selectedProficiency,
        years: parseInt(years, 10) || 1
      }
    ];

    await saveSkillsToServer(updatedSkills, `Added ${catalogSkill.name} (${selectedProficiency})!`);
  };

  const handleRemoveSkill = async (skillId, skillName) => {
    const currentSkills = user?.skills || [];
    const updatedSkills = currentSkills.filter(
      (s) => s.skillId.toLowerCase() !== skillId.toLowerCase()
    );

    await saveSkillsToServer(updatedSkills, `Removed ${skillName}`);
  };

  const saveSkillsToServer = async (newSkillsList, message) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}/skills`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: newSkillsList })
      });

      if (res.ok) {
        addToast(message, "success");
        await refreshUser();
      } else {
        addToast("Failed to update skills", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Group user skills by level
  const mySkills = user?.skills || [];
  const skillsByProficiency = {
    Expert: mySkills.filter((s) => s.proficiency === "Expert"),
    Advanced: mySkills.filter((s) => s.proficiency === "Advanced"),
    Intermediate: mySkills.filter((s) => s.proficiency === "Intermediate"),
    Beginner: mySkills.filter((s) => s.proficiency === "Beginner")
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Skill Inventory & Proficiencies</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your skill competencies power the real-time Skill Gap Analysis and Job Recommendation Engine.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("browse-jobs")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm"
        >
          Check Job Matches ➔
        </button>
      </div>

      {/* Tip Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 leading-relaxed">
          <span className="font-bold">Dynamic Scoring Active:</span> Whenever you add a new skill or level up your proficiency, your match percentages and gap analysis charts for all open job listings will update instantaneously!
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Add Skill Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Plus className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Add Skill to Profile</h2>
          </div>

          <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Skill</label>
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {catalog.map((sk) => (
                  <option key={sk.id} value={sk.id}>
                    {sk.name} ({sk.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proficiency Level</label>
              <select
                value={selectedProficiency}
                onChange={(e) => setSelectedProficiency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Beginner">Beginner (Basic understanding)</option>
                <option value="Intermediate">Intermediate (Used in projects)</option>
                <option value="Advanced">Advanced (Production-grade)</option>
                <option value="Expert">Expert (Architecture & Mastery)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Years Practiced</label>
              <input
                type="number"
                min="1"
                max="25"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {saving ? "Updating..." : "Add to My Inventory"}
            </button>
          </form>
        </div>

        {/* Current Skills Breakdown */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">
                Current Skill Inventory ({mySkills.length})
              </h2>
              <span className="text-xs text-slate-400">Click &times; to delete</span>
            </div>

            {mySkills.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-xl">
                No skills added yet. Use the form on the left to add skills.
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(skillsByProficiency).map(([level, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <div key={level} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {level} Level
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          {items.length}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {items.map((sk) => (
                          <span
                            key={sk.skillId}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium transition-colors"
                          >
                            <span className="font-bold">{sk.name}</span>
                            <span className="text-[10px] opacity-75 font-semibold text-indigo-600">
                              {sk.years ? `${sk.years}y` : ""}
                            </span>
                            <button
                              onClick={() => handleRemoveSkill(sk.skillId, sk.name)}
                              className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                              title="Remove skill"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
