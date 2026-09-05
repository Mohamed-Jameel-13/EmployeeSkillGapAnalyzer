import React, { useState, useEffect } from "react";
import { Users, Search, Mail, MapPin, Award, FileText, ChevronRight } from "lucide-react";
import Modal from "../components/Modal";
import SkillBadge from "../components/SkillBadge";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((res) => res.json()),
      fetch("/api/applications").then((res) => res.json())
    ])
      .then(([usersData, appsData]) => {
        setUsers(usersData);
        setApplications(appsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading users and applications:", err);
        setLoading(false);
      });
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.title && u.title.toLowerCase().includes(q)) ||
      (u.skills && u.skills.some((s) => s.name.toLowerCase().includes(q)))
    );
  });

  const getUserApps = (userId) => applications.filter((a) => a.userId === userId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registered Candidates Directory</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect candidate skill sets, experience levels, and their application history.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-6 top-5" />
        <input
          type="text"
          placeholder="Search candidates by name, job title, or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
        />
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading candidate directory...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
          No candidates found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => {
            const userApps = getUserApps(user.id);
            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <img
                      src={user.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=user"}
                      alt={user.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-50"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-xs text-indigo-600 font-medium">{user.title || "Candidate"}</p>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {user.location || "Remote"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {user.summary || "No summary provided."}
                  </p>

                  {/* Skills tags preview */}
                  <div className="space-y-1.5 mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Verified Skills ({(user.skills || []).length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(user.skills || []).slice(0, 4).map((sk) => (
                        <SkillBadge
                          key={sk.skillId}
                          name={sk.name}
                          proficiency={sk.proficiency}
                          size="sm"
                        />
                      ))}
                      {(user.skills || []).length > 4 && (
                        <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-md font-semibold">
                          +{(user.skills || []).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" /> {userApps.length} Applications
                  </span>
                  <span className="font-semibold text-indigo-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    View Profile <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <Modal
          isOpen={Boolean(selectedUser)}
          onClose={() => setSelectedUser(null)}
          title={selectedUser.name}
          subtitle={`${selectedUser.title} • ${selectedUser.location || "Remote"}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Header / Bio */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow"
              />
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm">{selectedUser.name}</div>
                <div className="text-slate-600 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedUser.email}</span>
                  {selectedUser.phone && <span>📞 {selectedUser.phone}</span>}
                </div>
                <div className="text-slate-500 font-medium">
                  🎓 {selectedUser.education || "Undergraduate Degree"} • {selectedUser.experienceYears || 2}+ years experience
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                About Candidate
              </div>
              <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                {selectedUser.summary || "No detailed summary provided."}
              </p>
            </div>

            {/* Complete Skills Inventory */}
            <div>
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                Declared Technical Skills & Proficiencies
              </div>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {(selectedUser.skills || []).map((sk) => (
                  <SkillBadge
                    key={sk.skillId}
                    name={sk.name}
                    proficiency={sk.proficiency}
                  />
                ))}
              </div>
            </div>

            {/* Applications Submitted */}
            <div>
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                Application History ({getUserApps(selectedUser.id).length})
              </div>
              <div className="space-y-2">
                {getUserApps(selectedUser.id).length === 0 ? (
                  <p className="text-slate-400 italic">No applications submitted yet.</p>
                ) : (
                  getUserApps(selectedUser.id).map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{app.jobTitle}</div>
                        <div className="text-slate-500 text-[11px]">{app.company} • Applied on {app.appliedDate}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                          {app.matchScore}% Match
                        </span>
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
