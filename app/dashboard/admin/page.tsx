'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Analytics {
  users: {
    total: number;
    students: number;
    admins: number;
    active: number;
    newLast30Days: number;
  };
  labs: {
    total: number;
    active: number;
    scenarios: number;
  };
  progress: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  commands: {
    total: number;
    valid: number;
    recentLast30Days: number;
    validityRate: number;
  };
  submissions: {
    total: number;
    completed: number;
    pending: number;
    recentLast30Days: number;
  };
  reports: {
    total: number;
  };
  activityTimeline: Array<{
    date: string;
    commands: number;
  }>;
  topStudents: Array<{
    id: string;
    fullName: string;
    studentId: string;
    totalPoints: number;
  }>;
  labCompletionRates: Array<{
    sessionNumber: number;
    title: string;
    completionRate: number;
    completedStudents: number;
    totalStudents: number;
  }>;
  avgPointsByLab: Array<{
    sessionNumber: number;
    title: string;
    avgPoints: number;
  }>;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (user.role !== 'ADMIN') {
        setError('Akses tidak diizinkan');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.error || 'Gagal memuat analitik');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Gagal memuat analitik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-300 text-lg">Memuat analitik...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center">
        <p className="text-gray-400">Tidak ada data analitik tersedia</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Dashboard Admin
          </h1>
          <p className="text-gray-400 mt-2">
            Analitik platform dan ringkasan manajemen
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Link
            href="/dashboard/admin/students"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20 relative"
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-semibold">Daftar Mahasiswa</h3>
            </div>
            <p className="text-sm text-indigo-100">Lihat progress & aktivitas mahasiswa</p>
          </Link>

          <Link
            href="/dashboard/admin/session-reviews"
            className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl p-6 hover:from-yellow-600 hover:to-orange-700 transition-all shadow-lg shadow-yellow-500/20 relative"
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold">Review Refleksi</h3>
            </div>
            <p className="text-sm text-yellow-100">Review refleksi pembelajaran mahasiswa</p>
          </Link>

          <Link
            href="/dashboard/admin/users"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl p-6 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-semibold">Manajemen Pengguna</h3>
            </div>
            <p className="text-sm text-cyan-100">Kelola mahasiswa dan admin</p>
          </Link>

          <Link
            href="/dashboard/admin/audit-logs"
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold">Log Audit</h3>
            </div>
            <p className="text-sm text-purple-100">Lihat aktivitas sistem dan log keamanan</p>
          </Link>

          <Link
            href="/dashboard/labs"
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold">Sesi Lab</h3>
            </div>
            <p className="text-sm text-green-100">Lihat dan kelola konten lab</p>
          </Link>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Pengguna</h3>
            <p className="text-3xl font-bold text-cyan-400">{analytics.users.total}</p>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.users.students} mahasiswa, {analytics.users.admins} admin
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Lab Aktif</h3>
            <p className="text-3xl font-bold text-green-400">{analytics.labs.active}</p>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.labs.scenarios} total skenario
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Tingkat Penyelesaian</h3>
            <p className="text-3xl font-bold text-purple-400">{analytics.progress.completionRate}%</p>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.progress.completed} / {analytics.progress.total} selesai
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Perintah</h3>
            <p className="text-3xl font-bold text-orange-400">{analytics.commands.total}</p>
            <p className="text-sm text-gray-500 mt-1">
              {analytics.commands.validityRate}% valid
            </p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Timeline Aktivitas (14 Hari Terakhir)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.activityTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="commands" stroke="#06b6d4" name="Perintah Dieksekusi" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Lab Completion Rates */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Tingkat Penyelesaian Lab</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.labCompletionRates}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="sessionNumber" stroke="#9ca3af" label={{ value: 'Sesi', position: 'insideBottom', offset: -5, fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" label={{ value: 'Penyelesaian %', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="completionRate" fill="#10b981" name="Penyelesaian %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Average Points by Lab */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Rata-rata Poin per Lab</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.avgPointsByLab}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="sessionNumber" stroke="#9ca3af" label={{ value: 'Sesi', position: 'insideBottom', offset: -5, fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" label={{ value: 'Rata-rata Poin', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="avgPoints" fill="#06b6d4" name="Rata-rata Poin" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Students Leaderboard */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">10 Mahasiswa Teratas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Peringkat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    NIM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Poin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analytics.topStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {student.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-cyan-400">
                      {student.totalPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Pengguna Baru (30 hari)</h3>
            <p className="text-2xl font-bold text-cyan-400">{analytics.users.newLast30Days}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Perintah Terbaru (30 hari)</h3>
            <p className="text-2xl font-bold text-green-400">{analytics.commands.recentLast30Days}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Pengajuan Tertunda</h3>
            <p className="text-2xl font-bold text-orange-400">{analytics.submissions.pending}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
