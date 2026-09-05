import React, { useState, useEffect } from "react";
import { Award, Plus, Search, BookOpen, ExternalLink, Trash2, Edit2, Layers } from "lucide-react";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";

export default function ManageSkills() {
  const { addToast } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Frontend",
    description: "",
    resources: []
  });

  // Resource adding inputs
  const [newRes, setNewRes] = useState({
    title: "",
    provider: "Coursera",
    type: "Course",
    url: "",
    duration: "10h",
    difficulty: "Intermediate"
  });

  const fetchSkills = async () => {
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      setSkills(data);
    } catch (err) {
      console.error("Error fetching skills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openCreateModal = () => {
    setEditingSkill(null);
    setFormData({
      name: "",
      category: "Frontend",
      description: "",
      resources: [
        {
          title: "Comprehensive Tutorial",
          provider: "freeCodeCamp",
          type: "Course",
          url: "https://freecodecamp.org",
          duration: "10h",
          difficulty: "Beginner"
        }
      ]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      description: skill.description || "",
      resources: [...(skill.resources || [])]
    });
    setIsModalOpen(true);
  };

  const handleAddResource = () => {
    if (!newRes.title || !newRes.url) {
      addToast("Please provide resource title and URL", "info");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, { ...newRes }]
    }));
    setNewRes({
      title: "",
      provider: "Coursera",
      type: "Course",
      url: "",
      duration: "10h",
      difficulty: "Intermediate"
    });
  };

  const handleRemoveResource = (index) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingSkill) {
        res = await fetch(`/api/skills/${editingSkill.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      } else {
        res = await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
      }

      if (res.ok) {
        addToast(editingSkill ? "Skill updated!" : "New skill registered to catalog!", "success");
        setIsModalOpen(false);
        fetchSkills();
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to save skill", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const handleDeleteSkill = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from the skills catalog?`)) return;
    try {
      const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Skill removed from catalog", "success");
        fetchSkills();
      } else {
        addToast("Failed to delete skill", "error");
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const categories = ["all", ...new Set(skills.map((s) => s.category))];

  const filteredSkills = skills.filter((sk) => {
    const matchesSearch =
      sk.name.toLowerCase().includes(search.toLowerCase()) ||
      sk.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || sk.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skills Taxonomy & Recommendations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage technical and soft skill definitions along with curated learning resources used for recommendation generation.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Skill
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search skills, topics, or descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading skills catalog...</div>
      ) : filteredSkills.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
          No skills found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkills.map((sk) => (
            <div
              key={sk.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                    {sk.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sk)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                      title="Edit Skill"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(sk.id, sk.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{sk.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{sk.description}</p>
              </div>

              {/* Curated Resources Section */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-indigo-500" />
                  Recommended Resources ({sk.resources?.length || 0})
                </div>

                <div className="space-y-1.5">
                  {(sk.resources || []).slice(0, 2).map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-100 text-slate-700 hover:text-indigo-700 transition-colors group"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-semibold truncate group-hover:text-indigo-700">
                          {res.title}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {res.provider} • {res.duration} • {res.difficulty}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkill ? `Edit Skill: ${editingSkill.name}` : "Register New Skill"}
        subtitle="Specify skill metadata and attach curated learning materials for candidates."
      >
        <form onSubmit={handleSaveSkill} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Skill Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Next.js, Kubernetes, Rust"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="AI & Data">AI & Data</option>
              <option value="Tools & Workflow">Tools & Workflow</option>
              <option value="Soft Skills">Soft Skills</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Skill Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of this skill..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          {/* Attached Learning Resources */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="block font-bold text-slate-800">
              Curated Courses & Learning Resources
            </label>

            {/* List of existing */}
            <div className="space-y-1.5">
              {formData.resources.map((res, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{res.title}</span>
                    <span className="text-slate-500 ml-2">({res.provider} • {res.type})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(i)}
                    className="text-slate-400 hover:text-rose-600 font-bold"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {/* Add Resource Input */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Resource Title (e.g. Master Course)"
                  value={newRes.title}
                  onChange={(e) => setNewRes({ ...newRes, title: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="URL (e.g. https://coursera.org/...)"
                  value={newRes.url}
                  onChange={(e) => setNewRes({ ...newRes, url: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Provider (e.g. Udemy)"
                  value={newRes.provider}
                  onChange={(e) => setNewRes({ ...newRes, provider: e.target.value })}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddResource}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs"
                >
                  + Add Resource
                </button>
              </div>
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
              {editingSkill ? "Save Changes" : "Create Skill"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
