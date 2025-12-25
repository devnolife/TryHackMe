'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StudentDetail {
  id: string;
  email: string;
  fullName: string;
  studentId: string | null;
  department: string | null;
  isActive: boolean;
  createdAt: string;
  enrollmentDate: string;
}

interface Stats {
  totalPoints: number;
  completedLabs: number;
  inProgressLabs: number;
  totalLabs: number;
  totalCommands: number;
  validCommands: number;
  commandAccuracy: number;
  totalObjectives: number;
  pendingReviews: number;
  approvedSessions: number;
}

interface LabProgress {
  labId: string;
  sessionNumber: number;
  title: string;
  topic: string;
  difficultyLevel: string;
  maxPoints: number;
  isLocked: boolean;
  status: string;
  earnedPoints: number;
  startedAt: string | null;
  completedAt: string | null;
  sessionCompletion: {
    reviewStatus: string;
    submittedAt: string;
    reviewedAt: string | null;
    totalPoints: number;
  } | null;
}

interface ObjectiveCompletion {
  id: string;
  objectiveIndex: number;
  description: string;
  points: number;
  completedAt: string;
  scenario: {
    scenarioTitle: string;
    session: {
      sessionNumber: number;
      title: string;
    };
  };
}

interface CommandHistory {
  id: string;
  commandText: string;
  isValid: boolean;
  commandTimestamp: string;
  scenario: {
    scenarioTitle: string;
    session: {
      sessionNumber: number;
      title: string;
    };
  } | null;
}

interface SessionCompletion {
  id: string;
  reflectionText: string;
  reviewStatus: string;
  reviewerFeedback: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  totalPoints: number;
  session: {
    sessionNumber: number;
    title: string;
  };
  reviewer: {
    fullName: string;
  } | null;
}

