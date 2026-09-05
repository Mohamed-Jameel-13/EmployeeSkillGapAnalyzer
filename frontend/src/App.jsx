import React from "react";
import Navbar from "./components/Navbar";
import { RouterProvider, useRouter } from "./routes/Router";
import { useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentList from "./pages/StudentList";
import AddStudent from "./pages/AddStudent";
import StudentProfile from "./pages/StudentProfile";
import SkillList from "./pages/SkillList";
import JobList from "./pages/JobList";
import JobDetails from "./pages/JobDetails";
import SkillGapAnalysis from "./pages/SkillGapAnalysis";
import Recommendations from "./pages/Recommendations";
import Applications from "./pages/Applications";

function AppContent() {
  const { currentRoute } = useRouter();
  const { user } = useAuth();

  // If not logged in → show Login page
  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRoute === "dashboard"       && <Dashboard />}
        {currentRoute === "students"        && <StudentList />}
        {currentRoute === "add-student"     && <AddStudent />}
        {currentRoute === "student-profile" && <StudentProfile />}
        {currentRoute === "skills"          && <SkillList />}
        {currentRoute === "jobs"            && <JobList />}
        {currentRoute === "job-details"     && <JobDetails />}
        {currentRoute === "skill-gap"       && <SkillGapAnalysis />}
        {currentRoute === "recommendations" && <Recommendations />}
        {currentRoute === "applications"    && <Applications />}
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-slate-800">Employee Skill Gap Analyzer</div>
          <div className="text-slate-500 font-medium">Pure Java REST API · MySQL Database</div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}