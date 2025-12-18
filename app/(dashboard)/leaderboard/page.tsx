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
    if (rank === 1) return 'text-yellow-600 font-bold text-xl';
    if (rank === 2) return 'text-gray-500 font-bold text-lg';
    if (rank === 3) return 'text-orange-600 font-bold text-lg';
    return 'text-gray-700 font-medium';
  };

  const isCurrentUser = (studentId: string) => {
    return currentUser?.id === studentId;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600 mt-2">
          See how you rank against your peers
        </p>
      </div>

      {/* Current User Rank Card */}
      {currentUserRank && scope === 'overall' && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Current Rank</h3>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold">{getRankBadge(currentUserRank)}</span>
                <div>
                  <p className="text-2xl font-bold">Rank {currentUserRank}</p>
                  <p className="text-sm text-blue-100">out of {leaderboard.length} students</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100 mb-1">Your Points</p>
              <p className="text-3xl font-bold">
                {leaderboard.find(e => isCurrentUser(e.student.id))?.points || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leaderboard Scope
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overall">Overall Platform</option>
              <option value="session">Specific Session</option>
            </select>
          </div>

          {scope === 'session' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Session
              </label>
              <select
                value={selectedSessionId || ''}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    Session {session.sessionNumber}: {session.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                {scope === 'overall' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commands
                    </th>
                  </>
                )}
                {scope === 'session' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scenarios
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((entry) => (
                <tr
                  key={entry.student.id}
                  className={`${
                    isCurrentUser(entry.student.id)
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getRankColor(entry.rank)}>
                      {getRankBadge(entry.rank)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {entry.student.fullName}
                          {isCurrentUser(entry.student.id) && (
                            <span className="ml-2 text-xs text-blue-600 font-semibold">(You)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.student.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-blue-600">{entry.points}</span>
                  </td>
                  {scope === 'overall' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{entry.completionPercentage}%</span>
                              <span className="text-gray-500">
                                {entry.completedLabs}/{entry.totalLabs}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${entry.completionPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.commandsExecuted}
                      </td>
                    </>
                  )}
                  {scope === 'session' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings yet</h3>
            <p className="text-gray-500">
              Complete labs and earn points to appear on the leaderboard
            </p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Improve Your Rank</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Complete all lab scenarios to earn maximum points</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Execute correct commands on first try for bonus points</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use fewer hints to avoid point penalties</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Practice regularly to maintain your competitive edge</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Complete labs quickly to earn time-based bonuses</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
