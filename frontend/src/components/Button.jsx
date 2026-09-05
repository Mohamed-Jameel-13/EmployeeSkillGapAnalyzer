import React from "react";

export default function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  disabled = false, 
  onClick, 
  type = "button",
  icon: Icon
}) {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs focus:ring-indigo-500",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400",
    outline: "border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-slate-400",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-500",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-5 py-2.5 text-base rounded-xl"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}