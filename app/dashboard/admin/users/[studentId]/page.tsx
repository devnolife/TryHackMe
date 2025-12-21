'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Student {
  id: string;
  email: string;
  fullName: string;
  studentId: string | null;
  department: string | null;
  role: string;
  isActive: boolean;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ProgressItem {
  id: string;
  sessionNumber: number;
  sessionTitle: string;
  scenarioTitle: string;
  status: string;
  totalPoints: number;
  maxPoints: number;
  attempts: number;
  hintsUsed: number;
  timeSpentMinutes: number;
  startedAt: string | null;
  completedAt: string | null;
}

interface CommandHistory {
  id: string;
  command: string;
  isValid: boolean;
  executedAt: string;
  scenarioTitle: string;
}

interface StudentDetails {
  student: Student;
  progress: ProgressItem[];
  commandHistory: CommandHistory[];
  stats: {
    totalPoints: number;
    maxPoints: number;
    percentage: number;
    completedLabs: number;
    totalLabs: number;
    totalCommands: number;
    validCommands: number;
    avgTimePerLab: number;
  };
  activityData: Array<{
    date: string;
    commands: number;
    points: number;
  }>;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [data, setData] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'commands' | 'activity'>('overview');
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/admin/users/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch student:', result.error);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = async (sessionId?: string) => {
    const confirmMessage = sessionId
      ? 'Yakin ingin reset progres sesi ini?'
      : 'Yakin ingin reset SEMUA progres mahasiswa ini?';

    if (!confirm(confirmMessage)) return;

    setResetting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/admin/users/${studentId}/reset-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Progres berhasil direset!' });
        fetchStudentDetails();
      } else {
        setMessage({ type: 'error', text: result.error || 'Gagal mereset progres' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setResetting(false);
    }
  };

  const toggleActiveStatus = async () => {
    if (!data) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/admin/users/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !data.student.isActive }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: `Status berhasil ${data.student.isActive ? 'dinonaktifkan' : 'diaktifkan'}` });
        fetchStudentDetails();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengubah status' });
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Selesai', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'IN_PROGRESS':
        return { label: 'Sedang Dikerjakan', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 'SUBMITTED':
        return { label: 'Dikumpulkan', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      default:
        return { label: 'Belum Dimulai', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">👤</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Mahasiswa Tidak Ditemukan</h3>
        <p className="text-gray-400 mb-6">Data mahasiswa tidak tersedia</p>
        <Link
          href="/dashboard/admin/users"
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-bold"
        >
          Kembali ke Daftar User
        </Link>
      </div>
    );
  }

  const { student, progress, commandHistory, stats, activityData } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard/admin/users"
              className="text-gray-400 hover:text-white transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <span className="text-3xl text-white font-bold">
                {student.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{student.fullName}</h1>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.isActive
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                  {student.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <p className="text-gray-400">{student.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {student.studentId && <span>NIM: {student.studentId}</span>}
                {student.department && <span>• {student.department}</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={toggleActiveStatus}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${student.isActive
                  ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                }`}
            >
              {student.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <button
              onClick={() => handleResetProgress()}
              disabled={resetting}
              className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg text-sm font-medium hover:bg-orange-500/30 transition disabled:opacity-50"
            >
              {resetting ? 'Mereset...' : 'Reset Semua Progres'}
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl ${message.type === 'success'
            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
          {message.type === 'success' ? '✓' : '⚠️'} {message.text}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.percentage}%</div>
              <div className="text-sm text-gray-400">Progres</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalPoints}</div>
              <div className="text-sm text-gray-400">Total Poin</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.completedLabs}/{stats.totalLabs}</div>
              <div className="text-sm text-gray-400">Lab Selesai</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <span className="text-xl">⌨️</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalCommands}</div>
              <div className="text-sm text-gray-400">Total Perintah</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {[
          { id: 'overview', label: 'Overview', icon: '📋' },
          { id: 'progress', label: 'Progres Lab', icon: '📈' },
          { id: 'commands', label: 'Riwayat Perintah', icon: '⌨️' },
          { id: 'activity', label: 'Aktivitas', icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === tab.id
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-800/50 text-gray-400 hover:text-white border border-white/10'
              }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info Card */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Informasi Mahasiswa</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{student.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">NIM</span>
                <span className="text-white">{student.studentId || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Jurusan</span>
                <span className="text-white">{student.department || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Terdaftar</span>
                <span className="text-white">
                  {new Date(student.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Akurasi Perintah</span>
                <span className="text-white">
                  {stats.totalCommands > 0
                    ? Math.round((stats.validCommands / stats.totalCommands) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Recent Progress */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Progres Terbaru</h3>
            <div className="space-y-3">
              {progress.slice(0, 5).map((p, index) => {
                const statusInfo = getStatusInfo(p.status);
                return (
                  <div key={p.id || index} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                    <div>
                      <div className="text-white font-medium">Sesi {p.sessionNumber}</div>
                      <div className="text-sm text-gray-400">{p.scenarioTitle}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-400 font-bold">{p.totalPoints}/{p.maxPoints}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              {progress.length === 0 && (
                <p className="text-gray-400 text-center py-4">Belum ada progres</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Detail Progres Lab</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Sesi</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Skenario</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Poin</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Percobaan</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Waktu</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((p, index) => {
                  const statusInfo = getStatusInfo(p.status);
                  return (
                    <tr key={p.id || index} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white font-medium">#{p.sessionNumber}</td>
                      <td className="py-3 px-4 text-gray-300">{p.scenarioTitle}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-cyan-400 font-bold">{p.totalPoints}/{p.maxPoints}</td>
                      <td className="py-3 px-4 text-gray-300">{p.attempts}</td>
                      <td className="py-3 px-4 text-gray-300">{p.timeSpentMinutes} menit</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleResetProgress(p.id)}
                          className="text-orange-400 hover:text-orange-300 text-sm"
                          disabled={resetting}
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {progress.length === 0 && (
              <p className="text-gray-400 text-center py-8">Belum ada data progres</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'commands' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">
            Riwayat Perintah ({commandHistory.length})
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {commandHistory.map((cmd, index) => (
              <div
                key={cmd.id || index}
                className={`flex items-center gap-4 p-3 rounded-lg ${cmd.isValid ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${cmd.isValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                  {cmd.isValid ? '✓' : '✗'}
                </span>
                <code className="flex-1 text-white font-mono text-sm">{cmd.command}</code>
                <span className="text-xs text-gray-500">{cmd.scenarioTitle}</span>
                <span className="text-xs text-gray-500">
                  {new Date(cmd.executedAt).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
            {commandHistory.length === 0 && (
              <p className="text-gray-400 text-center py-8">Belum ada riwayat perintah</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Grafik Aktivitas</h3>
          {activityData && activityData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="commands"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    name="Perintah"
                  />
                  <Line
                    type="monotone"
                    dataKey="points"
                    stroke="#A855F7"
                    strokeWidth={2}
                    name="Poin"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Belum ada data aktivitas</p>
          )}
        </div>
      )}
    </div>
  );
}
