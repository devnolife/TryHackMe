'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TerminalEmulator = dynamic(() => import('@/components/terminal/TerminalEmulator'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-slate-900 rounded-xl border border-white/10">
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
  const materiRef = useRef<HTMLDivElement>(null);

  // Core states
  const [lab, setLab] = useState<Lab | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Learning progress states
  const [materiRead, setMateriRead] = useState(false);
  const [materiScrollProgress, setMateriScrollProgress] = useState(0);
  const [completedObjectives, setCompletedObjectives] = useState<Set<number>>(new Set());
  const [totalPoints, setTotalPoints] = useState(0);
  const [allComplete, setAllComplete] = useState(false);

  // Hints states
  const [showHints, setShowHints] = useState(false);
  const [usedHints, setUsedHints] = useState<number[]>([]);
  const [availableHints, setAvailableHints] = useState<Array<{ level: number; text: string | null; penalty: number; isUsed: boolean }>>([]);
  const [hintPenalty, setHintPenalty] = useState(0);

  // UI states
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [activeLeftTab, setActiveLeftTab] = useState<'materi' | 'objectives' | 'hints'>('materi');
  const [showTargetInfo, setShowTargetInfo] = useState(true);
  const [mobileView, setMobileView] = useState<'materi' | 'terminal'>('materi');
  const [isMobile, setIsMobile] = useState(false);

  // Session completion states
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sessionCompletion, setSessionCompletion] = useState<{
    id: string;
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewerFeedback?: string;
  } | null>(null);

  // Effects
  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (labId) {
      fetchLabDetails();
      fetchCompletionStatus();
      fetchMateriReadStatus();

      const intervalId = setInterval(() => {
        fetchCompletionStatus();
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [labId]);

  // Track materi scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (materiRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = materiRef.current;
        const progress = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
        setMateriScrollProgress(Math.min(progress, 100));

        // Auto mark as read when scrolled to 90%
        if (progress >= 90 && !materiRead) {
          markMateriAsRead();
        }
      }
    };

    const container = materiRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [materiRead]);

  // API Functions
  const fetchMateriReadStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/labs/${labId}/materi-read`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setMateriRead(data.materiRead);
      }
    } catch (error) {
      console.error('Error fetching materi read status:', error);
    }
  };

  const markMateriAsRead = async () => {
    if (materiRead) return;
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
        showNotification('✅ Materi selesai dibaca! Terminal sudah dibuka.', 'success');
        // Auto switch to terminal on mobile after reading materi
        if (isMobile) {
          setMobileView('terminal');
        }
        // Switch to objectives tab on desktop
        setActiveLeftTab('objectives');
      }
    } catch (error) {
      console.error('Error marking materi as read:', error);
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
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setLab(data.lab);
        setIsAdmin(data.isAdmin || false);
        if (data.isAdmin) {
          setMateriRead(true);
          setAllComplete(true);
        }
        if (data.lab.scenarios.length > 0) {
          const firstScenario = data.lab.scenarios[0];
          setCurrentScenario(firstScenario);
          fetchHints(firstScenario.id);
        }
      }
    } catch (error) {
      console.error('Error fetching lab details:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleCommandExecute = async (command: string): Promise<{ output: string; currentDirectory?: string; completions?: string[] }> => {
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
        if (data.completedObjectives && data.completedObjectives.length > 0) {
          data.completedObjectives.forEach((obj: { description: string; points: number }) => {
            const criteriaList = currentScenario?.successCriteria || [];
            const objIndex = criteriaList.findIndex((c: any) => c.description === obj.description);
            if (objIndex >= 0 && !completedObjectives.has(objIndex)) {
              setCompletedObjectives(prev => new Set(Array.from(prev).concat([objIndex])));
              setTotalPoints(prev => prev + obj.points);
              showNotification(`🎯 Objektif Tercapai: ${obj.description} (+${obj.points} poin)`, 'success');
            }
          });
        }

        if (data.allObjectivesCompleted && !allComplete) {
          const criteriaList = currentScenario?.successCriteria || [];
          if (completedObjectives.size >= criteriaList.length - 1) {
            setAllComplete(true);
            setTimeout(() => {
              showNotification('🎉 Selamat! Semua objektif telah diselesaikan!', 'success');
            }, 1000);
          }
        }

        if (data.pointsAwarded > 0 && data.isValidForScenario) {
          showNotification(`✅ Perintah benar! +${data.pointsAwarded} poin`, 'success');
        }

        return { output: data.output, currentDirectory: data.currentDirectory };
      } else {
        return { output: `Error: ${data.error || 'Eksekusi perintah gagal'}` };
      }
    } catch (error) {
      console.error('Error executing command:', error);
      return { output: 'Error: Gagal mengeksekusi perintah' };
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
        showNotification('✅ Refleksi berhasil dikirim!', 'success');
      } else {
        showNotification(data.error || 'Gagal mengirim refleksi', 'warning');
      }
    } catch (error) {
      console.error('Error submitting reflection:', error);
      showNotification('Terjadi kesalahan', 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'text-green-400 bg-green-500/20';
      case 'INTERMEDIATE': return 'text-yellow-400 bg-yellow-500/20';
      case 'ADVANCED': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getProgressPercentage = () => {
    if (!currentScenario?.successCriteria?.length) return 0;
    return Math.round((completedObjectives.size / currentScenario.successCriteria.length) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Memuat Lab...</p>
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Lab tidak ditemukan</p>
          <Link href="/dashboard/labs" className="text-cyan-400 hover:underline">
            ← Kembali ke daftar lab
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl animate-slide-in-right ${notification.type === 'success' ? 'bg-green-500/90 text-white' :
          notification.type === 'warning' ? 'bg-yellow-500/90 text-black' :
            'bg-blue-500/90 text-white'
          }`}>
          {notification.message}
        </div>
      )}

      {/* Top Header Bar */}
      <header className="flex-shrink-0 bg-slate-800/80 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back & Lab Info */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/labs"
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
            >
              <span className="text-gray-400">←</span>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono text-sm">Session {lab.sessionNumber}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(lab.difficultyLevel)}`}>
                  {lab.difficultyLevel}
                </span>
                {isAdmin && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                    Admin
                  </span>
                )}
              </div>
              <h1 className="text-white font-bold text-lg">{lab.title}</h1>
            </div>
          </div>

          {/* Center: Progress */}
          <div className="hidden md:flex items-center gap-6">
            {/* Materi Progress */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${materiRead ? 'bg-green-500' : 'bg-slate-700'
                }`}>
                {materiRead ? '✓' : '📚'}
              </div>
              <div className="text-sm">
                <div className="text-gray-400">Materi</div>
                <div className={materiRead ? 'text-green-400' : 'text-gray-500'}>
                  {materiRead ? 'Selesai' : `${materiScrollProgress}%`}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <span className="text-gray-600">→</span>

            {/* Praktikum Progress */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${allComplete ? 'bg-green-500' : completedObjectives.size > 0 ? 'bg-yellow-500' : 'bg-slate-700'
                }`}>
                {allComplete ? '✓' : '💻'}
              </div>
              <div className="text-sm">
                <div className="text-gray-400">Praktikum</div>
                <div className={allComplete ? 'text-green-400' : 'text-gray-500'}>
                  {completedObjectives.size}/{currentScenario?.successCriteria?.length || 0}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <span className="text-gray-600">→</span>

            {/* Submit Status */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sessionCompletion?.reviewStatus === 'APPROVED' ? 'bg-green-500' :
                sessionCompletion?.reviewStatus === 'PENDING' ? 'bg-yellow-500' :
                  sessionCompletion?.reviewStatus === 'REJECTED' ? 'bg-red-500' :
                    'bg-slate-700'
                }`}>
                {sessionCompletion?.reviewStatus === 'APPROVED' ? '✓' :
                  sessionCompletion?.reviewStatus === 'PENDING' ? '⏳' :
                    sessionCompletion?.reviewStatus === 'REJECTED' ? '✗' : '📝'}
              </div>
              <div className="text-sm">
                <div className="text-gray-400">Submit</div>
                <div className={
                  sessionCompletion?.reviewStatus === 'APPROVED' ? 'text-green-400' :
                    sessionCompletion?.reviewStatus === 'PENDING' ? 'text-yellow-400' :
                      sessionCompletion?.reviewStatus === 'REJECTED' ? 'text-red-400' :
                        'text-gray-500'
                }>
                  {sessionCompletion?.reviewStatus || 'Belum'}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Points */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-400">Poin</div>
              <div className="text-xl font-bold text-cyan-400">{totalPoints}</div>
            </div>
            {hintPenalty > 0 && (
              <div className="text-right">
                <div className="text-xs text-gray-400">Penalti</div>
                <div className="text-lg font-bold text-red-400">-{hintPenalty}</div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      {isMobile && (
        <div className="lg:hidden flex-shrink-0 flex bg-slate-800/50 border-b border-white/10">
          <button
            onClick={() => setMobileView('materi')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mobileView === 'materi'
              ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500'
              : 'text-gray-400'
              }`}
          >
            <span>📚</span> Materi
          </button>
          <button
            onClick={() => setMobileView('terminal')}
            disabled={!materiRead}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${mobileView === 'terminal'
              ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500'
              : 'text-gray-400'
              } ${!materiRead ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>💻</span> Terminal {!materiRead && '🔒'}
          </button>
        </div>
      )}

      {/* Main Content Area - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Materi & Objectives */}
        <div
          className={`flex flex-col border-r border-white/10 bg-slate-800/30 ${isMobile ? (mobileView === 'materi' ? 'flex w-full' : 'hidden') : ''
            }`}
          style={!isMobile ? { width: `${leftPanelWidth}%` } : undefined}
        >
          {/* Left Panel Tabs */}
          <div className="flex-shrink-0 flex border-b border-white/10">
            <button
              onClick={() => setActiveLeftTab('materi')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeLeftTab === 'materi'
                ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <span>📚</span> Materi
              {!materiRead && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
            </button>
            <button
              onClick={() => setActiveLeftTab('objectives')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeLeftTab === 'objectives'
                ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <span>🎯</span> Objektif
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">
                {completedObjectives.size}/{currentScenario?.successCriteria?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveLeftTab('hints')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeLeftTab === 'hints'
                ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <span>💡</span> Petunjuk
              {usedHints.length > 0 && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                  {usedHints.length}
                </span>
              )}
            </button>
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 overflow-hidden">
            {/* Materi Tab */}
            {activeLeftTab === 'materi' && (
              <div ref={materiRef} className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Materi Progress Bar */}
                <div className="sticky top-0 bg-slate-800/90 backdrop-blur-sm -mx-6 -mt-6 px-6 py-3 border-b border-white/10 z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progress Membaca</span>
                    <span className="text-sm text-cyan-400">{materiScrollProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${materiScrollProgress}%` }}
                    />
                  </div>
                </div>

                {/* Theory Content */}
                {lab.theoryContent ? (
                  <div className="theory-content prose prose-invert prose-cyan max-w-none prose-headings:scroll-mt-20 prose-h1:text-2xl prose-h1:font-bold prose-h1:text-transparent prose-h1:bg-clip-text prose-h1:bg-gradient-to-r prose-h1:from-cyan-400 prose-h1:to-purple-400 prose-h1:border-b prose-h1:border-cyan-500/30 prose-h1:pb-3 prose-h1:mb-6 prose-h2:text-xl prose-h2:font-semibold prose-h2:text-cyan-400 prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:font-medium prose-h3:text-purple-300 prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4 prose-li:text-gray-300 prose-li:marker:text-cyan-500 prose-ul:space-y-2 prose-ul:pl-6 prose-ol:space-y-2 prose-ol:pl-6 prose-strong:text-white prose-strong:font-semibold prose-em:text-purple-300 prose-code:text-cyan-400 prose-code:bg-cyan-500/10 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:border prose-code:border-cyan-500/20 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-500/5 prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-cyan-300 prose-table:border-collapse prose-table:w-full prose-th:bg-slate-700/50 prose-th:text-left prose-th:p-3 prose-th:text-gray-200 prose-th:font-semibold prose-th:border prose-th:border-white/10 prose-td:p-3 prose-td:border prose-td:border-white/10 prose-td:text-gray-300 prose-hr:border-white/10 prose-hr:my-8 prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {lab.theoryContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Tidak ada materi teori untuk lab ini.</p>
                  </div>
                )}

                {/* Key Commands Section */}
                {lab.keyCommands && lab.keyCommands.length > 0 && (
                  <div className="bg-slate-700/30 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span>⌨️</span> Perintah Penting
                    </h3>
                    <div className="space-y-3">
                      {lab.keyCommands.map((cmd, idx) => (
                        <div key={idx} className="bg-slate-800/50 rounded-lg p-4">
                          <code className="text-cyan-400 font-mono text-sm">{cmd.command}</code>
                          <p className="text-gray-400 text-sm mt-1">{cmd.description}</p>
                          {cmd.example && (
                            <p className="text-gray-500 text-xs mt-1">
                              Contoh: <code className="text-green-400">{cmd.example}</code>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources Section */}
                {lab.resources && lab.resources.length > 0 && (
                  <div className="bg-slate-700/30 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span>🔗</span> Referensi
                    </h3>
                    <div className="grid gap-2">
                      {lab.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors group"
                        >
                          <span className="text-lg">
                            {resource.type === 'documentation' ? '📖' :
                              resource.type === 'tool' ? '🛠️' :
                                resource.type === 'course' ? '🎓' : '🔗'}
                          </span>
                          <span className="text-gray-300 group-hover:text-cyan-400 transition-colors">
                            {resource.title}
                          </span>
                          <span className="ml-auto text-gray-600 group-hover:text-gray-400">→</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mark as Read Button */}
                {!materiRead && (
                  <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent -mx-6 -mb-6 px-6 py-6">
                    <button
                      onClick={markMateriAsRead}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <span>✓</span>
                      <span>Saya Sudah Membaca Materi</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Objectives Tab */}
            {activeLeftTab === 'objectives' && (
              <div className="h-full overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {/* Scenario Info */}
                {currentScenario && (
                  <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/20">
                    <h3 className="font-bold text-white mb-2">{currentScenario.scenarioTitle}</h3>
                    <p className="text-sm text-gray-400">{currentScenario.scenarioDescription}</p>
                  </div>
                )}

                {/* Target Info */}
                {currentScenario?.targetInfo && (
                  <div className="bg-slate-700/30 rounded-xl border border-white/10">
                    <button
                      onClick={() => setShowTargetInfo(!showTargetInfo)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left"
                    >
                      <span className="font-medium text-white flex items-center gap-2">
                        <span>🎯</span> Target Info
                      </span>
                      <span className="text-gray-400">{showTargetInfo ? '▼' : '▶'}</span>
                    </button>
                    {showTargetInfo && (
                      <div className="px-4 pb-4 space-y-2 text-sm">
                        {currentScenario.targetInfo.company && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Perusahaan:</span>
                            <span className="text-cyan-400">{currentScenario.targetInfo.company}</span>
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
                        {currentScenario.targetInfo.services && (
                          <div className="pt-2 border-t border-white/10">
                            <span className="text-gray-400 block mb-2">Layanan:</span>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(currentScenario.targetInfo.services) ? (
                                currentScenario.targetInfo.services.map((svc: string, i: number) => (
                                  <span key={i} className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                                    {svc}
                                  </span>
                                ))
                              ) : (
                                Object.keys(currentScenario.targetInfo.services).map((svc, i) => (
                                  <span key={i} className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                                    {svc}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="bg-slate-700/30 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progress Praktikum</span>
                    <span className="text-sm text-cyan-400">{getProgressPercentage()}%</span>
                  </div>
                  <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>

                {/* Objectives List */}
                <div className="space-y-3">
                  {currentScenario?.successCriteria?.map((criteria: any, index: number) => {
                    const isCompleted = isAdmin || completedObjectives.has(index);
                    return (
                      <div
                        key={index}
                        className={`rounded-xl p-4 border transition-all ${isCompleted
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-slate-700/30 border-white/10'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-green-500 text-white' : 'border-2 border-gray-600'
                            }`}>
                            {isCompleted ? '✓' : <span className="text-gray-500 text-sm">{index + 1}</span>}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm ${isCompleted ? 'text-green-300 line-through' : 'text-white'}`}>
                              {criteria.description}
                            </p>
                            <p className={`text-xs mt-1 ${isCompleted ? 'text-green-400' : 'text-cyan-400'}`}>
                              {isCompleted ? '✓ Selesai' : `+${criteria.points} poin`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Completion Form */}
                {allComplete && !sessionCompletion && (
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                      <span>🎉</span> Selamat! Semua Objektif Selesai
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Tulis refleksi pembelajaran Anda untuk menyelesaikan sesi ini.
                    </p>
                    <textarea
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      placeholder="Apa yang Anda pelajari dari sesi ini? (min. 50 karakter)"
                      className="w-full h-32 bg-slate-800/50 rounded-lg p-3 text-white text-sm border border-white/10 focus:border-green-500/50 focus:outline-none resize-none"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">{reflectionText.length}/50 karakter</span>
                      <button
                        onClick={submitReflection}
                        disabled={submitting || reflectionText.length < 50}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? 'Mengirim...' : 'Kirim Refleksi'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Session Status */}
                {sessionCompletion && (
                  <div className={`rounded-xl p-4 border ${sessionCompletion.reviewStatus === 'APPROVED'
                    ? 'bg-green-500/10 border-green-500/30'
                    : sessionCompletion.reviewStatus === 'PENDING'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {sessionCompletion.reviewStatus === 'APPROVED' ? '✅' :
                          sessionCompletion.reviewStatus === 'PENDING' ? '⏳' : '❌'}
                      </span>
                      <span className="font-medium text-white">
                        Status: {sessionCompletion.reviewStatus}
                      </span>
                    </div>
                    {sessionCompletion.reviewerFeedback && (
                      <p className="text-sm text-gray-400">
                        Feedback: {sessionCompletion.reviewerFeedback}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Hints Tab */}
            {activeLeftTab === 'hints' && (
              <div className="h-full overflow-y-auto p-6 space-y-4 custom-scrollbar">
                <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                  <p className="text-sm text-yellow-400">
                    ⚠️ Menggunakan petunjuk akan mengurangi poin Anda. Gunakan hanya jika benar-benar diperlukan.
                  </p>
                </div>

                {availableHints.length > 0 ? (
                  <div className="space-y-3">
                    {availableHints.map((hint, index) => (
                      <div
                        key={index}
                        className={`rounded-xl p-4 border ${hint.isUsed
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : 'bg-slate-700/30 border-white/10'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-yellow-400">
                            Petunjuk Level {hint.level}
                          </span>
                          <span className="text-xs text-red-400">-{hint.penalty} poin</span>
                        </div>
                        {hint.isUsed && hint.text ? (
                          <p className="text-sm text-gray-300">{hint.text}</p>
                        ) : (
                          <button
                            onClick={() => useHint(hint.level)}
                            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            🔓 Klik untuk membuka petunjuk
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Tidak ada petunjuk tersedia.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resizer - Hidden on mobile */}
        {!isMobile && (
          <div
            className="w-1 bg-slate-700 hover:bg-cyan-500 cursor-col-resize transition-colors flex-shrink-0 hidden lg:block"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = leftPanelWidth;

              const onMouseMove = (e: MouseEvent) => {
                const delta = e.clientX - startX;
                const newWidth = Math.min(Math.max(startWidth + (delta / window.innerWidth) * 100, 25), 75);
                setLeftPanelWidth(newWidth);
              };

              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />
        )}

        {/* Right Panel - Terminal */}
        <div className={`flex-1 flex flex-col bg-slate-900/50 min-w-0 ${isMobile ? (mobileView === 'terminal' ? 'flex' : 'hidden') : ''}`}>
          {/* Terminal Content - Full Height */}
          <div className="flex-1 min-h-0 h-full">
            {!materiRead && (
              <div className="absolute top-2 right-2 z-10">
                <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded backdrop-blur">
                  📚 Baca materi terlebih dahulu
                </span>
              </div>
            )}
            {materiRead ? (
              <TerminalEmulator
                onCommandExecute={handleCommandExecute}
                labTitle={lab?.title}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <span className="text-4xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Terminal Terkunci</h3>
                  <p className="text-gray-400 mb-4 max-w-md">
                    Baca materi di panel kiri terlebih dahulu untuk membuka terminal praktikum.
                  </p>
                  <button
                    onClick={() => setActiveLeftTab('materi')}
                    className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
                  >
                    📚 Baca Materi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
