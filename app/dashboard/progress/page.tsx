'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ProgressData {
  totalLabs: number;
  completedLabs: number;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  weeklyLabsScore: number;
  utsScore: number;
  uasScore: number;
  attendanceScore: number;
  finalGrade: number;
  letterGrade: string;
  labProgress: Array<{
    labId: string;
    sessionNumber: number;
    title: string;
    points: number;
    maxPoints: number;
    percentage: number;
    status: string;
  }>;
  activityHistory: Array<{
    date: string;
    points: number;
    commands: number;
  }>;
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`/api/progress/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Data Progres Tidak Tersedia</h3>
        <p className="text-gray-400">Mulai mengerjakan lab untuk melihat progres Anda</p>
      </div>
    );
  }

  // Prepare grade breakdown data
  const gradeData = [
    { name: 'Kehadiran (10%)', value: progress.attendanceScore * 0.1, full: 10 },
    { name: 'Lab Mingguan (30%)', value: progress.weeklyLabsScore * 0.3, full: 30 },
    { name: 'UTS (25%)', value: progress.utsScore * 0.25, full: 25 },
    { name: 'UAS (35%)', value: progress.uasScore * 0.35, full: 35 },
  ];

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'text-green-400';
    if (grade === 'B+' || grade === 'B') return 'text-cyan-400';
    if (grade === 'C+' || grade === 'C') return 'text-yellow-400';
    if (grade === 'D') return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Selesai', bg: 'bg-green-500/20', text: 'text-green-400' };
      case 'IN_PROGRESS':
        return { label: 'Sedang Dikerjakan', bg: 'bg-cyan-500/20', text: 'text-cyan-400' };
      default:
        return { label: 'Belum Dimulai', bg: 'bg-gray-500/20', text: 'text-gray-400' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span>📈</span> Progres Pembelajaran
        </h1>
        <p className="text-gray-400">
          Pantau perjalanan belajar dan performa Anda
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10 hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{progress.percentage}%</div>
          <div className="text-sm text-gray-400">Progres Keseluruhan</div>
          <div className="text-xs text-gray-500 mt-1">{progress.totalPoints} / {progress.maxPoints} poin</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10 hover:border-green-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {progress.completedLabs}/{progress.totalLabs}
          </div>
          <div className="text-sm text-gray-400">Lab Selesai</div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((progress.completedLabs / progress.totalLabs) * 100)}% penyelesaian
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
          </div>
          <div className={`text-3xl font-bold mb-1 ${getGradeColor(progress.letterGrade)}`}>
            {progress.letterGrade}
          </div>
          <div className="text-sm text-gray-400">Nilai Saat Ini</div>
          <div className="text-xs text-gray-500 mt-1">{progress.finalGrade.toFixed(2)} / 100</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10 hover:border-yellow-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{progress.attendanceScore}%</div>
          <div className="text-sm text-gray-400">Kehadiran</div>
          <div className="text-xs text-gray-500 mt-1">Hadir</div>
        </div>
      </div>

      {/* Grade Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Rincian Nilai
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Legend />
              <Bar dataKey="value" fill="#06B6D4" name="Saat Ini" radius={[4, 4, 0, 0]} />
              <Bar dataKey="full" fill="#374151" name="Maksimum" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2 bg-slate-700/30 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Kehadiran (10%):</span>
              <span className="font-semibold text-white">{progress.attendanceScore}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Lab Mingguan (30%):</span>
              <span className="font-semibold text-white">{progress.weeklyLabsScore.toFixed(2)}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">UTS (25%):</span>
              <span className="font-semibold text-white">{progress.utsScore}/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">UAS (35%):</span>
              <span className="font-semibold text-white">{progress.uasScore}/100</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
              <span className="text-gray-300">Nilai Akhir:</span>
              <span className={getGradeColor(progress.letterGrade)}>
                {progress.finalGrade.toFixed(2)} ({progress.letterGrade})
              </span>
            </div>
          </div>
        </div>

        {/* Lab Progress Chart */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🔬</span> Performa Lab
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progress.labProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="sessionNumber"
                tick={{ fill: '#9CA3AF' }}
                label={{ value: 'Sesi', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
              />
              <YAxis
                tick={{ fill: '#9CA3AF' }}
                label={{ value: 'Poin', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Legend />
              <Bar dataKey="points" fill="#10B981" name="Diperoleh" radius={[4, 4, 0, 0]} />
              <Bar dataKey="maxPoints" fill="#374151" name="Maksimum" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Timeline */}
      {progress.activityHistory && progress.activityHistory.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📅</span> Riwayat Aktivitas
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progress.activityHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fill: '#9CA3AF' }} />
              <YAxis yAxisId="left" tick={{ fill: '#9CA3AF' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="points" stroke="#06B6D4" name="Poin Diperoleh" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="commands" stroke="#10B981" name="Perintah Dieksekusi" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Lab Details Table */}
      <div className="bg-slate-800/50 rounded-xl border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📚</span> Detail Sesi Lab
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Sesi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Progres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Poin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {progress.labProgress.map((lab) => {
                const statusInfo = getStatusInfo(lab.status);
                return (
                  <tr key={lab.labId} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {lab.sessionNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">{lab.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">{lab.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${lab.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {lab.points} / {lab.maxPoints}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
  );
}
