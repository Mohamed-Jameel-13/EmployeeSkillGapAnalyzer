import React from "react";
import { getProficiencyLabel } from "../utils/proficiency";

export default function ProficiencyBadge({ level = 1, showLabel = true }) {
  const num = parseInt(level, 10) || 1;
  const label = getProficiencyLabel(num);

  const colors = {
    1: "bg-emerald-50 text-emerald-700 border-emerald-200",
    2: "bg-blue-50 text-blue-700 border-blue-200",
    3: "bg-indigo-50 text-indigo-700 border-indigo-200",
    4: "bg-purple-50 text-purple-700 border-purple-200",
    5: "bg-amber-50 text-amber-800 border-amber-200"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${colors[num] || colors[1]}`}>
      <span className="font-extrabold">{num}/5</span>
      {showLabel && <span className="font-medium text-[11px] opacity-90">• {label}</span>}
    </span>
  );
}