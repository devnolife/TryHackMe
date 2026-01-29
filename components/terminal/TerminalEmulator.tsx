'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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

export default function TerminalEmulator({ onCommandExecute, labTitle }: TerminalEmulatorProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isReady, setIsReady] = useState(false);
  const commandHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const currentInputRef = useRef('');
  const currentDirRef = useRef('/home/student');
  const isExecutingRef = useRef(false);
  const promptEndPositionRef = useRef(0); // Track where prompt ends

  // Format directory for prompt display
  const formatDir = useCallback((dir: string) => {
    if (dir === '/home/student') return '~';
    if (dir.startsWith('/home/student/')) return '~' + dir.substring(13);
    return dir;
  }, []);

  const writePrompt = useCallback((term: Terminal) => {
    const dir = formatDir(currentDirRef.current);
    term.write(`\x1b[1;32mstudent@kali\x1b[0m:\x1b[1;34m${dir}\x1b[0m$ `);
    // Save cursor position after prompt (for backspace protection)
    promptEndPositionRef.current = term.buffer.active.cursorX;
  }, [formatDir]);

  // Tab completion
  const handleTabCompletion = useCallback(async (term: Terminal) => {
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
        // Single match - complete it
        const completion = matches[0].substring(searchTerm.length);
        currentInputRef.current += completion + ' ';
        term.write(completion + ' ');
      } else if (matches.length > 1 && searchTerm) {
        // Find common prefix
        const commonPrefix = findCommonPrefix(matches);
        if (commonPrefix.length > searchTerm.length) {
          const completion = commonPrefix.substring(searchTerm.length);
          currentInputRef.current += completion;
          term.write(completion);
        } else {
          // Show all matches
          term.write('\r\n');
          term.writeln(matches.join('  '));
          writePrompt(term);
          term.write(currentInputRef.current);
        }
      }
    } else if (PATH_COMMANDS.includes(command)) {
      // Path completion for file/directory commands
      try {
        const response = await fetch('/api/commands/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ partialPath: lastPart }),
        });

        if (!response.ok) return;

        const result = await response.json();
        const completions = result.completions || [];

        if (completions.length === 1) {
          // Single match - complete it
          const completion = completions[0].substring(lastPart.split('/').pop()?.length || 0);
          currentInputRef.current += completion;
          term.write(completion);

          // Add space if it's a file (doesn't end with /)
          if (!completions[0].endsWith('/')) {
            currentInputRef.current += ' ';
            term.write(' ');
          }
        } else if (completions.length > 1) {
          // Find common prefix
          const commonPrefix = findCommonPrefix(completions);
          const partialName = lastPart.split('/').pop() || '';

          if (commonPrefix.length > partialName.length) {
            const completion = commonPrefix.substring(partialName.length);
            currentInputRef.current += completion;
            term.write(completion);
          } else {
            // Show all matches
            term.write('\r\n');
            // Color directories in blue
            const coloredCompletions = completions.map((c: string) =>
              c.endsWith('/') ? `\x1b[1;34m${c}\x1b[0m` : c
            );
            term.writeln(coloredCompletions.join('  '));
            writePrompt(term);
            term.write(currentInputRef.current);
          }
        }
      } catch (e) {
        // Silently fail on completion errors
      }
    }
  }, [writePrompt, onCommandExecute]);

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

  const executeCommand = useCallback(async (command: string, term: Terminal) => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    try {
      // Special case: clear command
      if (command === 'clear' || command === 'cls') {
        term.clear();
        writePrompt(term);
        isExecutingRef.current = false;
        return;
      }

      // Special case: exit command
      if (command === 'exit') {
        term.writeln('\x1b[1;33mlogout\x1b[0m');
        term.writeln('\x1b[1;31mSession ended. Refresh page to restart.\x1b[0m');
        isExecutingRef.current = false;
        return;
      }

      // Execute command through API
      const result = await onCommandExecute(command);

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
      term.writeln(`\x1b[1;31mError: ${error}\x1b[0m`);
      writePrompt(term);
    } finally {
      isExecutingRef.current = false;
    }
  }, [onCommandExecute, writePrompt]);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    // Wait for DOM to be ready
    const container = terminalRef.current;
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      const timer = setTimeout(() => {
        setIsReady(prev => !prev);
      }, 100);
      return () => clearTimeout(timer);
    }

    // Track if this effect instance is still valid
    let isMounted = true;

    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 14,
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, Monaco, "Courier New", monospace',
      fontWeight: '400',
      letterSpacing: 0,
      lineHeight: 1.2,
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
    term.loadAddon(fitAddon);

    // Store refs before opening terminal
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.open(container);

    // Delay fit to ensure container is ready
    const initialFitTimeout = setTimeout(() => {
      if (!isMounted) return;
      try {
        if (container.offsetWidth > 0 && container.offsetHeight > 0 && fitAddon) {
          fitAddon.fit();
        }
      } catch (e) {
        console.warn('Terminal fit failed:', e);
      }
    }, 150);

    // Welcome message with ASCII art
    term.writeln('');
    term.writeln('\x1b[1;36m ╔═══════════════════════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;36m ║\x1b[0m  \x1b[1;32m██╗  ██╗ █████╗  ██████╗██╗  ██╗██╗      █████╗ ██████╗ \x1b[0m       \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m ║\x1b[0m  \x1b[1;32m██║  ██║██╔══██╗██╔════╝██║ ██╔╝██║     ██╔══██╗██╔══██╗\x1b[0m       \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m ║\x1b[0m  \x1b[1;32m███████║███████║██║     █████╔╝ ██║     ███████║██████╔╝\x1b[0m       \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m ║\x1b[0m  \x1b[1;32m██╔══██║██╔══██║██║     ██╔═██╗ ██║     ██╔══██║██╔══██╗\x1b[0m       \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m ║\x1b[0m  \x1b[1;32m██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║██████╔╝\x1b[0m       \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m ║\x1b[0m  \x1b[1;32m╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ \x1b[0m       \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m ║\x1b[0m                                                                   \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m ║\x1b[0m       \x1b[1;35mPlatform Lab Ethical Hacking - Terminal Emulator\x1b[0m            \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m ╚═══════════════════════════════════════════════════════════════════╝\x1b[0m');
    term.writeln('');

    if (labTitle) {
      term.writeln(`  \x1b[1;35m📋 Lab:\x1b[0m ${labTitle}`);
    }

    term.writeln('');
    term.writeln('  \x1b[1;33m💡 Ketik "\x1b[1;36mhelp\x1b[1;33m" untuk melihat daftar perintah yang tersedia.\x1b[0m');
    term.writeln('  \x1b[1;33m💡 Gunakan \x1b[1;36mTab\x1b[1;33m untuk auto-complete perintah.\x1b[0m');
    term.writeln('  \x1b[1;33m💡 Gunakan \x1b[1;36m↑/↓\x1b[1;33m untuk navigasi history.\x1b[0m');
    term.writeln('');
    term.writeln(`  \x1b[90mSystem: Kali Linux 2023.4 | IP: 192.168.1.50\x1b[0m`);
    term.writeln('');

    writePrompt(term);

    // Handle input
    term.onData((data) => {
      if (isExecutingRef.current) return;

      const code = data.charCodeAt(0);

      // Handle Enter key
      if (code === 13) {
        term.write('\r\n');
        const cmd = currentInputRef.current.trim();

        if (cmd) {
          // Add to history
          commandHistoryRef.current.push(cmd);
          historyIndexRef.current = commandHistoryRef.current.length;

          // Execute command
          executeCommand(cmd, term);
        } else {
          writePrompt(term);
        }

        currentInputRef.current = '';
        return;
      }

      // Handle Backspace
      if (code === 127) {
        // Prevent deleting the prompt by checking current input length
        // This is more reliable than cursor position check
        if (currentInputRef.current.length > 0) {
          currentInputRef.current = currentInputRef.current.slice(0, -1);
          term.write('\b \b');
        }
        // If input is empty, do nothing (prevents deleting prompt)
        return;
      }

      // Handle Ctrl+C
      if (code === 3) {
        term.write('^C\r\n');
        currentInputRef.current = '';
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
        handleTabCompletion(term);
        return;
      }

      // Handle escape sequences (arrow keys)
      if (data.startsWith('\x1b[')) {
        const seq = data.substring(2);

        // Up arrow - previous command
        if (seq === 'A') {
          if (commandHistoryRef.current.length > 0 && historyIndexRef.current > 0) {
            historyIndexRef.current--;

            // Clear current input
            const len = currentInputRef.current.length;
            term.write('\b'.repeat(len) + ' '.repeat(len) + '\b'.repeat(len));

            // Write history command
            currentInputRef.current = commandHistoryRef.current[historyIndexRef.current];
            term.write(currentInputRef.current);
          }
          return;
        }

        // Down arrow - next command
        if (seq === 'B') {
          if (historyIndexRef.current < commandHistoryRef.current.length - 1) {
            historyIndexRef.current++;

            // Clear current input
            const len = currentInputRef.current.length;
            term.write('\b'.repeat(len) + ' '.repeat(len) + '\b'.repeat(len));

            // Write history command
            currentInputRef.current = commandHistoryRef.current[historyIndexRef.current];
            term.write(currentInputRef.current);
          } else if (historyIndexRef.current === commandHistoryRef.current.length - 1) {
            historyIndexRef.current++;

            // Clear to empty
            const len = currentInputRef.current.length;
            term.write('\b'.repeat(len) + ' '.repeat(len) + '\b'.repeat(len));
            currentInputRef.current = '';
          }
          return;
        }

        // Ignore other escape sequences
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
    let isDisposed = false;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (isDisposed) return;
        try {
          // Check if terminal is properly initialized and has dimensions
          if (container.offsetWidth > 0 && container.offsetHeight > 0 && fitAddon && term && (term as any)._core) {
            fitAddon.fit();
          }
        } catch (e) {
          console.warn('Terminal resize failed:', e);
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    // Focus terminal on click
    const handleClick = () => {
      if (!isDisposed && xtermRef.current) {
        xtermRef.current.focus();
      }
    };
    container.addEventListener('click', handleClick);

    // Initial focus
    const focusTimeout = setTimeout(() => {
      if (!isDisposed && xtermRef.current) {
        xtermRef.current.focus();
      }
    }, 200);

    return () => {
      isDisposed = true;
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleClick);
      clearTimeout(resizeTimeout);
      clearTimeout(focusTimeout);
      clearTimeout(initialFitTimeout);

      // Dispose in the correct order
      if (fitAddonRef.current) {
        fitAddonRef.current.dispose();
        fitAddonRef.current = null;
      }
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
    };
  }, [labTitle, isReady, writePrompt, executeCommand, handleTabCompletion]);

  return (
    <div
      className="w-full h-[500px] bg-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-cyan-500/10"
      style={{ minHeight: '400px' }}
    >
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-800/80 border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 transition-colors bg-red-500 rounded-full cursor-pointer hover:bg-red-400"></div>
            <div className="w-3 h-3 transition-colors bg-yellow-500 rounded-full cursor-pointer hover:bg-yellow-400"></div>
            <div className="w-3 h-3 transition-colors bg-green-500 rounded-full cursor-pointer hover:bg-green-400"></div>
          </div>
          <span className="font-mono text-xs text-gray-400">
            student@kali: {labTitle || 'Terminal'}
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
        className="w-full p-2"
        style={{ height: 'calc(100% - 40px)' }}
      />
    </div>
  );
}
