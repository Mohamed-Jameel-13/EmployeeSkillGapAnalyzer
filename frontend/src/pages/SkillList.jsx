import React, { useState, useEffect } from "react";
import { Award, Search, Filter, Sparkles, ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Badge from "../components/Badge";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useRouter } from "../routes/Router";
import { getSkills } from "../api/skills";

export default function SkillList() {
  const { navigate } = useRouter();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const loadSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      setError(err.message || "Failed to load skills catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const categories = ["all", ...new Set(skills.map((s) => s.category))];

  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills Taxonomy Catalog"
        subtitle="Standard technical competencies evaluated across candidate profiles and target positions."
      />

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
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                  {sk.category}
                </span>
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
    </div>
  );
}