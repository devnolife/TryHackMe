'use client';

import { useEffect, useState } from 'react';

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
      }
    } catch (error) {
      console.error('Error fetching CTF challenges:', error);
      // Load default challenges for demo
      setChallenges([
        {
          id: 'web-001',
          name: 'Hidden in Plain Sight',
          category: 'Web',
          difficulty: 'easy',
          points: 100,
          description: 'Sometimes the answer is right in front of you. Check the page source!',
          solved: false,
          hintsUsed: 0,
          totalHints: 2,
        },
        {
          id: 'crypto-001',
          name: 'Base64 Basics',
          category: 'Cryptography',
          difficulty: 'easy',
          points: 100,
          description: 'Decode this: Q1RGe2Jhc2U2NF9pc19ub3RfZW5jcnlwdGlvbn0=',
          solved: false,
          hintsUsed: 0,
          totalHints: 2,
        },
        {
          id: 'forensics-001',
          name: 'File Signature',
          category: 'Forensics',
          difficulty: 'medium',
          points: 200,
          description: 'The file extension says .txt but is it really? Check the magic bytes!',
          solved: false,
          hintsUsed: 0,
          totalHints: 3,
        },
        {
          id: 'web-002',
          name: 'Cookie Monster',
          category: 'Web',
          difficulty: 'medium',
          points: 200,
          description: 'Admin panel access is just a cookie away. Can you become admin?',
          solved: false,
          hintsUsed: 0,
          totalHints: 2,
        },
        {
          id: 'crypto-002',
          name: 'Caesar\'s Secret',
          category: 'Cryptography',
          difficulty: 'easy',
          points: 100,
          description: 'Decrypt: FWI{fdhvdu_flskhu_lv_hdvb}',
          solved: false,
          hintsUsed: 0,
          totalHints: 2,
        },
        {
          id: 'reverse-001',
          name: 'String Hunter',
          category: 'Reverse Engineering',
          difficulty: 'medium',
          points: 250,
          description: 'The flag is hidden somewhere in the binary. Use strings wisely!',
          solved: false,
          hintsUsed: 0,
          totalHints: 3,
        },
        {
          id: 'misc-001',
          name: 'Network Traffic',
          category: 'Miscellaneous',
          difficulty: 'hard',
          points: 300,
          description: 'Analyze the PCAP file to find the exfiltrated data.',
          solved: false,
          hintsUsed: 0,
          totalHints: 3,
        },
        {
          id: 'web-003',
          name: 'SQL Injection',
          category: 'Web',
          difficulty: 'hard',
          points: 350,
          description: 'The login form is vulnerable. Can you bypass authentication?',
          solved: false,
          hintsUsed: 0,
          totalHints: 3,
        },
      ]);
      setStats({
        totalChallenges: 8,
        solvedChallenges: 0,
        totalPoints: 1600,
        earnedPoints: 0,
        rank: 1,
      });
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
        setChallenges(challenges.map(c =>
          c.id === selectedChallenge.id
            ? { ...c, solved: true, solvedAt: new Date().toISOString() }
            : c
        ));
        if (stats) {
          setStats({
            ...stats,
            solvedChallenges: stats.solvedChallenges + 1,
            earnedPoints: stats.earnedPoints + selectedChallenge.points,
          });
        }
        setFlagInput('');
      } else {
        setMessage({ type: 'error', text: '❌ Flag salah. Coba lagi!' });
      }
    } catch (error) {
      // Demo mode - check locally
      const correctFlags: Record<string, string> = {
        'web-001': 'CTF{view_source_is_your_friend}',
        'crypto-001': 'CTF{base64_is_not_encryption}',
        'crypto-002': 'CTF{caesar_cipher_is_easy}',
        'forensics-001': 'CTF{magic_bytes_reveal_truth}',
        'web-002': 'CTF{cookies_are_not_secure}',
        'reverse-001': 'CTF{strings_command_ftw}',
        'misc-001': 'CTF{pcap_analysis_master}',
        'web-003': 'CTF{sql_injection_bypassed}',
      };

      if (flagInput === correctFlags[selectedChallenge.id]) {
        setMessage({ type: 'success', text: `🎉 Benar! +${selectedChallenge.points} poin` });
        setChallenges(challenges.map(c =>
          c.id === selectedChallenge.id
            ? { ...c, solved: true, solvedAt: new Date().toISOString() }
            : c
        ));
        if (stats) {
          setStats({
            ...stats,
            solvedChallenges: stats.solvedChallenges + 1,
            earnedPoints: stats.earnedPoints + selectedChallenge.points,
          });
        }
        setFlagInput('');
      } else {
        setMessage({ type: 'error', text: '❌ Flag salah. Coba lagi!' });
      }
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

              {selectedChallenge.solved ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                  <span className="text-3xl mb-2 block">🎉</span>
                  <p className="text-green-400 font-bold">Challenge Solved!</p>
                  <p className="text-gray-400 text-sm mt-1">
                    +{selectedChallenge.points} poin
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
