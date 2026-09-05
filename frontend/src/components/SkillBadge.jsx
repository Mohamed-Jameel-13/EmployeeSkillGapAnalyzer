import React from "react";
import { Award, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export default function SkillBadge({ 
  name, 
  proficiency, 
  status, 
  onRemove,
  size = "md" 
}) {
  const levelColors = {
    Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Intermediate: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Advanced: "bg-violet-50 text-violet-700 border-violet-200",
    Expert: "bg-amber-50 text-amber-800 border-amber-200"
  };

  const statusIcons = {
    MATCHED: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    PROFICIENCY_GAP: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
    MISSING: <XCircle className="w-3.5 h-3.5 text-rose-500" />
  };

  const statusStyles = {
    MATCHED: "bg-emerald-50 text-emerald-800 border-emerald-200",
    PROFICIENCY_GAP: "bg-amber-50 text-amber-800 border-amber-200",
    MISSING: "bg-rose-50 text-rose-700 border-rose-200"
  };

  const currentStyle = status 
    ? statusStyles[status] || "bg-slate-50 text-slate-700 border-slate-200"
    : levelColors[proficiency] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      } ${currentStyle}`}
    >
      {status && statusIcons[status]}
      <span className="font-semibold">{name}</span>
      {proficiency && (
        <span className="opacity-75 text-[10px] uppercase font-bold tracking-wider">
          • {proficiency}
        </span>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-slate-400 hover:text-rose-600 font-bold"
        >
          &times;
        </button>
      )}
    </span>
  );
}
