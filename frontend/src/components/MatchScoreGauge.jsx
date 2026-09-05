import React from "react";

export default function MatchScoreGauge({ score = 0, size = "md", showLabel = true }) {
  const percentage = Math.min(100, Math.max(0, score));

  // Determine color scheme
  let color = "text-emerald-500";
  let bgColor = "text-emerald-100";
  let label = "High Match";
  let badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (percentage < 50) {
    color = "text-rose-500";
    bgColor = "text-rose-100";
    label = "Low Match";
    badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (percentage < 75) {
    color = "text-amber-500";
    bgColor = "text-amber-100";
    label = "Moderate Match";
    badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
  }

  const radius = size === "sm" ? 18 : size === "lg" ? 38 : 26;
  const strokeWidth = size === "sm" ? 3.5 : size === "lg" ? 6 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className={bgColor}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${color} transition-all duration-700 ease-out`}
          />
        </svg>
        <span
          className={`absolute font-bold text-slate-800 ${
            size === "sm" ? "text-[10px]" : size === "lg" ? "text-base font-extrabold" : "text-xs"
          }`}
        >
          {percentage}%
        </span>
      </div>

      {showLabel && (
        <div>
          <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${badgeColor}`}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
