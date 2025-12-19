'use client';

import { useEffect, useState } from 'react';

interface Student {
  id: string;
  fullName: string;
  studentId: string;
  department: string | null;
}

interface LeaderboardEntry {
  rank: number;
  student: Student;
  points: number;
  completedLabs?: number;
  totalLabs?: number;
  completionPercentage?: number;
  commandsExecuted?: number;
  completedScenarios?: number;
  totalScenarios?: number;
}

interface Session {
  id: string;
  sessionNumber: number;
  title: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'overall' | 'session'>('overall');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchSessions();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [scope, selectedSessionId]);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/labs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSessions(data.labs);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        scope,
        limit: '100',
      });

      if (scope === 'session' && selectedSessionId) {
        params.append('sessionId', selectedSessionId);
      }

      const response = await fetch(`/api/leaderboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
        if (data.currentUserRank) {
          setCurrentUserRank(data.currentUserRank);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 font-bold text-xl';
    if (rank === 2) return 'text-gray-300 font-bold text-lg';
    if (rank === 3) return 'text-orange-400 font-bold text-lg';
    return 'text-gray-400 font-medium';
  };

  const isCurrentUser = (studentId: string) => {
    return currentUser?.id === studentId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-300 text-lg">Memuat papan peringkat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            Papan Peringkat
          </h1>
          <p className="text-gray-400 mt-2">
            Lihat peringkat Anda dibandingkan dengan peserta lain
          </p>
        </div>

        {/* Current User Rank Card */}
        {currentUserRank && scope === 'overall' && (
          <div className="bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl p-6 mb-8 shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white/90 mb-2">Peringkat Anda Saat Ini</h3>
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-bold">{getRankBadge(currentUserRank)}</span>
                  <div>
                    <p className="text-2xl font-bold text-white">Peringkat {currentUserRank}</p>
                    <p className="text-sm text-white/70">dari {leaderboard.length} mahasiswa</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/70 mb-1">Poin Anda</p>
                <p className="text-4xl font-bold text-white">
                  {leaderboard.find(e => isCurrentUser(e.student.id))?.points || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cakupan Peringkat
              </label>
              <select
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value as 'overall' | 'session');
                  if (e.target.value === 'overall') {
                    setSelectedSessionId(null);
                  } else if (sessions.length > 0 && !selectedSessionId) {
                    setSelectedSessionId(sessions[0].id);
                  }
                }}
                className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="overall">Keseluruhan Platform</option>
                <option value="session">Sesi Tertentu</option>
              </select>
            </div>

            {scope === 'session' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pilih Sesi
                </label>
                <select
                  value={selectedSessionId || ''}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      Sesi {session.sessionNumber}: {session.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Peringkat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Mahasiswa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    NIM
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Jurusan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Poin
                  </th>
                  {scope === 'overall' && (
                    <>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Penyelesaian
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Perintah
                      </th>
                    </>
                  )}
                  {scope === 'session' && (
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Skenario
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.student.id}
                    className={`${isCurrentUser(entry.student.id)
                        ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                        : 'hover:bg-white/5'
                      } transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getRankColor(entry.rank)}>
                        {getRankBadge(entry.rank)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {entry.student.fullName}
                            {isCurrentUser(entry.student.id) && (
                              <span className="ml-2 text-xs text-cyan-400 font-semibold">(Anda)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {entry.student.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {entry.student.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-cyan-400">{entry.points}</span>
                    </td>
                    {scope === 'overall' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-32">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-cyan-400">{entry.completionPercentage}%</span>
                                <span className="text-gray-500">
                                  {entry.completedLabs}/{entry.totalLabs}
                                </span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                                  style={{ width: `${entry.completionPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {entry.commandsExecuted}
                        </td>
                      </>
                    )}
                    {scope === 'session' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {entry.completedScenarios}/{entry.totalScenarios}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">Belum ada peringkat</h3>
              <p className="text-gray-400">
                Selesaikan lab dan kumpulkan poin untuk muncul di papan peringkat
              </p>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Tips Meningkatkan Peringkat
          </h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start">
              <span className="mr-3 text-cyan-500">•</span>
              <span>Selesaikan semua skenario lab untuk mendapatkan poin maksimal</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-cyan-500">•</span>
              <span>Eksekusi perintah dengan benar pada percobaan pertama untuk bonus poin</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-cyan-500">•</span>
              <span>Gunakan lebih sedikit petunjuk untuk menghindari pengurangan poin</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-cyan-500">•</span>
              <span>Berlatih secara rutin untuk mempertahankan keunggulan kompetitif Anda</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-cyan-500">•</span>
              <span>Selesaikan lab dengan cepat untuk mendapatkan bonus waktu</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
