'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalEmulatorProps {
  onCommandExecute: (command: string) => Promise<{ output: string; currentDirectory?: string; completions?: string[] }>;
  labTitle?: string;
}

// Available commands for tab completion
const AVAILABLE_COMMANDS = [
  // Basic Linux
  'whoami', 'id', 'hostname', 'uname', 'date', 'uptime', 'pwd', 'cd', 'ls', 'll', 'cat',
  'echo', 'env', 'export', 'history', 'clear', 'man', 'exit', 'alias', 'source',
  // File operations
  'touch', 'mkdir', 'rm', 'cp', 'mv', 'chmod', 'chown', 'head', 'tail', 'grep', 'wc', 'file', 'which',
  'find', 'ln', 'du', 'stat', 'diff', 'less', 'more',
  // Text processing
  'awk', 'sed', 'cut', 'sort', 'uniq', 'tr',
  // Text editors
  'nano', 'vim', 'vi',
  // Archive
  'tar', 'gzip', 'gunzip', 'zip', 'unzip',
  // Process control
  'kill', 'jobs', 'bg', 'fg',
  // Network
  'ifconfig', 'ip', 'ping', 'netstat', 'curl', 'wget', 'ssh', 'nc', 'netcat', 'arp', 'ss', 'tcpdump', 'lsof',
  // Security/Hacking
  'nmap', 'whois', 'nslookup', 'dig', 'host', 'geoip', 'traceroute',
  'searchsploit', 'hashid', 'john', 'nikto', 'sqlmap', 'test-xss', 'dirb',
  // Metasploit
  'msfconsole', 'search', 'use', 'info', 'show', 'set', 'run', 'exploit', 'sessions', 'back',
  // Meterpreter
  'sysinfo', 'getuid', 'getsystem', 'hashdump', 'shell', 'migrate', 'background', 'download', 'upload',
  // CTF
  'ctf', 'submit-flag',
  // System
  'ps', 'top', 'free', 'df', 'sudo', 'su', 'passwd', 'groups', 'dmesg', 'mount', 'help',
];

// Commands that accept file/directory arguments
const PATH_COMMANDS = [
  'cd', 'ls', 'll', 'cat', 'head', 'tail', 'grep', 'rm', 'cp', 'mv', 'chmod', 'chown',
  'touch', 'mkdir', 'file', 'wc', 'nano', 'vim', 'vi', 'find', 'ln', 'du', 'stat',
  'diff', 'less', 'more', 'awk', 'sed', 'cut', 'sort', 'uniq', 'tar', 'gzip', 'gunzip',
  'zip', 'unzip', 'source',
];

// Helper function to find common prefix
const findCommonPrefix = (strings: string[]): string => {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];

  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].toLowerCase().startsWith(prefix.toLowerCase())) {
      prefix = prefix.substring(0, prefix.length - 1);
      if (prefix === '') return '';
    }
  }
  return prefix;
};

