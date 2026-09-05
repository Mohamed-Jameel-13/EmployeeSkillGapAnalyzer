import React, { useState } from "react";
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import { useRouter } from "../routes/Router";
import { useAnalysis } from "../context/AnalysisContext";
import { createStudent } from "../api/students";

export default function AddStudent() {
  const { navigate } = useRouter();
  const { setSelectedStudentId } = useAnalysis();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Java Full Stack Developer",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Full Name is required";
    }

    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address (e.g. candidate@example.com)";
    }

    if (formData.password.trim().length > 0 && formData.password.trim().length < 4) {
      errs.password = "Password must be at least 4 characters long";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      // Contract: POST /api/students
      const newStudent = await createStudent({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role.trim(),
        password: formData.password.trim() || "password"
      });

      // Update global persistent selection
      if (newStudent?.id) {
        setSelectedStudentId(newStudent.id);
      }

      // Redirect directly to student's profile to manage skills!
      navigate("student-profile", { studentId: newStudent.id, openAddSkill: "true" });
    } catch (err) {
      setServerError(err.message || "Failed to create student on REST API");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate("students")}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students List
      </button>

      <PageHeader
        title="Add Student / Employee"
        subtitle="Register a new employee or student candidate for skill profiling and gap analysis."
      />

      <Card>
        {serverError && (
          <div className="p-3.5 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Arun"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-all focus:outline-none focus:ring-2 ${
                errors.name 
                  ? "border-rose-300 focus:ring-rose-200" 
                  : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-100"
              }`}
            />
            {errors.name && <p className="text-rose-600 text-[11px] mt-1 font-semibold">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="e.g. arun@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs transition-all focus:outline-none focus:ring-2 ${
                errors.email 
                  ? "border-rose-300 focus:ring-rose-200" 
                  : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-100"
              }`}
            />
            {errors.email && <p className="text-rose-600 text-[11px] mt-1 font-semibold">{errors.email}</p>}
          </div>

          {/* Role / Job Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Role / Target Career Path
            </label>
            <input
              type="text"
              placeholder="e.g. Java Full Stack Developer"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            />
            <p className="text-slate-400 text-[11px] mt-1">
              Used as the reference baseline for role-based skill gap diagnostics.
            </p>
          </div>

          {/* Initial Account Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700">
                Initial Account Password
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Default: <span className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">password</span>
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Leave blank to use default (password)"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-xs transition-all focus:outline-none focus:ring-2 ${
                  errors.password 
                    ? "border-rose-300 focus:ring-rose-200" 
                    : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-rose-600 text-[11px] mt-1 font-semibold">{errors.password}</p>}
            <p className="text-slate-400 text-[11px] mt-1">
              Candidate will use this password to sign into their SkillBridge dashboard.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate("students")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting}
              icon={UserPlus}
            >
              {submitting ? "Saving Candidate..." : "Create Student Record"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}