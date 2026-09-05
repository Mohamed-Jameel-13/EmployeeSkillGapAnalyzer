import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "./Button";

export default function ErrorState({ title = "Failed to load", message = "An error occurred while connecting to the REST API.", onRetry }) {
  return (
    <div className="bg-rose-50/70 rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto my-6">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-rose-900">{title}</h3>
      <p className="text-xs text-rose-700 mt-1 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} icon={RefreshCw}>
          Retry Request
        </Button>
      )}
    </div>
  );
}