'use client';

import { useEffect, useState } from 'react';

interface CTFHint {
  id: number;
  text: string;
  cost: number;
}

interface Challenge {
  id: string;
  name: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  description: string;
  solved: boolean;
  solvedAt?: string;
  hintsUsed: number;
  totalHints: number;
  // Admin only fields
  flag?: string;
  hints?: CTFHint[];
}

interface CTFStats {
  totalChallenges: number;
  solvedChallenges: number;
  totalPoints: number;
  earnedPoints: number;
  rank: number;
}

export default function CTFPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<CTFStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [flagInput, setFlagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/ctf/challenges', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setChallenges(data.challenges);
        setStats(data.stats);
        setIsAdmin(data.isAdmin || false);
        setError(null);
      } else {
        setError(data.error || 'Gagal memuat challenges');
      }
    } catch (error) {
      console.error('Error fetching CTF challenges:', error);
      setError('Gagal memuat CTF challenges. Silakan refresh halaman atau hubungi admin.');
    } finally {
      setLoading(false);
    }
  };

  const submitFlag = async () => {
    if (!selectedChallenge || !flagInput.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/ctf/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          flag: flagInput,
        }),
      });

      const data = await response.json();

      if (data.success && data.correct) {
        setMessage({ type: 'success', text: `🎉 Benar! +${selectedChallenge.points} poin` });
        setFlagInput('');
        // Refetch challenges to get updated data from database
        await fetchChallenges();
      } else {
        setMessage({ type: 'error', text: '❌ Flag salah. Coba lagi!' });
      }
    } catch (error) {
      console.error('Error submitting flag:', error);
      setMessage({ type: 'error', text: '❌ Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyInfo = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return { label: 'Mudah', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
      case 'medium':
        return { label: 'Sedang', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
      case 'hard':
        return { label: 'Sulit', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      default:
        return { label: difficulty, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Web':
        return '🌐';
      case 'Cryptography':
        return '🔐';
      case 'Forensics':
        return '🔍';
      case 'Reverse Engineering':
        return '⚙️';
      case 'Miscellaneous':
        return '🎲';
      default:
        return '🏴';
    }
  };

  const filteredChallenges = filter === 'all'
    ? challenges
    : filter === 'solved'
      ? challenges.filter(c => c.solved)
      : filter === 'unsolved'
        ? challenges.filter(c => !c.solved)
        : challenges.filter(c => c.category === filter);

  const categories = Array.from(new Set(challenges.map(c => c.category)));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span>🏴</span> CTF Challenges
          </h1>
          <p className="text-gray-400">
            Capture The Flag - Selesaikan tantangan dan temukan flag tersembunyi
          </p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <span className="text-4xl mb-3 block">⚠️</span>
          <p className="text-red-400 font-bold mb-2">Error</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchChallenges();
            }}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-purple-600 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-white/10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span>🏴</span> CTF Challenges
        </h1>
        <p className="text-gray-400">
          Capture The Flag - Selesaikan tantangan dan temukan flag tersembunyi
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.solvedChallenges}/{stats.totalChallenges}
                </div>
                <div className="text-sm text-gray-400">Challenges Solved</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.earnedPoints}
                </div>
                <div className="text-sm text-gray-400">Total Poin</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.round((stats.solvedChallenges / stats.totalChallenges) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Completion</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">#{stats.rank}</div>
                <div className="text-sm text-gray-400">Peringkat</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all'
            ? 'bg-cyan-500 text-white'
            : 'bg-slate-800/50 text-gray-400 hover:text-white border border-white/10'
            }`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter('unsolved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'unsolved'
            ? 'bg-cyan-500 text-white'
            : 'bg-slate-800/50 text-gray-400 hover:text-white border border-white/10'
            }`}
        >
          Belum Selesai
        </button>
        <button
          onClick={() => setFilter('solved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'solved'
            ? 'bg-cyan-500 text-white'
            : 'bg-slate-800/50 text-gray-400 hover:text-white border border-white/10'
            }`}
        >
          Selesai
        </button>
        <div className="w-px bg-white/10 mx-2"></div>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === category
              ? 'bg-purple-500 text-white'
              : 'bg-slate-800/50 text-gray-400 hover:text-white border border-white/10'
              }`}
          >
            {getCategoryIcon(category)} {category}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChallenges.map((challenge) => {
          const diffInfo = getDifficultyInfo(challenge.difficulty);
          return (
            <div
              key={challenge.id}
              onClick={() => {
                setSelectedChallenge(challenge);
                setMessage(null);
                setFlagInput('');
              }}
              className={`bg-slate-800/50 rounded-xl p-5 border cursor-pointer transition-all hover:scale-[1.02] ${challenge.solved
                ? 'border-green-500/50 bg-green-500/5'
                : selectedChallenge?.id === challenge.id
                  ? 'border-cyan-500/50 bg-cyan-500/5'
                  : 'border-white/10 hover:border-cyan-500/30'
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${diffInfo.color}`}>
                    {diffInfo.label}
                  </span>
                </div>
                <div className="text-lg font-bold text-cyan-400">
                  {challenge.points} pts
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{challenge.name}</h3>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{challenge.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{challenge.category}</span>
                {challenge.solved ? (
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <span>✓</span> Solved
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">
                    Hints: {challenge.hintsUsed}/{challenge.totalHints}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Challenge Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getCategoryIcon(selectedChallenge.category)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyInfo(selectedChallenge.difficulty).color}`}>
                      {getDifficultyInfo(selectedChallenge.difficulty).label}
                    </span>
                    <span className="text-cyan-400 font-bold">{selectedChallenge.points} pts</span>
                    {isAdmin && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Admin View
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{selectedChallenge.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 mb-4">
                <p className="text-gray-300">{selectedChallenge.description}</p>
              </div>

              {/* Admin Answer Section */}
              {isAdmin && selectedChallenge.flag && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <span>🔑</span> Jawaban (Admin Only)
                  </h4>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <code className="text-green-400 font-mono text-sm break-all">
                      {selectedChallenge.flag}
                    </code>
                  </div>

                  {/* Show all hints for admin */}
                  {selectedChallenge.hints && selectedChallenge.hints.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-xs font-semibold text-purple-400 mb-2">Semua Hints:</h5>
                      <div className="space-y-2">
                        {selectedChallenge.hints.map((hint, index) => (
                          <div key={index} className="bg-slate-900/50 rounded-lg p-2 text-sm">
                            <span className="text-yellow-400">💡 Hint {index + 1}:</span>
                            <span className="text-gray-300 ml-2">{hint.text}</span>
                            <span className="text-gray-500 ml-2">(-{hint.cost} pts)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedChallenge.solved && !isAdmin ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                  <span className="text-3xl mb-2 block">🎉</span>
                  <p className="text-green-400 font-bold">Challenge Solved!</p>
                  <p className="text-gray-400 text-sm mt-1">
                    +{selectedChallenge.points} poin
                  </p>
                </div>
              ) : isAdmin ? (
                <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                  <span className="text-3xl mb-2 block">👀</span>
                  <p className="text-purple-400 font-bold">Mode Admin</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Anda dapat melihat semua jawaban tanpa perlu submit
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {message && (
                    <div className={`p-4 rounded-xl ${message.type === 'success'
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                      : 'bg-red-500/20 border border-red-500/30 text-red-400'
                      }`}>
                      {message.text}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Submit Flag
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={flagInput}
                        onChange={(e) => setFlagInput(e.target.value)}
                        placeholder="CTF{...}"
                        className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono"
                        onKeyDown={(e) => e.key === 'Enter' && submitFlag()}
                      />
                      <button
                        onClick={submitFlag}
                        disabled={submitting || !flagInput.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-600 hover:to-purple-600 transition"
                      >
                        {submitting ? '...' : 'Submit'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <button className="text-gray-400 hover:text-cyan-400 transition">
                      💡 Gunakan Hint ({selectedChallenge.hintsUsed}/{selectedChallenge.totalHints})
                    </button>
                    <span className="text-gray-500">
                      Kategori: {selectedChallenge.category}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