export default function TerminalEmulator({ onCommandExecute, labTitle }: TerminalEmulatorProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const isInitializedRef = useRef(false);
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const currentInputRef = useRef('');
  const currentDirRef = useRef('/home/student');
  const isExecutingRef = useRef(false);
  const promptEndPositionRef = useRef(0);
  const isDisposedRef = useRef(false);

  // Store callbacks in refs to avoid dependency issues
  const onCommandExecuteRef = useRef(onCommandExecute);
  onCommandExecuteRef.current = onCommandExecute;

  // Memoize labTitle to prevent unnecessary re-renders
  const stableLabTitle = useMemo(() => labTitle, [labTitle]);

  // Format directory for prompt display - stable callback
  const formatDir = useCallback((dir: string) => {
    if (dir === '/home/student') return '~';
    if (dir.startsWith('/home/student/')) return '~' + dir.substring(13);
    return dir;
  }, []);

  // Write prompt - stable callback using ref
  const writePrompt = useCallback((term: Terminal) => {
    if (isDisposedRef.current) return;
    try {
      const dir = formatDir(currentDirRef.current);
      term.write(`\x1b[1;32mstudent@kali\x1b[0m:\x1b[1;34m${dir}\x1b[0m$ `);
      promptEndPositionRef.current = term.buffer.active.cursorX;
    } catch (e) {
      console.warn('Failed to write prompt:', e);
    }
  }, [formatDir]);

  useEffect(() => {
    // Prevent re-initialization
    if (isInitializedRef.current) return;
    if (!terminalRef.current) return;

    const container = terminalRef.current;

    // Wait for container to have dimensions
    const initTerminal = () => {
      if (isInitializedRef.current) return;
      if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
        // Retry after a delay
        const retryTimer = setTimeout(initTerminal, 100);
        return () => clearTimeout(retryTimer);
      }

      // Mark as initialized immediately to prevent double initialization
      isInitializedRef.current = true;
      isDisposedRef.current = false;

      // Initialize xterm
      const term = new Terminal({
        cursorBlink: true,
        cursorStyle: 'bar',
        fontSize: 14,
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, Monaco, "Courier New", monospace',
        fontWeight: '400',
        letterSpacing: 0,
        lineHeight: 1.2,
        allowProposedApi: true,
        theme: {
          background: '#0f172a',
          foreground: '#e2e8f0',
          cursor: '#06b6d4',
          cursorAccent: '#0f172a',
          selectionBackground: '#06b6d480',
          selectionForeground: '#ffffff',
          black: '#1e293b',
          red: '#ef4444',
          green: '#22c55e',
          yellow: '#eab308',
          blue: '#3b82f6',
          magenta: '#a855f7',
          cyan: '#06b6d4',
          white: '#f8fafc',
          brightBlack: '#475569',
          brightRed: '#f87171',
          brightGreen: '#4ade80',
          brightYellow: '#facc15',
          brightBlue: '#60a5fa',
          brightMagenta: '#c084fc',
          brightCyan: '#22d3ee',
          brightWhite: '#ffffff',
        },
      });

      const fitAddon = new FitAddon();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      try {
        term.open(container);
        // IMPORTANT: Load FitAddon AFTER terminal is opened
        // This ensures the renderer is ready before fit() is called
        term.loadAddon(fitAddon);
      } catch (e) {
        console.error('Failed to open terminal:', e);
        isInitializedRef.current = false;
        return;
      }

      // Fit terminal after opening
      const fitTerminal = () => {
        if (isDisposedRef.current) return;

        // Ensure terminal is fully initialized before fitting
        if (
          container.offsetWidth > 0 &&
          container.offsetHeight > 0 &&
          fitAddon &&
          term &&
          term.element &&
          term.element.offsetWidth > 0
        ) {
          // Use requestAnimationFrame + setTimeout to ensure renderer is ready
          requestAnimationFrame(() => {
            if (isDisposedRef.current) return;

            // Extra delay to ensure xterm's internal renderer is fully initialized
            setTimeout(() => {
              if (isDisposedRef.current || !fitAddonRef.current) return;

              try {
                fitAddonRef.current.fit();
              } catch (e) {
                // Silently ignore fit errors - terminal still works
                console.debug('Terminal fit skipped');
              }
            }, 50);
          });
        }
      };

      // Initial fit with delay and multiple retries
      const initialFitTimeout = setTimeout(() => {
        fitTerminal();
        // Retry fit after additional delays to handle slow renders
        setTimeout(fitTerminal, 300);
        setTimeout(fitTerminal, 600);
      }, 250);

      // Execute command handler
      const executeCommand = async (command: string) => {
        if (isExecutingRef.current || isDisposedRef.current) return;
        isExecutingRef.current = true;

        try {
          // Special case: clear command
          if (command === 'clear' || command === 'cls') {
            term.clear();
            writePrompt(term);
            return;
          }

          // Special case: exit command
          if (command === 'exit') {
            term.writeln('\x1b[1;33mlogout\x1b[0m');
            term.writeln('\x1b[1;31mSession ended. Refresh page to restart.\x1b[0m');
            return;
          }

          // Execute command through API
          const result = await onCommandExecuteRef.current(command);

          if (isDisposedRef.current) return;

          // Update current directory
          if (result.currentDirectory) {
            currentDirRef.current = result.currentDirectory;
          }

          // Write output
          if (result.output) {
            const lines = result.output.split('\n');
            lines.forEach(line => {
              term.writeln(line);
            });
          }

          writePrompt(term);
        } catch (error) {
          if (isDisposedRef.current) return;
          term.writeln(`\x1b[1;31mError: ${error}\x1b[0m`);
          writePrompt(term);
        } finally {
          isExecutingRef.current = false;
        }
      };

      // Tab completion handler
      const handleTabCompletion = async () => {
        if (isDisposedRef.current) return;

        const input = currentInputRef.current;
        const parts = input.split(' ');
        const lastPart = parts[parts.length - 1];
        const command = parts[0];

        // If it's the first word (command), complete commands
        if (parts.length === 1 || (parts.length === 2 && lastPart === '')) {
          const searchTerm = parts.length === 1 ? lastPart : '';
          const matches = AVAILABLE_COMMANDS.filter(cmd =>
            cmd.toLowerCase().startsWith(searchTerm.toLowerCase())
          );

          if (matches.length === 1) {
            const completion = matches[0].substring(searchTerm.length);
            currentInputRef.current += completion + ' ';
            term.write(completion + ' ');
          } else if (matches.length > 1 && searchTerm) {
            const commonPrefix = findCommonPrefix(matches);
            if (commonPrefix.length > searchTerm.length) {
              const completion = commonPrefix.substring(searchTerm.length);
              currentInputRef.current += completion;
              term.write(completion);
            } else {
              term.write('\r\n');
              term.writeln(matches.join('  '));
              writePrompt(term);
              term.write(currentInputRef.current);
            }
          }
        } else if (PATH_COMMANDS.includes(command)) {
          try {
            const response = await fetch('/api/commands/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ partialPath: lastPart }),
            });

            if (!response.ok || isDisposedRef.current) return;

            const result = await response.json();
            const completions = result.completions || [];

            if (completions.length === 1) {
              const completion = completions[0].substring(lastPart.split('/').pop()?.length || 0);
              currentInputRef.current += completion;
              term.write(completion);

              if (!completions[0].endsWith('/')) {
                currentInputRef.current += ' ';
                term.write(' ');
              }
            } else if (completions.length > 1) {
              const commonPrefix = findCommonPrefix(completions);
              const partialName = lastPart.split('/').pop() || '';

              if (commonPrefix.length > partialName.length) {
                const completion = commonPrefix.substring(partialName.length);
                currentInputRef.current += completion;
                term.write(completion);
              } else {
                term.write('\r\n');
                const coloredCompletions = completions.map((c: string) =>
                  c.endsWith('/') ? `\x1b[1;34m${c}\x1b[0m` : c
                );
                term.writeln(coloredCompletions.join('  '));
                writePrompt(term);
                term.write(currentInputRef.current);
              }
            }
          } catch (e) {
            // Silently fail
          }
        }
      };

      // Welcome message - compact version for better responsiveness
      term.writeln('');
      term.writeln('\x1b[1;36m╭──────────────────────────────────────────╮\x1b[0m');
      term.writeln('\x1b[1;36m│\x1b[0m  \x1b[1;32m🔐 CyberLab Terminal\x1b[0m                     \x1b[1;36m│\x1b[0m');
      term.writeln('\x1b[1;36m│\x1b[0m  \x1b[90mEthical Hacking Lab Environment\x1b[0m         \x1b[1;36m│\x1b[0m');
      term.writeln('\x1b[1;36m╰──────────────────────────────────────────╯\x1b[0m');
      term.writeln('');

      if (stableLabTitle) {
        term.writeln(`  \x1b[1;35m📋 Lab:\x1b[0m ${stableLabTitle}`);
        term.writeln('');
      }

      term.writeln('  \x1b[33m💡 Ketik \x1b[1;36mhelp\x1b[0;33m untuk daftar perintah\x1b[0m');
      term.writeln('  \x1b[90mTab: autocomplete | ↑↓: history | Ctrl+C: cancel\x1b[0m');
      term.writeln('');

      writePrompt(term);

      // Handle input
      const onDataDisposable = term.onData((data) => {
        if (isExecutingRef.current || isDisposedRef.current) return;

        const code = data.charCodeAt(0);

        // Handle Enter key
        if (code === 13) {
          term.write('\r\n');
          const cmd = currentInputRef.current.trim();

          if (cmd) {
            commandHistoryRef.current.push(cmd);
            historyIndexRef.current = commandHistoryRef.current.length;
            executeCommand(cmd);
          } else {
            writePrompt(term);
          }

          currentInputRef.current = '';
          return;
        }

        // Handle Backspace
        if (code === 127) {
          if (currentInputRef.current.length > 0) {
            currentInputRef.current = currentInputRef.current.slice(0, -1);
            term.write('\b \b');
          }
          return;
        }

        // Handle Ctrl+C
        if (code === 3) {
          term.write('^C\r\n');
          currentInputRef.current = '';
          isExecutingRef.current = false;
          writePrompt(term);
          return;
        }

        // Handle Ctrl+L (clear screen)
        if (code === 12) {
          term.clear();
          writePrompt(term);
          term.write(currentInputRef.current);
          return;
        }

        // Handle Ctrl+U (clear line)
        if (code === 21) {
          const len = currentInputRef.current.length;
          currentInputRef.current = '';
          term.write('\r');
          writePrompt(term);
          term.write(' '.repeat(len));
          term.write('\r');
          writePrompt(term);
          return;
        }

        // Handle Tab (auto-complete)
        if (code === 9) {
          handleTabCompletion();
          return;
        }

        // Handle escape sequences (arrow keys)
        if (data.startsWith('\x1b[')) {
          const seq = data.substring(2);

          // Up arrow - previous command
          if (seq === 'A') {
            if (commandHistoryRef.current.length > 0 && historyIndexRef.current > 0) {
              historyIndexRef.current--;

              const len = currentInputRef.current.length;
              term.write('\b'.repeat(len) + ' '.repeat(len) + '\b'.repeat(len));

              currentInputRef.current = commandHistoryRef.current[historyIndexRef.current];
              term.write(currentInputRef.current);
            }
            return;
          }

          // Down arrow - next command
          if (seq === 'B') {
            if (historyIndexRef.current < commandHistoryRef.current.length - 1) {
              historyIndexRef.current++;

              const len = currentInputRef.current.length;
              term.write('\b'.repeat(len) + ' '.repeat(len) + '\b'.repeat(len));

              currentInputRef.current = commandHistoryRef.current[historyIndexRef.current];
              term.write(currentInputRef.current);
            } else if (historyIndexRef.current === commandHistoryRef.current.length - 1) {
              historyIndexRef.current++;

              const len = currentInputRef.current.length;
              term.write('\b'.repeat(len) + ' '.repeat(len) + '\b'.repeat(len));
              currentInputRef.current = '';
            }
            return;
          }

          return;
        }

        // Ignore other control characters
        if (code < 32) return;

        // Normal character input
        currentInputRef.current += data;
        term.write(data);
      });

      // Handle window resize with debounce
      let resizeTimeout: NodeJS.Timeout;

      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (isDisposedRef.current) return;
          fitTerminal();
        }, 150);
      };

      window.addEventListener('resize', handleResize);

      // Focus terminal on click
      const handleClick = () => {
        if (!isDisposedRef.current && xtermRef.current) {
          xtermRef.current.focus();
        }
      };
      container.addEventListener('click', handleClick);

      // Initial focus
      const focusTimeout = setTimeout(() => {
        if (!isDisposedRef.current && xtermRef.current) {
          xtermRef.current.focus();
        }
      }, 200);

      // Cleanup function
      return () => {
        isDisposedRef.current = true;
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('click', handleClick);
        clearTimeout(resizeTimeout);
        clearTimeout(focusTimeout);
        clearTimeout(initialFitTimeout);
        onDataDisposable.dispose();

        // Dispose in the correct order
        try {
          if (fitAddonRef.current) {
            fitAddonRef.current.dispose();
            fitAddonRef.current = null;
          }
        } catch (e) {
          console.warn('FitAddon dispose error:', e);
        }

        try {
          if (xtermRef.current) {
            xtermRef.current.dispose();
            xtermRef.current = null;
          }
        } catch (e) {
          console.warn('Terminal dispose error:', e);
        }

        isInitializedRef.current = false;
      };
    };

    // Start initialization
    const cleanup = initTerminal();
    return typeof cleanup === 'function' ? cleanup : undefined;
  }, [writePrompt, stableLabTitle]);

  return (
    <div
      className="w-full h-full bg-slate-900 overflow-hidden flex flex-col"
    >
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-800/80 border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 transition-colors bg-red-500 rounded-full cursor-pointer hover:bg-red-400"></div>
            <div className="w-3 h-3 transition-colors bg-yellow-500 rounded-full cursor-pointer hover:bg-yellow-400"></div>
            <div className="w-3 h-3 transition-colors bg-green-500 rounded-full cursor-pointer hover:bg-green-400"></div>
          </div>
          <span className="font-mono text-xs text-gray-400">
            student@kali: {stableLabTitle || 'Terminal'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            🔒 Secure Session
          </span>
        </div>
      </div>

      {/* Terminal body */}
      <div
        ref={terminalRef}
        className="w-full flex-1 p-2 min-h-0"
      />
    </div>
  );
}
