import React from "react";
import { FolderOpen } from "lucide-react";

export default function EmptyState({ title = "No records found", description = "No items match your criteria.", action }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto my-6">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
        <FolderOpen className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 mb-5">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}