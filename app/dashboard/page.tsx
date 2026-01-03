'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  totalLabs: number;
  completedLabs: number;
  totalPoints: number;
  maxPoints: number;
}

interface ProgressData {
  overallPercentage: number;
  totalPoints: number;
  labs: Array<{
    sessionNumber: number;
    topic: string;
    title: string;
    difficultyLevel: string;
    progress: number;
    earnedPoints: number;
    maxPoints: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({
    totalLabs: 8,
    completedLabs: 0,
    totalPoints: 0,
    maxPoints: 800,
  });
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Redirect admin/instructor ke dashboard admin
      if (parsedUser.role === 'ADMIN' || parsedUser.role === 'INSTRUCTOR') {
        router.replace('/dashboard/admin');
        return;
      }

      // Fetch student progress
      fetchProgress(parsedUser.userId);
    } else {
      setLoading(false);
    }
  }, [router]);

  const fetchProgress = async (studentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/progress/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setProgressData(data.progress);

        // Update stats with real data
        const completedLabs = data.progress.labs.filter((lab: any) => lab.progress >= 100).length;
        const totalPoints = data.progress.totalPoints || 0;
        const maxPoints = data.progress.labs.reduce((sum: number, lab: any) => sum + lab.maxPoints, 0);

        setStats({
          totalLabs: data.progress.labs.length,
          completedLabs,
          totalPoints,
          maxPoints,
        });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = stats.maxPoints > 0
    ? Math.round((stats.totalPoints / stats.maxPoints) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Selamat Datang, {user?.fullName || 'Pengguna'}! 👋
            </h1>
            <p className="text-gray-400">
              Lanjutkan perjalanan Anda menjadi Ethical Hacker profesional
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">🛡️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10 hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <span className="text-xs text-gray-400 bg-slate-700 px-2 py-1 rounded-full">Total</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalLabs}</div>
          <div className="text-sm text-gray-400">Modul Lab</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10 hover:border-green-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <span className="text-xs text-gray-400 bg-slate-700 px-2 py-1 rounded-full">Selesai</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.completedLabs}</div>
          <div className="text-sm text-gray-400">Lab Selesai</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
            <span className="text-xs text-gray-400 bg-slate-700 px-2 py-1 rounded-full">Poin</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalPoints}</div>
          <div className="text-sm text-gray-400">Total Poin</div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10 hover:border-yellow-500/50 transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <span className="text-xs text-gray-400 bg-slate-700 px-2 py-1 rounded-full">Progres</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{progressPercentage}%</div>
          <div className="text-sm text-gray-400">Penyelesaian</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎯</span> Lanjutkan Pembelajaran
          </h2>
          {progressData && progressData.labs.length > 0 ? (
            <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {progressData.labs[0].sessionNumber}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{progressData.labs[0].title}</h3>
                    <p className="text-xs text-gray-400">{progressData.labs[0].topic}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  progressData.labs[0].difficultyLevel === 'BEGINNER'
                    ? 'bg-green-500/20 text-green-400'
                    : progressData.labs[0].difficultyLevel === 'INTERMEDIATE'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {progressData.labs[0].difficultyLevel === 'BEGINNER' ? 'Pemula' : progressData.labs[0].difficultyLevel === 'INTERMEDIATE' ? 'Menengah' : 'Mahir'}
                </span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full" style={{ width: `${Math.min(progressData.labs[0].progress, 100)}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{Math.round(progressData.labs[0].progress)}% selesai</span>
                <span>{progressData.labs[0].earnedPoints}/{progressData.labs[0].maxPoints} poin</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Memuat...</h3>
                    <p className="text-xs text-gray-400">Loading progress data...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Link
            href="/dashboard/labs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
          >
            Mulai Lab
            <span>→</span>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⏰</span> Aktivitas Terbaru
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <span className="text-gray-400">Login ke platform</span>
              <span className="text-xs text-gray-500 ml-auto">Baru saja</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-gray-500">Belum ada aktivitas lab</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <Link
              href="/dashboard/progress"
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
            >
              Lihat Semua Progres →
            </Link>
          </div>
        </div>
      </div>

      {/* Lab Sessions Preview */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🔬</span> Sesi Lab Tersedia
          </h2>
          <Link
            href="/dashboard/labs"
            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: 1, title: 'Pengantar & OSINT', level: 'Pemula', color: 'from-green-500 to-emerald-500', status: 'available' },
            { num: 2, title: 'Network Scanning', level: 'Menengah', color: 'from-yellow-500 to-orange-500', status: 'locked' },
            { num: 3, title: 'Vulnerability Assessment', level: 'Menengah', color: 'from-yellow-500 to-orange-500', status: 'locked' },
            { num: 4, title: 'UTS - Proyek Recon', level: 'Menengah', color: 'from-yellow-500 to-orange-500', status: 'locked' },
          ].map((lab) => (
            <div
              key={lab.num}
              className={`bg-slate-700/50 rounded-lg p-4 border border-white/5 ${lab.status === 'available' ? 'hover:border-cyan-500/50 cursor-pointer' : 'opacity-50'
                } transition`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${lab.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                  {lab.num}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${lab.color} text-white`}>
                  {lab.level}
                </span>
              </div>
              <h3 className="text-white font-medium text-sm mb-2">{lab.title}</h3>
              {lab.status === 'available' ? (
                <span className="text-xs text-cyan-400">Tersedia</span>
              ) : (
                <span className="text-xs text-gray-500">🔒 Terkunci</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-6 border border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">Tips untuk Pemula</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Mulailah dengan Sesi 1 untuk mempelajari dasar-dasar Ethical Hacking.
              Pahami konsep OSINT (Open Source Intelligence) dan teknik reconnaissance
              sebelum melanjutkan ke modul yang lebih kompleks. Jangan lupa untuk
              mengerjakan semua skenario praktik!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