interface ActivityData {
  date: string;
  commands: number;
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [labProgress, setLabProgress] = useState<LabProgress[]>([]);
  const [recentObjectives, setRecentObjectives] = useState<ObjectiveCompletion[]>([]);
  const [recentCommands, setRecentCommands] = useState<CommandHistory[]>([]);
  const [sessionCompletions, setSessionCompletions] = useState<SessionCompletion[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'progress' | 'objectives' | 'commands' | 'reflections'>('progress');

  useEffect(() => {
    fetchStudentDetail();
  }, [studentId]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/admin/students/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setStudent(data.student);
        setStats(data.stats);
        setLabProgress(data.labProgress);
        setRecentObjectives(data.recentObjectives);
        setRecentCommands(data.recentCommands);
        setSessionCompletions(data.sessionCompletions);
        setActivityTimeline(data.activityTimeline);
      } else {
        setError(data.error || 'Gagal memuat data mahasiswa');
      }
    } catch (err) {
      console.error('Error fetching student detail:', err);
      setError('Gagal memuat data mahasiswa');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
            Selesai
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
            Sedang Dikerjakan
          </span>
        );
      case 'NOT_STARTED':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">
            Belum Mulai
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">
            {status}
          </span>
        );
    }
  };

  const getReviewStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
            ✓ Disetujui
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
            ⏳ Menunggu Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
            ✗ Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-300 text-lg">Memuat data mahasiswa...</span>
        </div>
      </div>
    );
  }

  if (error || !student || !stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center">
        <p className="text-red-400 text-lg">{error || 'Mahasiswa tidak ditemukan'}</p>
        <Link
          href="/dashboard/admin/students"
          className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/dashboard/admin" className="hover:text-cyan-400">
            Admin Dashboard
          </Link>
          <span>›</span>
          <Link href="/dashboard/admin/students" className="hover:text-cyan-400">
            Daftar Mahasiswa
          </Link>
          <span>›</span>
          <span className="text-white">{student.fullName}</span>
        </div>

        {/* Student Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {student.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{student.fullName}</h1>
                <p className="text-gray-400">{student.email}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500">
                    NIM: {student.studentId || '-'}
                  </span>
                  {student.department && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="text-sm text-gray-500">{student.department}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm ${student.isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                  }`}
              >
                {student.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
              <span className="text-sm text-gray-500">
                Terdaftar: {formatDate(student.enrollmentDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">{stats.totalPoints}</p>
            <p className="text-sm text-gray-400">Total Poin</p>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{stats.completedLabs}</p>
            <p className="text-sm text-gray-400">Lab Selesai</p>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{stats.inProgressLabs}</p>
            <p className="text-sm text-gray-400">Sedang Dikerjakan</p>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{stats.totalObjectives}</p>
            <p className="text-sm text-gray-400">Objective Selesai</p>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-400">{stats.totalCommands}</p>
            <p className="text-sm text-gray-400">Total Perintah</p>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{stats.commandAccuracy}%</p>
            <p className="text-sm text-gray-400">Akurasi</p>
          </div>
        </div>

        {/* Activity Timeline */}
        {activityTimeline.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Aktivitas 14 Hari Terakhir</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={activityTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="commands"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-white/10 mb-6">
          <nav className="flex gap-4">
            {[
              { id: 'progress', label: 'Progress Lab' },
              { id: 'objectives', label: 'Objectives' },
              { id: 'commands', label: 'Riwayat Perintah' },
              { id: 'reflections', label: 'Refleksi' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3 px-1 border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'progress' && (
          <div className="grid gap-4">
            {labProgress.map((lab) => (
              <div
                key={lab.labId}
                className={`bg-slate-800/50 border rounded-xl p-4 ${lab.isLocked ? 'border-gray-600 opacity-60' : 'border-white/10'
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${lab.isLocked
                          ? 'bg-gray-700 text-gray-500'
                          : lab.status === 'COMPLETED'
                            ? 'bg-green-500/20 text-green-400'
                            : lab.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-slate-700 text-gray-400'
                        }`}
                    >
                      {lab.isLocked ? '🔒' : lab.sessionNumber}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{lab.title}</h3>
                      <p className="text-sm text-gray-400">{lab.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-cyan-400">
                        {lab.earnedPoints} / {lab.maxPoints}
                      </p>
                      <p className="text-xs text-gray-500">poin</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(lab.status)}
                      {lab.sessionCompletion && getReviewStatusBadge(lab.sessionCompletion.reviewStatus)}
                    </div>
                  </div>
                </div>
                {(lab.startedAt || lab.completedAt) && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex gap-4 text-sm text-gray-500">
                    {lab.startedAt && <span>Mulai: {formatDate(lab.startedAt)}</span>}
                    {lab.completedAt && <span>Selesai: {formatDate(lab.completedAt)}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'objectives' && (
          <div className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
            {recentObjectives.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Belum ada objective yang diselesaikan
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentObjectives.map((obj) => (
                  <div key={obj.id} className="p-4 hover:bg-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{obj.description}</p>
                        <p className="text-sm text-gray-400">
                          Sesi {obj.scenario.session.sessionNumber}: {obj.scenario.session.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">+{obj.points}</p>
                        <p className="text-xs text-gray-500">{formatDate(obj.completedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'commands' && (
          <div className="bg-slate-800/50 border border-white/10 rounded-xl overflow-hidden">
            {recentCommands.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Belum ada perintah yang dieksekusi
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {recentCommands.map((cmd) => (
                  <div key={cmd.id} className="p-4 hover:bg-white/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${cmd.isValid ? 'bg-green-400' : 'bg-gray-500'
                              }`}
                          ></span>
                          <code className="text-cyan-400 font-mono text-sm break-all">
                            $ {cmd.commandText}
                          </code>
                        </div>
                        {cmd.scenario && (
                          <p className="text-xs text-gray-500 mt-1 ml-4">
                            Sesi {cmd.scenario.session.sessionNumber}: {cmd.scenario.scenarioTitle}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(cmd.commandTimestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reflections' && (
          <div className="space-y-4">
            {sessionCompletions.length === 0 ? (
              <div className="bg-slate-800/50 border border-white/10 rounded-xl text-center py-12 text-gray-400">
                Belum ada refleksi yang dikirim
              </div>
            ) : (
              sessionCompletions.map((completion) => (
                <div
                  key={completion.id}
                  className="bg-slate-800/50 border border-white/10 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">
                        Sesi {completion.session.sessionNumber}: {completion.session.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Dikirim: {formatDate(completion.submittedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-cyan-400">
                        {completion.totalPoints} poin
                      </span>
                      {getReviewStatusBadge(completion.reviewStatus)}
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                      {completion.reflectionText}
                    </p>
                  </div>

                  {completion.reviewerFeedback && (
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                      <p className="text-sm text-cyan-400 font-medium mb-1">
                        Feedback dari {completion.reviewer?.fullName || 'Admin'}:
                      </p>
                      <p className="text-sm text-gray-300">{completion.reviewerFeedback}</p>
                      {completion.reviewedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Direview: {formatDate(completion.reviewedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
