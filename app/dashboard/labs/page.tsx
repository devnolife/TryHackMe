'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Lab {
  id: string;
  title: string;
  description: string;
  topic: string;
  sessionNumber: number;
  difficultyLevel: string;
  estimatedDurationMinutes: number;
  progress: {
    totalPoints: number;
    maxPoints: number;
    percentage: number;
    status: string;
  };
  _count: {
    scenarios: number;
  };
  isLocked: boolean;
  lockReason: string;
  completionStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/labs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLabs(data.labs);
      }
    } catch (error) {
      console.error('Error fetching labs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyInfo = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return { label: 'Pemula', color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/20', text: 'text-green-400' };
      case 'INTERMEDIATE':
        return { label: 'Menengah', color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
      case 'ADVANCED':
        return { label: 'Lanjutan', color: 'from-red-500 to-rose-500', bg: 'bg-red-500/20', text: 'text-red-400' };
      default:
        return { label: level, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-500/20', text: 'text-gray-400' };
    }
  };

  const getStatusInfo = (status: string, completionStatus: string | null) => {
    // If session is approved, show that
    if (completionStatus === 'APPROVED') {
      return { label: 'Disetujui ✓', color: 'text-green-400', bg: 'bg-green-500/20' };
    }
    if (completionStatus === 'PENDING') {
      return { label: 'Menunggu Review', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    }
    if (completionStatus === 'REJECTED') {
      return { label: 'Perlu Revisi', color: 'text-red-400', bg: 'bg-red-500/20' };
    }

    switch (status) {
      case 'COMPLETED':
        return { label: 'Selesai', color: 'text-green-400', bg: 'bg-green-500/20' };
      case 'IN_PROGRESS':
        return { label: 'Sedang Dikerjakan', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
      default:
        return { label: 'Belum Dimulai', color: 'text-gray-400', bg: 'bg-gray-500/20' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span>🔬</span> Sesi Laboratorium
        </h1>
        <p className="text-gray-400">
          Pilih sesi lab untuk memulai pelatihan ethical hacking Anda
        </p>
      </div>

      {/* Labs Grid */}
      <div className="space-y-4">
        {labs.map((lab) => {
          const difficulty = getDifficultyInfo(lab.difficultyLevel);
          const status = getStatusInfo(lab.progress.status, lab.completionStatus);
          const isLocked = lab.isLocked;

          return (
            <div
              key={lab.id}
              className={`bg-slate-800/50 rounded-xl border transition overflow-hidden ${isLocked
                  ? 'border-gray-600/50 opacity-75'
                  : 'border-white/10 hover:border-cyan-500/50'
                }`}
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Lab Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${isLocked
                          ? 'bg-gray-600'
                          : `bg-gradient-to-r ${difficulty.color}`
                        }`}>
                        {isLocked ? '🔒' : lab.sessionNumber}
                      </div>
                      <div>
                        <h2 className={`text-xl font-bold ${isLocked ? 'text-gray-400' : 'text-white'}`}>
                          {lab.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${isLocked
                              ? 'bg-gray-600 text-gray-300'
                              : `bg-gradient-to-r ${difficulty.color} text-white`
                            }`}>
                            {difficulty.label}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className={`text-sm mb-4 ${isLocked ? 'text-gray-500' : 'text-gray-400'}`}>
                      {lab.description}
                    </p>

                    {/* Lock Reason */}
                    {isLocked && lab.lockReason && (
                      <div className="bg-gray-700/30 rounded-lg p-3 mb-4 border border-gray-600/50">
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <span>🔐</span> {lab.lockReason}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 flex-wrap text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <span>📚</span> {lab.topic}
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <span>⏱️</span> {Math.floor(lab.estimatedDurationMinutes / 60)} jam
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <span>🎯</span> {lab._count.scenarios} skenario
                      </span>
                      <span className="text-gray-400 flex items-center gap-1">
                        <span>⭐</span> {lab.progress.maxPoints} poin
                      </span>
                    </div>
                  </div>

                  {/* Right: Progress & Action */}
                  <div className="lg:w-64">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Progres</span>
                        <span className="text-sm font-medium text-white">
                          {lab.progress.totalPoints}/{lab.progress.maxPoints} poin
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isLocked
                              ? 'bg-gray-600'
                              : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                            }`}
                          style={{ width: `${lab.progress.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-right mt-1">
                        <span className="text-xs text-gray-500">{lab.progress.percentage}% selesai</span>
                      </div>
                    </div>

                    {isLocked ? (
                      <button
                        disabled
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed font-medium"
                      >
                        <span>🔒</span> Terkunci
                      </button>
                    ) : (
                      <Link
                        href={`/dashboard/labs/${lab.id}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition font-medium"
                      >
                        {lab.progress.status === 'NOT_STARTED' ? 'Mulai Lab' : 'Lanjutkan'}
                        <span>→</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {labs.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📭</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Tidak Ada Lab Tersedia</h3>
          <p className="text-gray-400">Sesi lab akan segera tersedia</p>
        </div>
      )}
    </div>
  );
}
