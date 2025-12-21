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
  const [completedObjectives, setCompletedObjectives] = useState<Set<number>>(new Set());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [allComplete, setAllComplete] = useState(false);
  
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
    }
  }, [labId]);

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
        if (data.lab.scenarios.length > 0) {
          setCurrentScenario(data.lab.scenarios[0]);
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

  const useHint = (hintLevel: number) => {
    if (!usedHints.includes(hintLevel)) {
      setUsedHints([...usedHints, hintLevel]);
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
          {sessionCompletion ? (
            <div className={`mt-4 p-4 rounded-lg border ${
              sessionCompletion.reviewStatus === 'APPROVED' 
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
                  <h4 className={`font-semibold ${
                    sessionCompletion.reviewStatus === 'APPROVED' 
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
                    <span>📝</span> Refleksi Pembelajaran
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    Tuliskan apa yang telah Anda pelajari dari sesi ini. Refleksi ini akan dikirim ke admin untuk direview sebelum Anda dapat melanjutkan ke sesi berikutnya.
                  </p>
                  <textarea
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
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
                        {submitting ? 'Mengirim...' : 'Kirim Refleksi'}
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
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Objectives */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>✅</span> Objektif
              </h2>
              <div className="text-sm text-gray-400">
                {completedObjectives.size}/{currentScenario?.successCriteria?.length || 0} selesai
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{
                    width: `${currentScenario?.successCriteria?.length
                      ? (completedObjectives.size / currentScenario.successCriteria.length) * 100
                      : 0}%`
                  }}
                />
              </div>
            </div>

            {currentScenario?.successCriteria && (
              <div className="space-y-3">
                {currentScenario.successCriteria.map((criteria: any, index: number) => {
                  const isCompleted = completedObjectives.has(index);
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
              </h2>
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                {showHints ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>

            {showHints && currentScenario?.hints && (
              <div className="space-y-3">
                {currentScenario.hints.map((hint: any, index: number) => (
                  <div
                    key={index}
                    className={`rounded-lg p-3 border ${usedHints.includes(hint.level)
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-slate-700/30 border-white/10'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-yellow-400">
                        Petunjuk Level {hint.level}
                      </span>
                      <span className="text-xs text-red-400">-{hint.point_penalty} poin</span>
                    </div>
                    {usedHints.includes(hint.level) ? (
                      <p className="text-sm text-gray-300">{hint.hint_text}</p>
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
    </div>
  );
}
