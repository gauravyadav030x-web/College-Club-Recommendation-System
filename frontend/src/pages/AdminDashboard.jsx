import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Compass,
  UserCheck,
  Clock,
  TrendingUp,
  Network,
  Plus,
  ArrowRight,
  Star,
  Layers,
  Sparkles
} from 'lucide-react';
import { adminApi } from '../api/admin';

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, studentsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getStudents().catch(() => []),
      ]);
      setStats(statsData);
      setStudents(studentsData || []);
    } catch (err) {
      setError(err.message || 'Access restricted to administrators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-slate-100 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Administrator Access Denied</h3>
        <p className="text-xs text-slate-500">{error}</p>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
        >
          Return to Student Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-700 mb-1">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            <span>Administrative Command & Analytics Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Admin Intelligence Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor campus engagement, review student memberships, and analyze club recommendation graph topology.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('/admin/memberships')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-smooth flex items-center space-x-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Review Applications ({stats?.pending_requests || 0})</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/clubs')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-smooth flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Clubs</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Registered Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">
            {stats?.total_students || 0}
          </p>
          <p className="text-[11px] text-blue-600 font-medium">Active profiles</p>
        </div>

        {/* Total Clubs */}
        <div
          onClick={() => onNavigate('/admin/clubs')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm cursor-pointer transition-smooth space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Campus Clubs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">
            {stats?.total_clubs || 0}
          </p>
          <p className="text-[11px] text-slate-400">
            {stats?.active_clubs || 0} currently active
          </p>
        </div>

        {/* Pending Requests */}
        <div
          onClick={() => onNavigate('/admin/memberships')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-sm cursor-pointer transition-smooth space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Requests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700 font-heading">
            {stats?.pending_requests || 0}
          </p>
          <p className="text-[11px] text-amber-600 font-medium">Awaiting decision</p>
        </div>

        {/* Approved Memberships */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approved Members</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">
            {stats?.approved_memberships || 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">Across all organizations</p>
        </div>
      </div>

      {/* Analytics Visuals: Popular Interests & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Student Interests Bar Chart */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <span>Most Popular Student Interests</span>
            </h2>
            <span className="text-xs text-slate-400">Demand Frequency</span>
          </div>

          <div className="space-y-3 pt-2">
            {stats?.popular_interests && stats.popular_interests.length > 0 ? (
              stats.popular_interests.map((item, idx) => {
                const max = stats.popular_interests[0]?.count || 1;
                const percentage = Math.round((item.count / max) * 100);
                return (
                  <div key={item.interest} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.interest}</span>
                      <span className="text-slate-500">{item.count} students</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 italic">No student interest data available yet.</p>
            )}
          </div>
        </div>

        {/* Club Categories Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Club Catalog by Category</span>
            </h2>
            <span className="text-xs text-slate-400">{stats?.total_clubs || 0} Total Clubs</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {stats?.category_distribution &&
              stats.category_distribution.map((cat) => (
                <div
                  key={cat.category}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                >
                  <p className="text-xs font-semibold text-slate-700 truncate">{cat.category}</p>
                  <p className="text-lg font-extrabold text-slate-900 font-heading">
                    {cat.count} <span className="text-xs font-normal text-slate-400">clubs</span>
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* NetworkX Graph Metrics & Analytics */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold font-heading flex items-center space-x-2">
              <Network className="w-5 h-5 text-purple-400" />
              <span>NetworkX Knowledge Graph Topology</span>
            </h2>
            <p className="text-xs text-purple-200">
              Underlying bipartite knowledge network powering BFS recommendations and 2-hop neighbor affinity.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
            Graph BFS Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
            <p className="text-[11px] text-purple-300">Total Graph Nodes</p>
            <p className="text-xl font-bold font-mono">{stats?.graph_metrics?.total_nodes || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
            <p className="text-[11px] text-purple-300">Total Graph Edges</p>
            <p className="text-xl font-bold font-mono">{stats?.graph_metrics?.total_edges || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
            <p className="text-[11px] text-purple-300">Network Density</p>
            <p className="text-xl font-bold font-mono">{stats?.graph_metrics?.density || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1">
            <p className="text-[11px] text-purple-300">Components</p>
            <p className="text-xl font-bold font-mono">
              {stats?.graph_metrics?.connected_components || 1}
            </p>
          </div>
        </div>
      </div>

      {/* Registered Students Table Snippet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 pb-0 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 font-heading flex items-center space-x-2">
            <Users className="w-4 h-4 text-brand-600" />
            <span>Registered Campus Students</span>
          </h2>
          <span className="text-xs text-slate-500">{students.length} Total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Year</th>
                <th className="px-6 py-3">Interests Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3 font-semibold text-slate-900">{student.full_name}</td>
                  <td className="px-6 py-3 text-slate-600">{student.email}</td>
                  <td className="px-6 py-3 text-slate-600">{student.department}</td>
                  <td className="px-6 py-3 text-slate-600">{student.year}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                      {student.interests?.length || 0} interests
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
