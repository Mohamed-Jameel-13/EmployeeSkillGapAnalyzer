import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  Eye, 
  Award, 
  Sparkles, 
  Mail, 
  Briefcase, 
  ChevronRight,
  Trash2
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { useRouter } from "../routes/Router";
import { useAnalysis } from "../context/AnalysisContext";
import { getStudents, deleteStudent } from "../api/students";

export default function StudentList() {
  const { navigate } = useRouter();
  const { setSelectedStudentId } = useAnalysis();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message || "Failed to load student/employee records");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete candidate "${name}" (ID #${id})?`)) {
      return;
    }
    try {
      await deleteStudent(id);
      loadStudents();
    } catch (err) {
      alert(err.message || "Failed to delete candidate");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.role && s.role.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees / Students"
        subtitle="Manage profiles, track verified skills, and conduct individual competency gap evaluations."
        action={
          <Button 
            variant="primary" 
            icon={UserPlus} 
            onClick={() => navigate("add-student")}
          >
            Add Student / Employee
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, email, or role (e.g. Arun, Java Full Stack)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent border-none focus:outline-none placeholder:text-slate-400"
        />
        {search && (
          <button 
            onClick={() => setSearch("")}
            className="text-xs text-slate-400 hover:text-slate-600 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingState message="Fetching student records from REST API..." />
      ) : error ? (
        <ErrorState title="Error Loading Students" message={error} onRetry={loadStudents} />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description={search ? "No records match your search criteria." : "No students/employees have been registered yet."}
          action={
            <Button variant="primary" size="sm" onClick={() => navigate("add-student")}>
              Add First Student
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role / Target Job</th>
                  <th className="px-6 py-3.5">Declared Skills</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 font-bold">
                      #{s.id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {s.email}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                        {s.role || "Software Engineer"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {(s.skills || []).length} skills
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudentId(s.id);
                            navigate("student-profile", { studentId: s.id });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          Profile
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStudentId(s.id);
                            navigate("student-profile", { studentId: s.id, openAddSkill: "true" });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1"
                          title="Manage Skills"
                        >
                          <Award className="w-3.5 h-3.5 text-indigo-600" />
                          Skills
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStudentId(s.id);
                            navigate("skill-gap", { studentId: s.id });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                          title="Analyze Skill Gap"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Analyze
                        </button>

                        <button
                          onClick={() => handleDeleteStudent(s.id, s.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Candidate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}