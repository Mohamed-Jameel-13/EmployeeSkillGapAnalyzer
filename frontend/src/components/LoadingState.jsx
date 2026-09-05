import React from "react";

export default function LoadingState({ message = "Loading data from server..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-medium">{message}</p>
    </div>
  );
}