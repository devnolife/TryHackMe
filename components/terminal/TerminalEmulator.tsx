'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalEmulatorProps {
  onCommandExecute: (command: string) => Promise<string>;
  labTitle?: string;
}

export default function TerminalEmulator({ onCommandExecute, labTitle }: TerminalEmulatorProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [currentLine, setCurrentLine] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#00ff00',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
      },
      cols: 120,
      rows: 30,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[1;32m╔════════════════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;32m║     Ethical Hacking Lab Platform - Terminal Emulator      ║\x1b[0m');
    term.writeln('\x1b[1;32m╚════════════════════════════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    if (labTitle) {
      term.writeln(`\x1b[1;36mLab:\x1b[0m ${labTitle}`);
      term.writeln('');
    }
    term.writeln('\x1b[1;33mType "help" to see available commands.\x1b[0m');
    term.writeln('');
    writePrompt(term);

    // Handle input
    let currentInput = '';

    term.onData((data) => {
      const code = data.charCodeAt(0);

      // Handle Enter key
      if (code === 13) {
        term.write('\r\n');
        if (currentInput.trim()) {
          executeCommand(currentInput.trim(), term);
          setCommandHistory(prev => [...prev, currentInput.trim()]);
          setHistoryIndex(-1);
        } else {
          writePrompt(term);
        }
        currentInput = '';
        setCurrentLine('');
        return;
      }

      // Handle Backspace
      if (code === 127) {
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          setCurrentLine(currentInput);
          term.write('\b \b');
        }
        return;
      }

      // Handle Ctrl+C
      if (code === 3) {
        term.write('^C\r\n');
        currentInput = '';
        setCurrentLine('');
        writePrompt(term);
        return;
      }

      // Handle Ctrl+L (clear screen)
      if (code === 12) {
        term.clear();
        writePrompt(term);
        return;
      }

      // Handle arrow up (command history)
      if (data === '\x1b[A') {
        if (commandHistory.length > 0) {
          const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
          const command = commandHistory[commandHistory.length - 1 - newIndex];
          if (command) {
            // Clear current line
            term.write('\r\x1b[K');
            writePrompt(term);
            term.write(command);
            currentInput = command;
            setCurrentLine(command);
            setHistoryIndex(newIndex);
          }
        }
        return;
      }

      // Handle arrow down (command history)
      if (data === '\x1b[B') {
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const command = commandHistory[commandHistory.length - 1 - newIndex];
          // Clear current line
          term.write('\r\x1b[K');
          writePrompt(term);
          term.write(command);
          currentInput = command;
          setCurrentLine(command);
          setHistoryIndex(newIndex);
        } else if (historyIndex === 0) {
          // Clear line
          term.write('\r\x1b[K');
          writePrompt(term);
          currentInput = '';
          setCurrentLine('');
          setHistoryIndex(-1);
        }
        return;
      }

      // Ignore other control characters
      if (code < 32) return;

      // Normal character input
      currentInput += data;
      setCurrentLine(currentInput);
      term.write(data);
    });

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [labTitle]);

  const writePrompt = (term: Terminal) => {
    term.write('\x1b[1;32mstudent@kali\x1b[0m:\x1b[1;34m~\x1b[0m$ ');
  };

  const executeCommand = async (command: string, term: Terminal) => {
    try {
      // Special case: clear command
      if (command === 'clear' || command === 'cls') {
        term.clear();
        writePrompt(term);
        return;
      }

      // Execute command through API
      const output = await onCommandExecute(command);

      // Write output
      if (output) {
        const lines = output.split('\n');
        lines.forEach(line => {
          term.writeln(line);
        });
      }

      writePrompt(term);
    } catch (error) {
      term.writeln(`\x1b[1;31mError executing command: ${error}\x1b[0m`);
      writePrompt(term);
    }
  };

  return (
    <div className="w-full h-full bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-700">
      <div ref={terminalRef} className="w-full h-full p-2" />
    </div>
  );
}
