'use client';

import { useEffect, useState } from 'react';

interface Objective {
  id: string;
  description: string;
  commandPattern: string;
  expectedOutputKeyword: string;
  points: number;
  hint: string;
}

interface ValidCommand {
  id: string;
  pattern: string;
  description: string;
  expectedOutput: string;
  category: string;
}

interface ScenarioHint {
  level: number;
  text: string;
  pointPenalty: number;
}

interface Scenario {
  scenarioId: string;
  scenarioTitle: string;
  scenarioDescription: string;
  objectives: Objective[];
  validCommands: ValidCommand[];
  hints: ScenarioHint[];
  maxPoints: number;
}

interface LabAnswerKey {
  labId: string;
  sessionNumber: number;
  title: string;
  description: string;
  difficulty: string;
  scenarios: Scenario[];
}

interface CTFHint {
  id: string;
  content: string;
  cost: number;
  order: number;
}

interface CTFAnswerKey {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  flag: string;
  hints: CTFHint[];
  isActive: boolean;
}

interface Stats {
  totalLabs: number;
  totalScenarios: number;
  totalObjectives: number;
  totalCtfChallenges: number;
  totalCtfPoints: number;
}

export default function AdminAnswersPage() {
  const [activeTab, setActiveTab] = useState<'lab' | 'ctf'>('lab');
  const [labAnswerKeys, setLabAnswerKeys] = useState<LabAnswerKey[]>([]);
  const [ctfAnswerKeys, setCtfAnswerKeys] = useState<CTFAnswerKey[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLab, setExpandedLab] = useState<string | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [expandedCtf, setExpandedCtf] = useState<string | null>(null);

  useEffect(() => {
    fetchAnswerKeys();
  }, []);

  const fetchAnswerKeys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/answers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch answer keys');
      }

      const data = await response.json();
      setLabAnswerKeys(data.labAnswerKeys || []);
      setCtfAnswerKeys(data.ctfAnswerKeys || []);
      setStats(data.stats || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLabs = labAnswerKeys.filter(lab =>
    lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.scenarios.some(s =>
      s.scenarioTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.objectives.some(o => o.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const filteredCtf = ctfAnswerKeys.filter(ctf =>
    ctf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ctf.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ctf.flag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'CRYPTOGRAPHY': 'bg-purple-500/20 text-purple-400',
      'WEB_EXPLOITATION': 'bg-orange-500/20 text-orange-400',
      'REVERSE_ENGINEERING': 'bg-red-500/20 text-red-400',
      'FORENSICS': 'bg-blue-500/20 text-blue-400',
      'BINARY_EXPLOITATION': 'bg-pink-500/20 text-pink-400',
      'OSINT': 'bg-green-500/20 text-green-400',
      'NETWORKING': 'bg-cyan-500/20 text-cyan-400',
      'MISCELLANEOUS': 'bg-gray-500/20 text-gray-400',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'EASY': 'text-green-400',
      'BEGINNER': 'text-green-400',
      'MEDIUM': 'text-yellow-400',
      'INTERMEDIATE': 'text-yellow-400',
      'HARD': 'text-orange-400',
      'ADVANCED': 'text-orange-400',
      'EXPERT': 'text-red-400',
    };
    return colors[difficulty] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🔑 Kunci Jawaban
          </h1>
          <p className="text-gray-400">Semua kunci jawaban untuk Lab dan CTF</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-cyan-400">{stats.totalLabs}</div>
            <div className="text-sm text-gray-400">Total Lab</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-purple-400">{stats.totalScenarios}</div>
            <div className="text-sm text-gray-400">Total Skenario</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-yellow-400">{stats.totalObjectives}</div>
            <div className="text-sm text-gray-400">Total Objektif</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-green-400">{stats.totalCtfChallenges}</div>
            <div className="text-sm text-gray-400">Total CTF</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-orange-400">{stats.totalCtfPoints}</div>
            <div className="text-sm text-gray-400">Total Poin CTF</div>
          </div>
        </div>
      )}

      {/* Search and Tabs */}
      <div className="bg-slate-800/50 rounded-xl border border-white/10">
        <div className="p-4 border-b border-white/10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('lab')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'lab'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-gray-400 hover:text-white'
                  }`}
              >
                🧪 Lab ({filteredLabs.length})
              </button>
              <button
                onClick={() => setActiveTab('ctf')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'ctf'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-gray-400 hover:text-white'
                  }`}
              >
                🚩 CTF ({filteredCtf.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-white/10 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Lab Answer Keys */}
        {activeTab === 'lab' && (
          <div className="p-4 space-y-4">
            {filteredLabs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Tidak ada kunci jawaban lab
              </div>
            ) : (
              filteredLabs.map((lab) => (
                <div key={lab.labId} className="bg-slate-700/50 rounded-xl border border-white/10 overflow-hidden">
                  {/* Lab Header */}
                  <button
                    onClick={() => setExpandedLab(expandedLab === lab.labId ? null : lab.labId)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {lab.sessionNumber}
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-white">{lab.title}</h3>
                        <p className="text-sm text-gray-400">
                          {lab.scenarios.length} skenario • {lab.scenarios.reduce((acc, s) => acc + s.objectives.length, 0)} objektif
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${getDifficultyColor(lab.difficulty)}`}>
                        {lab.difficulty}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedLab === lab.labId ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Lab Content */}
                  {expandedLab === lab.labId && (
                    <div className="border-t border-white/10 p-4 space-y-4">
                      {lab.scenarios.map((scenario) => (
                        <div key={scenario.scenarioId} className="bg-slate-800/50 rounded-lg border border-white/10">
                          {/* Scenario Header */}
                          <button
                            onClick={() => setExpandedScenario(expandedScenario === scenario.scenarioId ? null : scenario.scenarioId)}
                            className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                          >
                            <div className="text-left">
                              <h4 className="font-medium text-white">{scenario.scenarioTitle}</h4>
                              <p className="text-xs text-gray-400">{scenario.objectives.length} objektif • {scenario.maxPoints} poin max</p>
                            </div>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${expandedScenario === scenario.scenarioId ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {/* Scenario Content */}
                          {expandedScenario === scenario.scenarioId && (
                            <div className="border-t border-white/10 p-4 space-y-4">
                              {/* Objectives */}
                              <div>
                                <h5 className="text-sm font-medium text-cyan-400 mb-2">📋 Objektif & Kunci Jawaban</h5>
                                <div className="space-y-3">
                                  {scenario.objectives.map((obj, idx) => (
                                    <div key={obj.id} className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
                                      <div className="flex items-start gap-3">
                                        <span className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 text-xs flex-shrink-0">
                                          {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                          <p className="text-white text-sm mb-2">{obj.description}</p>
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs text-gray-500">Command Pattern:</span>
                                              <code className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono">
                                                {obj.commandPattern}
                                              </code>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs text-gray-500">Expected Output:</span>
                                              <code className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                                {obj.expectedOutputKeyword}
                                              </code>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs text-gray-500">Hint:</span>
                                              <span className="text-xs text-gray-400">{obj.hint}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs text-gray-500">Poin:</span>
                                              <span className="text-xs text-purple-400 font-bold">{obj.points}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Valid Commands */}
                              {scenario.validCommands.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-green-400 mb-2">✅ Valid Commands</h5>
                                  <div className="space-y-2">
                                    {scenario.validCommands.slice(0, 5).map((cmd) => (
                                      <div key={cmd.id} className="bg-slate-900/50 rounded-lg p-2 border border-white/5">
                                        <code className="text-xs text-cyan-400 font-mono">{cmd.pattern}</code>
                                        <p className="text-xs text-gray-400 mt-1">{cmd.description}</p>
                                      </div>
                                    ))}
                                    {scenario.validCommands.length > 5 && (
                                      <p className="text-xs text-gray-500">+{scenario.validCommands.length - 5} more commands...</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Hints */}
                              {scenario.hints.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-yellow-400 mb-2">💡 Hints</h5>
                                  <div className="space-y-1">
                                    {scenario.hints.map((hint) => (
                                      <div key={hint.level} className="text-xs text-gray-400">
                                        <span className="text-yellow-400">Level {hint.level}:</span> {hint.text}
                                        <span className="text-red-400 ml-2">(-{hint.pointPenalty} poin)</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* CTF Answer Keys */}
        {activeTab === 'ctf' && (
          <div className="p-4 space-y-3">
            {filteredCtf.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Tidak ada kunci jawaban CTF
              </div>
            ) : (
              filteredCtf.map((ctf) => (
                <div key={ctf.id} className="bg-slate-700/50 rounded-xl border border-white/10 overflow-hidden">
                  {/* CTF Header */}
                  <button
                    onClick={() => setExpandedCtf(expandedCtf === ctf.id ? null : ctf.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-lg">
                        🚩
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-white">{ctf.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(ctf.category)}`}>
                            {ctf.category.replace('_', ' ')}
                          </span>
                          <span className={`text-xs ${getDifficultyColor(ctf.difficulty)}`}>
                            {ctf.difficulty}
                          </span>
                          <span className="text-xs text-yellow-400 font-bold">{ctf.points} pts</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!ctf.isActive && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Inactive</span>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedCtf === ctf.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* CTF Content */}
                  {expandedCtf === ctf.id && (
                    <div className="border-t border-white/10 p-4 space-y-4">
                      {/* Description */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-1">Deskripsi</h5>
                        <p className="text-white text-sm">{ctf.description}</p>
                      </div>

                      {/* Flag - Kunci Jawaban */}
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-green-400 mb-2">🔑 FLAG (Kunci Jawaban)</h5>
                        <code className="text-lg font-mono text-green-400 bg-slate-900 px-4 py-2 rounded-lg block">
                          {ctf.flag}
                        </code>
                      </div>

                      {/* Hints */}
                      {ctf.hints.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-yellow-400 mb-2">💡 Hints</h5>
                          <div className="space-y-2">
                            {ctf.hints.map((hint, idx) => (
                              <div key={hint.id} className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-yellow-400">Hint #{idx + 1}</span>
                                  <span className="text-xs text-red-400">Cost: {hint.cost} poin</span>
                                </div>
                                <p className="text-sm text-gray-300">{hint.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
