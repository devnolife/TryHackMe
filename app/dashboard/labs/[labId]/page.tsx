'use client';

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (labId) {
      fetchLabDetails();
    }
  }, [labId]);

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

  const handleCommandExecute = async (command: string): Promise<string> => {
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
        return data.output;
      } else {
        return `Error: ${data.error || 'Eksekusi perintah gagal'}`;
      }
    } catch (error) {
      console.error('Error executing command:', error);
      return 'Error: Gagal mengeksekusi perintah';
    }
  };

  const useHint = (hintLevel: number) => {
    if (!usedHints.includes(hintLevel)) {
      setUsedHints([...usedHints, hintLevel]);
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
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>✅</span> Objektif
            </h2>

            {currentScenario?.successCriteria && (
              <div className="space-y-3">
                {currentScenario.successCriteria.map((criteria: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 bg-slate-700/30 rounded-lg p-3">
                    <div className="w-6 h-6 rounded border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gray-500 text-xs">○</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{criteria.description}</div>
                      <div className="text-xs text-cyan-400 mt-1">+{criteria.points} poin</div>
                    </div>
                  </div>
                ))}
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
