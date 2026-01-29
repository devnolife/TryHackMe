'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'lab' | 'ctf' | 'command';
  title: string;
  description: string;
  url: string | null;
  icon: string;
  category?: string;
  difficulty?: string;
  points?: number;
  topic?: string;
}

interface SearchResults {
  labs: SearchResult[];
  ctf: SearchResult[];
  commands: SearchResult[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ labs: [], ctf: [], commands: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults({ labs: [], ctf: [], commands: [] });
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search debounce
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ labs: [], ctf: [], commands: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setResults(data.results);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Flatten results for keyboard navigation
  const flatResults = useCallback(() => {
    const all: SearchResult[] = [];
    if (results.labs.length > 0) {
      all.push(...results.labs);
    }
    if (results.ctf.length > 0) {
      all.push(...results.ctf);
    }
    if (results.commands.length > 0) {
      all.push(...results.commands);
    }
    return all;
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const allResults = flatResults();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(allResults.length, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allResults.length) % Math.max(allResults.length, 1));
        break;
      case 'Enter':
        e.preventDefault();
        const selected = allResults[selectedIndex];
        if (selected?.url) {
          router.push(selected.url);
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  }, [flatResults, selectedIndex, router, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = resultsRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    if (result.url) {
      router.push(result.url);
      onClose();
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toUpperCase()) {
      case 'EASY':
      case 'BEGINNER':
        return 'text-green-400 bg-green-500/20';
      case 'MEDIUM':
      case 'INTERMEDIATE':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'HARD':
      case 'ADVANCED':
        return 'text-red-400 bg-red-500/20';
      case 'EXPERT':
        return 'text-purple-400 bg-purple-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toUpperCase()) {
      case 'WEB': return '🌐';
      case 'CRYPTO': return '🔐';
      case 'FORENSICS': return '🔍';
      case 'OSINT': return '🔎';
      case 'MISC': return '🎲';
      case 'SCANNING': return '📡';
      case 'ENUMERATION': return '📋';
      case 'EXPLOITATION': return '💥';
      case 'ANALYSIS': return '📊';
      default: return '📁';
    }
  };

  if (!isOpen) return null;

  const allResults = flatResults();
  const hasResults = allResults.length > 0;
  let currentIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-slate-800 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cari lab, CTF challenge, atau command..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg"
          />
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-500" />
          )}
          <kbd className="px-2 py-1 text-xs text-gray-500 bg-white/5 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-400">Ketik minimal 2 karakter untuk mencari</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 text-xs text-gray-500 bg-white/5 rounded-full">Labs</span>
                <span className="px-3 py-1 text-xs text-gray-500 bg-white/5 rounded-full">CTF Challenges</span>
                <span className="px-3 py-1 text-xs text-gray-500 bg-white/5 rounded-full">Commands</span>
              </div>
            </div>
          ) : !hasResults && !loading ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">😕</div>
              <p className="text-gray-400">Tidak ada hasil untuk "{query}"</p>
              <p className="text-sm text-gray-500 mt-2">Coba kata kunci lain</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Labs Results */}
              {results.labs.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    📚 Lab Sessions ({results.labs.length})
                  </div>
                  {results.labs.map((result) => {
                    const idx = currentIndex++;
                    return (
                      <button
                        key={result.id}
                        data-index={idx}
                        onClick={() => handleResultClick(result)}
                        className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                          selectedIndex === idx 
                            ? 'bg-cyan-500/20 border border-cyan-500/30' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <span className="text-2xl">{result.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate">{result.title}</span>
                            {result.difficulty && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getDifficultyColor(result.difficulty)}`}>
                                {result.difficulty}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 truncate">{result.description}</p>
                          {result.topic && (
                            <span className="text-xs text-cyan-400">{result.topic}</span>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* CTF Results */}
              {results.ctf.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    🏴 CTF Challenges ({results.ctf.length})
                  </div>
                  {results.ctf.map((result) => {
                    const idx = currentIndex++;
                    return (
                      <button
                        key={result.id}
                        data-index={idx}
                        onClick={() => handleResultClick(result)}
                        className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                          selectedIndex === idx 
                            ? 'bg-cyan-500/20 border border-cyan-500/30' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <span className="text-2xl">{getCategoryIcon(result.category)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate">{result.title}</span>
                            {result.difficulty && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getDifficultyColor(result.difficulty)}`}>
                                {result.difficulty}
                              </span>
                            )}
                            {result.points && (
                              <span className="text-xs text-cyan-400">{result.points} pts</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 truncate">{result.description}</p>
                          {result.category && (
                            <span className="text-xs text-purple-400">{result.category}</span>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Commands Results */}
              {results.commands.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ⌨️ Commands ({results.commands.length})
                  </div>
                  {results.commands.map((result) => {
                    const idx = currentIndex++;
                    return (
                      <div
                        key={result.id}
                        data-index={idx}
                        className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${
                          selectedIndex === idx 
                            ? 'bg-cyan-500/20 border border-cyan-500/30' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <span className="text-2xl">{getCategoryIcon(result.category)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="font-mono font-medium text-cyan-400">{result.title}</code>
                            {result.category && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-gray-400">
                                {result.category}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{result.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">↓</kbd>
              untuk navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/5 rounded border border-white/10">Enter</kbd>
              untuk membuka
            </span>
          </div>
          <span>
            Powered by <span className="text-cyan-400">EthicaLab</span>
          </span>
        </div>
      </div>
    </div>
  );
}
