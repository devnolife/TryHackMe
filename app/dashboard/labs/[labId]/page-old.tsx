'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const TerminalEmulator = dynamic(() => import('@/components/terminal/TerminalEmulator'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-slate-900 rounded-xl border border-white/10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Memuat terminal...</p>
      </div>
    </div>
  ),
});

interface Lab {
  id: string;
  title: string;
  description: string;
  topic: string;
  sessionNumber: number;
  difficultyLevel: string;
  theoryContent?: string;
  prerequisites?: string[];
  resources?: Array<{ title: string; url: string; type: string }>;
  keyCommands?: Array<{ command: string; description: string; example: string }>;
  scenarios: Array<{
    id: string;
    scenarioTitle: string;
    scenarioDescription: string;
    targetInfo: any;
    successCriteria: any;
    hints: any;
    maxPoints: number;
  }>;
}

export default function LabPage() {
  const params = useParams();
  const router = useRouter();
  const labId = params.labId as string;

  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [showHints, setShowHints] = useState(false);
  const [usedHints, setUsedHints] = useState<number[]>([]);
  const [availableHints, setAvailableHints] = useState<Array<{ level: number; text: string | null; penalty: number; isUsed: boolean }>>([]);
  const [completedObjectives, setCompletedObjectives] = useState<Set<number>>(new Set());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [hintPenalty, setHintPenalty] = useState(0);
  const [allComplete, setAllComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'materi' | 'praktikum'>('materi');
  const [materiRead, setMateriRead] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Session completion form states
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sessionCompletion, setSessionCompletion] = useState<{
    id: string;
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewerFeedback?: string;
  } | null>(null);

  useEffect(() => {
    if (labId) {
      fetchLabDetails();
      fetchCompletionStatus();
      fetchMateriReadStatus();

      // Poll for completion status updates every 10 seconds
      const intervalId = setInterval(() => {
        fetchCompletionStatus();
      }, 10000);

      // Cleanup interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [labId]);

  // Fetch materi read status from database
  const fetchMateriReadStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/labs/${labId}/materi-read`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setMateriRead(data.materiRead);
        // If materi already read, auto switch to praktikum
        if (data.materiRead) {
          setActiveTab('praktikum');
        }
      }
    } catch (error) {
      console.error('Error fetching materi read status:', error);
    }
  };

  // Mark materi as read and save to database
  const markMateriAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/labs/${labId}/materi-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setMateriRead(true);
        setActiveTab('praktikum');
        showNotification('✅ Materi sudah dibaca! Silakan lanjut ke praktikum.', 'success');
      } else {
        showNotification('❌ Gagal menyimpan status. Coba lagi.', 'warning');
      }
    } catch (error) {
      console.error('Error marking materi as read:', error);
      showNotification('❌ Terjadi kesalahan. Coba lagi.', 'warning');
    }
  };

  const fetchCompletionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/labs/${labId}/complete`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        if (data.completion) {
          setSessionCompletion(data.completion);
          setReflectionText(data.completion.reflectionText || '');
        }
        if (data.completedObjectives) {
          const indices = data.completedObjectives.map((c: any) => c.objectiveIndex);
          setCompletedObjectives(new Set(indices));
          setTotalPoints(data.totalPoints || 0);

          // Check if all objectives completed
          const criteriaCount = currentScenario?.successCriteria?.length || 0;
          if (indices.length >= criteriaCount && criteriaCount > 0) {
            setAllComplete(true);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching completion status:', error);
    }
  };

  const fetchLabDetails = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/labs/${labId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLab(data.lab);
        setIsAdmin(data.isAdmin || false);
        // Admin automatically has materiRead and allComplete
        if (data.isAdmin) {
          setMateriRead(true);
          setAllComplete(true);
        }
        if (data.lab.scenarios.length > 0) {
          const firstScenario = data.lab.scenarios[0];
          setCurrentScenario(firstScenario);
          // Fetch hints for the scenario
          fetchHints(firstScenario.id);
        }
      }
    } catch (error) {
      console.error('Error fetching lab details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show notification with auto-dismiss
  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleCommandExecute = async (command: string): Promise<{ output: string; currentDirectory?: string }> => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/commands/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          command,
          scenarioId: currentScenario?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Check for completed objectives
        if (data.completedObjectives && data.completedObjectives.length > 0) {
          data.completedObjectives.forEach((obj: { description: string; points: number }) => {
            // Find the index of this objective in successCriteria
            const criteriaList = currentScenario?.successCriteria || [];
            const objIndex = criteriaList.findIndex((c: any) => c.description === obj.description);

            if (objIndex >= 0 && !completedObjectives.has(objIndex)) {
              setCompletedObjectives(prev => new Set(Array.from(prev).concat([objIndex])));
              setTotalPoints(prev => prev + obj.points);
              showNotification(`🎯 Objektif Tercapai: ${obj.description} (+${obj.points} poin)`, 'success');
            }
          });
        }

        // Check if all objectives completed
        if (data.allObjectivesCompleted && !allComplete) {
          const criteriaList = currentScenario?.successCriteria || [];
          if (completedObjectives.size >= criteriaList.length - 1) {
            setAllComplete(true);
            setTimeout(() => {
              showNotification('🎉 Selamat! Semua objektif telah diselesaikan!', 'success');
            }, 1000);
          }
        }

        // Check for points awarded
        if (data.pointsAwarded > 0 && data.isValidForScenario) {
          showNotification(`✅ Perintah benar! +${data.pointsAwarded} poin`, 'success');
        }

        return {
          output: data.output,
          currentDirectory: data.currentDirectory,
        };
      } else {
        return {
          output: `Error: ${data.error || 'Eksekusi perintah gagal'}`,
        };
      }
    } catch (error) {
      console.error('Error executing command:', error);
      return {
        output: 'Error: Gagal mengeksekusi perintah',
      };
    }
  };

  const useHint = async (hintLevel: number) => {
    if (usedHints.includes(hintLevel) || !currentScenario) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/labs/${labId}/hints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          scenarioId: currentScenario.id,
          hintLevel,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUsedHints([...usedHints, hintLevel]);
        // Update available hints with the revealed text
        setAvailableHints(prev => prev.map(h =>
          h.level === hintLevel ? { ...h, text: data.hint.text, isUsed: true } : h
        ));

        if (!data.alreadyUsed && data.hint.penalty > 0) {
          setHintPenalty(prev => prev + data.hint.penalty);
          showNotification(`💡 Petunjuk Level ${hintLevel} dibuka (-${data.hint.penalty} poin)`, 'info');
        }
      }
    } catch (error) {
      console.error('Error requesting hint:', error);
      showNotification('Gagal mengambil petunjuk', 'warning');
    }
  };

  // Fetch hints for current scenario
  const fetchHints = async (scenarioId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/labs/${labId}/hints?scenarioId=${scenarioId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setAvailableHints(data.hints);
        setHintPenalty(data.totalPenalty || 0);
        setUsedHints(data.hints.filter((h: any) => h.isUsed).map((h: any) => h.level));
      }
    } catch (error) {
      console.error('Error fetching hints:', error);
    }
  };

  // Submit session completion reflection
  const submitReflection = async () => {
    if (reflectionText.trim().length < 50) {
      showNotification('Refleksi pembelajaran minimal 50 karakter', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/labs/${labId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reflectionText }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionCompletion(data.completion);
        setShowCompletionForm(false);
        showNotification('✅ Refleksi berhasil dikirim! Menunggu review admin.', 'success');
      } else {
        showNotification(data.error || 'Gagal mengirim refleksi', 'warning');
      }
    } catch (error) {
      showNotification('Gagal mengirim refleksi', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyInfo = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return { label: 'Pemula', color: 'from-green-500 to-emerald-500' };
      case 'INTERMEDIATE':
        return { label: 'Menengah', color: 'from-yellow-500 to-orange-500' };
      case 'ADVANCED':
        return { label: 'Lanjutan', color: 'from-red-500 to-rose-500' };
      default:
        return { label: level, color: 'from-gray-500 to-gray-600' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Lab Tidak Ditemukan</h3>
        <p className="text-gray-400 mb-6">Lab yang Anda cari tidak tersedia</p>
        <Link
          href="/dashboard/labs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition font-medium"
        >
          ← Kembali ke Daftar Lab
        </Link>
      </div>
    );
  }

  const difficulty = getDifficultyInfo(lab.difficultyLevel);

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 animate-slide-in-right max-w-md`}>
          <div className={`rounded-xl p-4 shadow-2xl border ${notification.type === 'success'
            ? 'bg-gradient-to-r from-green-500/90 to-emerald-500/90 border-green-400/50'
            : notification.type === 'warning'
              ? 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 border-yellow-400/50'
              : 'bg-gradient-to-r from-cyan-500/90 to-blue-500/90 border-cyan-400/50'
            }`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {notification.type === 'success' ? '✅' : notification.type === 'warning' ? '⚠️' : 'ℹ️'}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Complete Banner with Completion Form */}
      {allComplete && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">🎉</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-400">Lab Selesai!</h3>
              <p className="text-green-300/80">Selamat! Anda telah menyelesaikan semua objektif dalam lab ini.</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-300">Total Poin</div>
              <div className="text-2xl font-bold text-green-400">{totalPoints}</div>
            </div>
          </div>

          {/* Session Completion Status */}
          {sessionCompletion && !showCompletionForm ? (
            <div className={`mt-4 p-4 rounded-lg border ${sessionCompletion.reviewStatus === 'APPROVED'
              ? 'bg-green-500/10 border-green-500/30'
              : sessionCompletion.reviewStatus === 'REJECTED'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30'
              }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {sessionCompletion.reviewStatus === 'APPROVED' ? '✅' : sessionCompletion.reviewStatus === 'REJECTED' ? '❌' : '⏳'}
                </span>
                <div className="flex-1">
                  <h4 className={`font-semibold ${sessionCompletion.reviewStatus === 'APPROVED'
                    ? 'text-green-400'
                    : sessionCompletion.reviewStatus === 'REJECTED'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                    }`}>
                    {sessionCompletion.reviewStatus === 'APPROVED'
                      ? 'Sesi Disetujui! Anda dapat melanjutkan ke sesi berikutnya.'
                      : sessionCompletion.reviewStatus === 'REJECTED'
                        ? 'Refleksi Ditolak - Silakan perbaiki dan kirim ulang'
                        : 'Menunggu Review Admin'}
                  </h4>
                  {sessionCompletion.reviewerFeedback && (
                    <p className="text-sm text-gray-300 mt-1">
                      <span className="font-medium">Feedback:</span> {sessionCompletion.reviewerFeedback}
                    </p>
                  )}
                </div>
                {sessionCompletion.reviewStatus === 'REJECTED' && (
                  <button
                    onClick={() => setShowCompletionForm(true)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition"
                  >
                    Perbaiki & Kirim Ulang
                  </button>
                )}
                {sessionCompletion.reviewStatus === 'APPROVED' && (
                  <Link
                    href="/dashboard/labs"
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium transition hover:opacity-90"
                  >
                    Lanjut ke Sesi Berikutnya →
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              {!showCompletionForm ? (
                <button
                  onClick={() => setShowCompletionForm(true)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition"
                >
                  📝 Tulis Refleksi Pembelajaran untuk Lanjut ke Sesi Berikutnya
                </button>
              ) : (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span>📝</span> {sessionCompletion ? 'Perbaiki Refleksi Pembelajaran' : 'Refleksi Pembelajaran'}
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    {sessionCompletion?.reviewerFeedback && (
                      <span className="block text-yellow-400 mb-2">
                        <span className="font-medium">Feedback sebelumnya:</span> {sessionCompletion.reviewerFeedback}
                      </span>
                    )}
                    Tuliskan apa yang telah Anda pelajari dari sesi ini. Refleksi ini akan dikirim ke admin untuk direview sebelum Anda dapat melanjutkan ke sesi berikutnya.
                  </p>
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    onKeyDown={(e) => {
                      // Prevent space key from bubbling to terminal
                      if (e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                    placeholder="Tuliskan refleksi pembelajaran Anda di sini... (minimal 50 karakter)&#10;&#10;Contoh:&#10;- Apa yang saya pelajari dari sesi ini?&#10;- Konsep/teknik apa yang baru saya pahami?&#10;- Bagaimana saya bisa menerapkan pengetahuan ini?"
                    className="w-full h-40 bg-slate-700/50 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-sm ${reflectionText.length < 50 ? 'text-red-400' : 'text-green-400'}`}>
                      {reflectionText.length}/50 karakter minimum
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCompletionForm(false)}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition"
                      >
                        Batal
                      </button>
                      <button
                        onClick={submitReflection}
                        disabled={submitting || reflectionText.length < 50}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Mengirim...' : sessionCompletion ? 'Kirim Ulang Refleksi' : 'Kirim Refleksi'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10">
        <Link
          href="/dashboard/labs"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 text-sm"
        >
          <span>←</span> Kembali ke Daftar Lab
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 bg-gradient-to-r ${difficulty.color} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
              {lab.sessionNumber}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {lab.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${difficulty.color} text-white`}>
                  {difficulty.label}
                </span>
                <span className="text-sm text-gray-400">📚 {lab.topic}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-400">Total Poin</div>
              <div className="text-xl font-bold text-white">
                {currentScenario?.maxPoints || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('materi')}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'materi'
            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <span>📚</span> Materi
          {!materiRead && lab?.theoryContent && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>
        <button
          onClick={() => {
            if (!materiRead && lab?.theoryContent) {
              showNotification('💡 Baca materi terlebih dahulu sebelum praktikum', 'warning');
              return;
            }
            setActiveTab('praktikum');
          }}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'praktikum'
            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
            } ${!materiRead && lab?.theoryContent ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span>💻</span> Praktikum
          {materiRead && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Siap</span>
          )}
        </button>
      </div>

      {/* Tab Content: Materi */}
      {activeTab === 'materi' && (
        <div className="space-y-6">
          {/* Learning Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Time Estimate Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-transparent rounded-2xl p-5 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div>
                  <p className="text-xs text-blue-400 uppercase tracking-wider font-medium">Estimasi Waktu</p>
                  <p className="text-xl font-bold text-white">15-30 menit</p>
                </div>
              </div>
            </div>

            {/* Difficulty Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-transparent rounded-2xl p-5 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <p className="text-xs text-purple-400 uppercase tracking-wider font-medium">Tingkat Kesulitan</p>
                  <p className="text-xl font-bold text-white">{getDifficultyInfo(lab?.difficultyLevel || 'BEGINNER').label}</p>
                </div>
              </div>
            </div>

            {/* Topic Card */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent rounded-2xl p-5 border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <p className="text-xs text-emerald-400 uppercase tracking-wider font-medium">Topik</p>
                  <p className="text-xl font-bold text-white">{lab?.topic}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prerequisites - Modern Accordion Style */}
          {lab?.prerequisites && lab.prerequisites.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Prasyarat</h3>
                    <p className="text-xs text-amber-400/80">Pastikan Anda memahami konsep berikut sebelum memulai</p>
                  </div>
                </div>
                <div className="grid gap-2">
                  {lab.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors duration-200 group">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform duration-200">
                        ✓
                      </div>
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-200">{prereq}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Theory Content - Enhanced Design */}
          {lab?.theoryContent && (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl">
              {/* Header with gradient */}
              <div className="relative overflow-hidden px-6 py-5 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
                <div className="relative flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    <span className="text-2xl">📖</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Materi Pembelajaran</h3>
                    <p className="text-sm text-cyan-400/80">Pelajari konsep dasar sebelum praktikum</p>
                  </div>
                </div>
              </div>

              {/* Content with custom styling */}
              <div className="p-6 lg:p-8">
                <div className="prose prose-invert prose-cyan max-w-none">
                  <div
                    className="theory-content leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(lab.theoryContent)
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Key Commands - Modern Card Grid */}
          {lab?.keyCommands && lab.keyCommands.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
                    <span className="text-2xl">⌨️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Perintah Utama</h3>
                    <p className="text-sm text-green-400/80">Pelajari perintah yang akan digunakan</p>
                  </div>
                </div>
              </div>

              {/* Commands Grid */}
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {lab.keyCommands.map((cmd, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-white/5 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
                    >
                      {/* Command number badge */}
                      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-3xl flex items-start justify-end p-2">
                        <span className="text-xs font-bold text-green-400/60">{String(index + 1).padStart(2, '0')}</span>
                      </div>

                      <div className="p-5">
                        {/* Command */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="px-3 py-1.5 bg-slate-900/80 rounded-lg border border-green-500/30 font-mono text-sm text-green-400 group-hover:border-green-400/50 group-hover:text-green-300 transition-colors duration-300 flex items-center gap-2">
                            <span className="text-green-500/50">$</span>
                            <span>{cmd.command}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">{cmd.description}</p>

                        {/* Example */}
                        <div className="relative overflow-hidden rounded-lg bg-slate-900/80 border border-white/5 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Contoh Penggunaan</span>
                          </div>
                          <code className="text-xs font-mono text-cyan-400 break-all">{cmd.example}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resources - Modern Link Cards */}
          {lab?.resources && lab.resources.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Referensi & Sumber Belajar</h3>
                    <p className="text-sm text-violet-400/80">Materi tambahan untuk memperdalam pemahaman</p>
                  </div>
                </div>
              </div>

              {/* Resources Grid */}
              <div className="p-6">
                <div className="grid gap-3 md:grid-cols-2">
                  {lab.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center gap-4 p-4 rounded-xl bg-slate-700/30 border border-white/5 hover:border-violet-500/40 hover:bg-slate-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 overflow-hidden"
                    >
                      {/* Hover gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Icon */}
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">
                          {resource.type === 'documentation' ? '📖' :
                            resource.type === 'tool' ? '🛠️' :
                              resource.type === 'course' ? '🎓' :
                                resource.type === 'database' ? '🗄️' :
                                  resource.type === 'cheatsheet' ? '📝' : '🔗'}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="relative flex-1 min-w-0">
                        <div className="text-white font-medium group-hover:text-violet-300 transition-colors duration-300 truncate">
                          {resource.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-violet-400/60 uppercase tracking-wider font-medium">{resource.type}</span>
                          <span className="text-violet-500/40">•</span>
                          <span className="text-xs text-gray-500 truncate">{resource.url}</span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="relative w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors duration-300">
                        <span className="text-violet-400 group-hover:translate-x-1 transition-transform duration-300">→</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mark as Read Button - Enhanced CTA - Only show if not read yet */}
          {!materiRead && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-teal-500/20 border border-green-500/30 p-8">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-3xl"></div>

              <div className="relative flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/30 animate-pulse">
                  <span className="text-3xl">✨</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Siap untuk Praktikum?</h3>
                  <p className="text-gray-400 max-w-md">Pastikan Anda telah memahami semua materi di atas sebelum melanjutkan ke sesi praktikum.</p>
                </div>
                <button
                  onClick={markMateriAsRead}
                  className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 flex items-center gap-3 overflow-hidden"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative">✓</span>
                  <span className="relative">Saya Sudah Membaca Materi - Lanjut ke Praktikum</span>
                  <span className="relative group-hover:translate-x-1 transition-transform duration-300">→</span>
                </button>
              </div>
            </div>
          )}

          {/* Already Read - Quick Action to go to Praktikum */}
          {materiRead && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 border border-cyan-500/30 p-6">
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Materi Sudah Dibaca</h3>
                    <p className="text-sm text-gray-400">Anda dapat melanjutkan ke sesi praktikum</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('praktikum')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/40 hover:scale-105 flex items-center gap-2"
                >
                  <span>💻</span>
                  <span>Buka Praktikum</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Praktikum */}
      {activeTab === 'praktikum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Lab Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Scenario Info */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📋</span> Skenario Aktif
              </h2>

              {currentScenario && (
                <div>
                  <h3 className="font-semibold text-white mb-2">
                    {currentScenario.scenarioTitle}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {currentScenario.scenarioDescription}
                  </p>

                  <div className="border-t border-white/10 pt-4">
                    <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                      <span>🎯</span> Informasi Target
                    </h4>
                    <div className="bg-slate-700/50 rounded-lg p-3 text-sm space-y-2">
                      {currentScenario.targetInfo.company && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Perusahaan:</span>
                          <span className="text-cyan-400 font-mono">{currentScenario.targetInfo.company}</span>
                        </div>
                      )}
                      {currentScenario.targetInfo.domain && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Domain:</span>
                          <span className="text-cyan-400 font-mono">{currentScenario.targetInfo.domain}</span>
                        </div>
                      )}
                      {currentScenario.targetInfo.ip_address && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">IP:</span>
                          <span className="text-cyan-400 font-mono">{currentScenario.targetInfo.ip_address}</span>
                        </div>
                      )}
                      {currentScenario.targetInfo.network && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Network:</span>
                          <span className="text-cyan-400 font-mono">{currentScenario.targetInfo.network}</span>
                        </div>
                      )}
                      {/* Services info - handle both array and object formats */}
                      {currentScenario.targetInfo.services && (
                        <div className="pt-2 border-t border-white/10">
                          <span className="text-gray-400 block mb-2">Layanan Terdeteksi:</span>
                          <div className="space-y-1">
                            {Array.isArray(currentScenario.targetInfo.services) ? (
                              // Array format: ['HTTP', 'HTTPS', 'SSH', 'FTP']
                              <div className="flex flex-wrap gap-2">
                                {currentScenario.targetInfo.services.map((service: string, idx: number) => (
                                  <span key={idx} className="text-yellow-400 font-mono text-xs bg-yellow-500/10 px-2 py-1 rounded">
                                    {service}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              // Object format: { 'Apache 2.4.6': ['CVE-xxx'], ... }
                              Object.entries(currentScenario.targetInfo.services).map(([service, cves]: [string, any]) => (
                                <div key={service} className="flex justify-between items-start">
                                  <span className="text-yellow-400 font-mono text-xs">{service}</span>
                                  {Array.isArray(cves) && cves.length > 0 && (
                                    <span className="text-red-400 text-xs">{cves.join(', ')}</span>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                      {/* Password hashes for password cracking labs */}
                      {currentScenario.targetInfo.password_hashes && currentScenario.targetInfo.password_hashes.length > 0 && (
                        <div className="pt-2 border-t border-white/10">
                          <span className="text-gray-400 block mb-2">Hash Password:</span>
                          <div className="space-y-1">
                            {currentScenario.targetInfo.password_hashes.map((hash: string, idx: number) => (
                              <div key={idx} className="font-mono text-xs text-purple-400 break-all">
                                {hash}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Additional note */}
                      {currentScenario.targetInfo.note && (
                        <div className="pt-2 border-t border-white/10">
                          <span className="text-gray-400">Catatan:</span>
                          <p className="text-gray-300 text-xs mt-1">{currentScenario.targetInfo.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Answer Section */}
            {isAdmin && currentScenario && (
              <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/30">
                <h2 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <span>🔑</span> Jawaban & Command (Admin Only)
                </h2>

                {/* Success Criteria with Answers */}
                {currentScenario.successCriteria && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-purple-300">Kriteria Sukses:</h4>
                    {currentScenario.successCriteria.map((criteria: any, index: number) => (
                      <div key={index} className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-sm text-white mb-2">
                          <span className="text-purple-400">{index + 1}.</span> {criteria.description}
                        </div>
                        {criteria.command_pattern && (
                          <div className="text-xs">
                            <span className="text-gray-400">Pattern: </span>
                            <code className="text-green-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                              {criteria.command_pattern}
                            </code>
                          </div>
                        )}
                        {criteria.expected_output_keyword && (
                          <div className="text-xs mt-1">
                            <span className="text-gray-400">Expected Output: </span>
                            <code className="text-yellow-400 font-mono">
                              {criteria.expected_output_keyword}
                            </code>
                          </div>
                        )}
                        {criteria.hint && (
                          <div className="text-xs mt-1">
                            <span className="text-gray-400">Hint: </span>
                            <span className="text-cyan-400">{criteria.hint}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Hints for Admin */}
                {currentScenario.hints && currentScenario.hints.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-purple-500/20">
                    <h4 className="text-sm font-semibold text-purple-300 mb-3">Semua Hints:</h4>
                    <div className="space-y-2">
                      {currentScenario.hints.map((hint: any, index: number) => (
                        <div key={index} className="bg-slate-900/50 rounded-lg p-2 text-sm">
                          <span className="text-yellow-400">Level {hint.level}:</span>
                          <span className="text-gray-300 ml-2">{hint.hint_text}</span>
                          <span className="text-red-400 ml-2 text-xs">(-{hint.point_penalty} pts)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-purple-500/20 text-center">
                  <p className="text-sm text-purple-300">
                    ⚠️ Informasi ini hanya terlihat oleh Admin/Instructor
                  </p>
                </div>
              </div>
            )}

            {/* Objectives */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>✅</span> Objektif
                  {isAdmin && <span className="text-xs text-purple-400 ml-2">(Admin: Auto-complete)</span>}
                </h2>
                <div className="text-sm text-gray-400">
                  {isAdmin ? currentScenario?.successCriteria?.length || 0 : completedObjectives.size}/{currentScenario?.successCriteria?.length || 0} selesai
                </div>
              </div>

              {/* Scoring Info Banner */}
              <div className="mb-4 p-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400">📊</span>
                    <span className="text-gray-300">Cara mencapai 100%:</span>
                  </div>
                  <div className="text-cyan-400 font-semibold">
                    {currentScenario?.successCriteria?.reduce((sum: number, c: any) => sum + (c.points || 0), 0) || 0} / {currentScenario?.maxPoints || 0} poin
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  💡 Selesaikan semua objektif di bawah ini untuk mendapatkan poin maksimal. Hindari menggunakan petunjuk untuk mempertahankan poin.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{
                      width: isAdmin ? '100%' : `${currentScenario?.successCriteria?.length
                        ? (completedObjectives.size / currentScenario.successCriteria.length) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>

              {currentScenario?.successCriteria && (
                <div className="space-y-3">
                  {currentScenario.successCriteria.map((criteria: any, index: number) => {
                    const isCompleted = isAdmin || completedObjectives.has(index); // Admin auto-complete
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-3 rounded-lg p-3 transition-all duration-300 ${isCompleted
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'bg-slate-700/30'
                          }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${isCompleted
                          ? 'bg-green-500 text-white'
                          : 'border border-white/20'
                          }`}>
                          {isCompleted ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-gray-500 text-xs">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm transition-all duration-300 ${isCompleted ? 'text-green-300 line-through' : 'text-white'
                            }`}>
                            {criteria.description}
                          </div>
                          <div className={`text-xs mt-1 ${isCompleted ? 'text-green-400' : 'text-cyan-400'
                            }`}>
                            {isCompleted ? '✓ Selesai' : `+${criteria.points} poin`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Points Summary */}
              {totalPoints > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-gray-400">Total Poin Diperoleh:</span>
                  <span className="text-xl font-bold text-green-400">+{totalPoints}</span>
                </div>
              )}
            </div>

            {/* Hints */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>💡</span> Petunjuk
                  {hintPenalty > 0 && (
                    <span className="text-xs text-red-400 ml-2">(-{hintPenalty} poin)</span>
                  )}
                </h2>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-sm text-cyan-400 hover:text-cyan-300"
                >
                  {showHints ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>

              {showHints && availableHints.length > 0 && (
                <div className="space-y-3">
                  {availableHints.map((hint, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-3 border ${hint.isUsed
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-slate-700/30 border-white/10'
                        }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-yellow-400">
                          Petunjuk Level {hint.level}
                        </span>
                        <span className="text-xs text-red-400">-{hint.penalty} poin</span>
                      </div>
                      {hint.isUsed && hint.text ? (
                        <p className="text-sm text-gray-300">{hint.text}</p>
                      ) : (
                        <button
                          onClick={() => useHint(hint.level)}
                          className="text-sm text-cyan-400 hover:text-cyan-300"
                        >
                          Klik untuk membuka petunjuk
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {showHints && availableHints.length === 0 && (
                <p className="text-sm text-gray-500">
                  Tidak ada petunjuk tersedia untuk skenario ini
                </p>
              )}

              {!showHints && (
                <p className="text-sm text-gray-500">
                  Klik tampilkan untuk melihat petunjuk (akan mengurangi poin)
                </p>
              )}
            </div>
          </div>

          {/* Right side - Terminal */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>💻</span> Terminal Lab
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
              </div>

              <div className="h-[600px] rounded-lg overflow-hidden">
                <TerminalEmulator
                  onCommandExecute={handleCommandExecute}
                  labTitle={lab.title}
                />
              </div>

              <div className="mt-4 bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2">📝 Perintah yang Tersedia:</h4>
                <div className="flex flex-wrap gap-2">
                  {['whois', 'nslookup', 'dig', 'geoip', 'nmap', 'searchsploit', 'help'].map((cmd) => (
                    <code key={cmd} className="text-xs bg-slate-600 text-cyan-400 px-2 py-1 rounded">
                      {cmd}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced markdown to HTML renderer with modern styling
function renderMarkdown(markdown: string): string {
  if (!markdown) return '';

  let html = markdown
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers with modern styling
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-white mt-8 mb-4 flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mt-10 mb-5 pb-3 border-b border-white/10 flex items-center gap-3"><span class="w-8 h-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"></span>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-5">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="text-cyan-300 font-semibold"><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-gray-300 italic">$1</em>')
    // Inline code with modern pill style
    .replace(/`([^`]+)`/g, '<code class="inline-flex items-center px-2 py-0.5 mx-0.5 text-sm font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">$1</code>')
    // Code blocks with enhanced styling
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const langLabel = lang || 'bash';
      return `<div class="my-6 rounded-xl overflow-hidden border border-white/10 bg-slate-900/80 shadow-xl shadow-black/20">
        <div class="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-white/10">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-yellow-500/80"></span>
            <span class="w-3 h-3 rounded-full bg-green-500/80"></span>
          </div>
          <span class="text-xs text-gray-500 font-mono uppercase tracking-wider">${langLabel}</span>
        </div>
        <pre class="p-4 overflow-x-auto"><code class="text-sm font-mono text-green-400 leading-relaxed">${code.trim()}</code></pre>
      </div>`;
    })
    // Tables - enhanced
    .replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim());
      const isHeader = cells.some((cell: string) => cell.includes('---'));
      if (isHeader) return '';
      return `<tr class="border-b border-white/5 hover:bg-slate-700/30 transition-colors">${cells.map((cell: string) =>
        `<td class="px-4 py-3 text-gray-300">${cell}</td>`
      ).join('')}</tr>`;
    })
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-8 border-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />')
    // Blockquotes with modern styling
    .replace(/^> (.*$)/gm, '<blockquote class="relative my-6 pl-6 py-4 pr-4 bg-gradient-to-r from-cyan-500/10 to-transparent border-l-4 border-cyan-500 rounded-r-xl text-gray-300 italic"><span class="absolute top-2 left-2 text-3xl text-cyan-500/30">"</span>$1</blockquote>')
    // Unordered lists with modern bullets
    .replace(/^- (.*$)/gm, '<li class="flex items-start gap-3 text-gray-300 my-2"><span class="mt-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex-shrink-0"></span><span>$1</span></li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="flex items-start gap-3 text-gray-300 my-2"><span class="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">$1</span><span>$2</span></li>')
    // Links with hover effect
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors duration-200 underline decoration-cyan-400/30 hover:decoration-cyan-300 underline-offset-4">$1<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></a>')
    // Checkmarks with colored icons
    .replace(/✅/g, '<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 text-green-400 text-sm">✓</span>')
    .replace(/❌/g, '<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-sm">✗</span>')
    // Warning/Info boxes (lines starting with ⚠️ or ℹ️)
    .replace(/^⚠️ (.*$)/gm, '<div class="flex items-start gap-3 my-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20"><span class="text-xl">⚠️</span><span class="text-yellow-200">$1</span></div>')
    .replace(/^ℹ️ (.*$)/gm, '<div class="flex items-start gap-3 my-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"><span class="text-xl">ℹ️</span><span class="text-blue-200">$1</span></div>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="text-gray-300 my-4 leading-relaxed">')
    .replace(/\n/g, '<br />');

  // Wrap in paragraph
  html = `<p class="text-gray-300 my-4 leading-relaxed">${html}</p>`;

  // Clean up empty paragraphs and fix nested elements
  html = html.replace(/<p class="text-gray-300 my-4 leading-relaxed"><\/p>/g, '');
  html = html.replace(/<p class="text-gray-300 my-4 leading-relaxed">(<h[1-3])/g, '$1');
  html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
  html = html.replace(/<p class="text-gray-300 my-4 leading-relaxed">(<div class="my-6)/g, '$1');
  html = html.replace(/(<\/div>)<\/p>/g, '$1');
  html = html.replace(/<p class="text-gray-300 my-4 leading-relaxed">(<blockquote)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p class="text-gray-300 my-4 leading-relaxed">(<hr)/g, '$1');
  html = html.replace(/<p class="text-gray-300 my-4 leading-relaxed">(<li)/g, '<ul class="my-4 space-y-1">$1');
  html = html.replace(/(<\/li>)<\/p>/g, '$1</ul>');

  return html;
}
