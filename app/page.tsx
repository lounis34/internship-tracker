"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Plus, Trash2, Loader2, CheckCircle, XCircle, Clock, Briefcase } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white px-4 py-6 sm:px-6 lg:px-8">
      <AuthLoading>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AuthLoading>
      
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Internship Tracker
          </h1>
          <p className="text-gray-400 px-4">Track your applications, stay organized, get hired.</p>
          <SignInButton mode="modal">
            <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
              Get Started
            </button>
          </SignInButton>
        </div>
      </Unauthenticated>

      <Authenticated>
        <Dashboard />
      </Authenticated>
    </main>
  );
}

function Dashboard() {
  const { user } = useUser();
  const applications = useQuery(api.applications.get) || [];
  const addApplication = useMutation(api.applications.add);
  const updateStatus = useMutation(api.applications.updateStatus);
  const deleteApp = useMutation(api.applications.deleteApp);

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "applied",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addApplication(formData);
    setFormData({ company: "", role: "", status: "applied", notes: "" });
    setIsAdding(false);
  };

  const downloadCSV = () => {
    if (!applications.length) return;
    const headers = ["Company", "Role", "Status", "Date Applied", "Notes"];
    const csvContent = [
      headers.join(","),
      ...applications.map((app: any) => [
        `"${app.company}"`,
        `"${app.role}"`,
        app.status,
        format(app.dateApplied, "yyyy-MM-dd"),
        `"${app.notes || ""}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "internship_applications.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: applications.length,
    interview: applications.filter((a: any) => a.status === "interview").length,
    offer: applications.filter((a: any) => a.status === "offer").length,
    rejected: applications.filter((a: any) => a.status === "rejected").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Welcome back, {user?.firstName}</h1>
          <p className="text-gray-400 text-sm">Here's your application overview</p>
        </div>
        <div className="self-start sm:self-auto">
          <UserButton />
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Applied" value={stats.total} icon={<Briefcase />} color="bg-blue-500/10 text-blue-400" />
        <StatCard title="Interviews" value={stats.interview} icon={<Clock />} color="bg-yellow-500/10 text-yellow-400" />
        <StatCard title="Offers" value={stats.offer} icon={<CheckCircle />} color="bg-green-500/10 text-green-400" />
        <StatCard title="Rejected" value={stats.rejected} icon={<XCircle />} color="bg-red-500/10 text-red-400" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">Recent Applications</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={downloadCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm"
            title="Export to CSV"
          >
            <Briefcase size={16} /> Export
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm"
          >
            <Plus size={16} /> Add Application
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 sm:p-6 rounded-xl space-y-4 border border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Company Name"
              className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 w-full text-sm"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Role Title"
              className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 w-full text-sm"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            />
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 w-full text-sm"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
            <input
              type="text"
              placeholder="Notes (optional)"
              className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 w-full text-sm"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-gray-400 hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
            >
              Save Application
            </button>
          </div>
        </form>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No applications tracked yet. Add your first one!
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="divide-y divide-gray-700 sm:hidden">
              {applications.map((app: any) => (
                <div key={app._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-400">Company</p>
                      <p className="font-semibold truncate">{app.company}</p>
                    </div>
                    <button
                      onClick={() => deleteApp({ id: app._id })}
                      className="text-gray-500 hover:text-red-400 transition flex-shrink-0"
                      aria-label="Delete application"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Role</p>
                    <p className="text-gray-300 truncate">{app.role}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus({ id: app._id, status: e.target.value })}
                        className={`bg-transparent text-sm font-semibold px-2 py-1 rounded border border-gray-600 focus:border-blue-500 outline-none
                          ${app.status === 'offer' ? 'text-green-400' : 
                            app.status === 'rejected' ? 'text-red-400' :
                            app.status === 'interview' ? 'text-yellow-400' : 'text-blue-400'}`}
                      >
                        <option value="applied">Applied</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Applied</p>
                      <p className="text-sm text-gray-300">{format(app.dateApplied, "MMM d")}</p>
                    </div>
                  </div>
                  {app.notes ? (
                    <div>
                      <p className="text-sm text-gray-400">Notes</p>
                      <p className="text-sm text-gray-300 line-clamp-2">{app.notes}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-900/50 text-gray-400 text-sm uppercase">
                  <tr>
                    <th className="p-4">Company</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {applications.map((app: any) => (
                    <tr key={app._id} className="hover:bg-gray-700/30 transition">
                      <td className="p-4 font-medium">{app.company}</td>
                      <td className="p-4 text-gray-300">{app.role}</td>
                      <td className="p-4">
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus({ id: app._id, status: e.target.value })}
                          className={`bg-transparent text-sm font-semibold px-2 py-1 rounded border border-gray-600 focus:border-blue-500 outline-none
                            ${app.status === 'offer' ? 'text-green-400' : 
                              app.status === 'rejected' ? 'text-red-400' :
                              app.status === 'interview' ? 'text-yellow-400' : 'text-blue-400'}`}
                        >
                          <option value="applied">Applied</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {format(app.dateApplied, "MMM d, yyyy")}
                      </td>
                      <td className="p-4 text-gray-400 text-sm max-w-xs truncate">{app.notes}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteApp({ id: app._id })}
                          className="text-gray-500 hover:text-red-400 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-xs sm:text-sm mb-1">{title}</p>
        <p className="text-xl sm:text-2xl font-bold">{value}</p>
      </div>
      <div className={`p-2 sm:p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  );
}
