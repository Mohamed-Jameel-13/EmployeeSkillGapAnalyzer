import React, { useState, useEffect } from "react";
import { Award, Search, Filter, Sparkles, ArrowRight, Plus, Trash2, X, AlertCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useRouter } from "../routes/Router";
import { getSkills, createSkill, deleteSkill } from "../api/skills";

export default function SkillList() {
  const { navigate } = useRouter();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Add Skill Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Programming");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSkills();
      setSkills(data || []);
    } catch (err) {
      setError(err.message || "Failed to load skills catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!newSkillName.trim()) {
      setFormError("Skill name is required");
      return;
    }
    setSubmitting(true);
    try {
      await createSkill({
        name: newSkillName.trim(),
        category: newSkillCategory.trim() || "General"
      });
      setIsAddOpen(false);
      setNewSkillName("");
      loadSkills();
    } catch (err) {
      setFormError(err.message || "Failed to create skill");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSkill = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete skill "${name}" from the catalog?`)) {
      return;
    }
    try {
      await deleteSkill(id);
      loadSkills();
    } catch (err) {
      alert(err.message || "Failed to delete skill");
    }
  };

  const categories = ["all", ...new Set(skills.map((s) => s.category))];

  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Skills Taxonomy Catalog"
          subtitle="Standard technical competencies evaluated across candidate profiles and target positions."
        />
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsAddOpen(true)}
          className="shrink-0"
        >
          Add New Skill
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search skills (e.g. Java, Spring Boot, React, AWS)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent border-none focus:outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Category Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching skills from REST API..." />
      ) : error ? (
        <ErrorState title="Error Loading Skills" message={error} onRetry={loadSkills} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSkills.map((sk) => (
            <div
              key={sk.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-200 hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                    {sk.category}
                  </span>
                  <button
                    type="button"
                    title="Delete skill"
                    onClick={() => handleDeleteSkill(sk.id, sk.name)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
                  {sk.name}
                </h3>
              </div>

              <button
                onClick={() => navigate("jobs")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-between pt-2 border-t border-slate-100"
              >
                <span>Find Related Jobs</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Skill to Catalog</h3>
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

            <form onSubmit={handleCreateSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GraphQL, Docker, Kubernetes, Angular"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Programming">Programming</option>
                  <option value="Framework">Framework</option>
                  <option value="Database">Database</option>
                  <option value="Cloud">Cloud</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Tools">Tools</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Skill"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}