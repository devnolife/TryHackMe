/**
 * Command Router
 * Routes commands to appropriate simulators and validates them
 */

import { OsintSimulator } from './osint-simulator';
import { NmapSimulator } from './nmap-simulator';
import { VulnSimulator } from './vuln-simulator';
import { WebSimulator } from './web-simulator';
import { LinuxSimulator } from './linux-simulator';
import { MetasploitSimulator } from './metasploit-simulator';
import { CTFSystem } from '../ctf/ctf-system';

export interface CommandResult {
  success: boolean;
  output: string;
  isValid: boolean;
  pointsAwarded: number;
  keywords: string[];
  message?: string;
  executionTime: number;
}

export class CommandRouter {
  /**
   * Execute a command and return the result
   * Supports pipes (|), output redirection (>, >>), and command chaining (&&, ||)
   */
  static execute(command: string): CommandResult {
    const startTime = Date.now();
    command = command.trim();

    // Tab completion request
    if (command.startsWith('__complete__:')) {
      const partialPath = command.substring('__complete__:'.length);
      const completions = LinuxSimulator.getCompletions(partialPath);
      return {
        success: true,
        output: JSON.stringify(completions),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // Add to history
    if (command && command !== 'history') {
      LinuxSimulator.addToHistory(command);
    }

    // Handle command chaining with && (run next only if previous succeeds)
    if (command.includes(' && ')) {
      return this.executeChainedCommands(command, '&&', startTime);
    }

    // Handle command chaining with || (run next only if previous fails)
    if (command.includes(' || ')) {
      return this.executeChainedCommands(command, '||', startTime);
    }

    // Handle pipes (|)
    if (command.includes(' | ')) {
      return this.executePipedCommands(command, startTime);
    }

    // Handle output redirection (>> append, > overwrite)
    if (command.includes(' >> ') || command.includes(' > ')) {
      return this.executeWithRedirection(command, startTime);
    }

    // Help command
    if (command === 'help' || command === '--help') {
      return this.helpCommand(startTime);
    }

    // Clear command
    if (command === 'clear' || command === 'cls') {
      return {
        success: true,
        output: '',
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // ========== Basic Linux Commands ==========

    // whoami
    if (command === 'whoami') {
      return {
        success: true,
        output: LinuxSimulator.whoami(),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // id
    if (command === 'id') {
      return {
        success: true,
        output: LinuxSimulator.id(),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // hostname
    if (command === 'hostname') {
      return {
        success: true,
        output: LinuxSimulator.hostname(),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // uname
    if (command === 'uname' || command.startsWith('uname ')) {
      const args = command.replace('uname', '').trim();
      return {
        success: true,
        output: LinuxSimulator.uname(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // date
    if (command === 'date') {
      return {
        success: true,
        output: LinuxSimulator.date(),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // uptime
    if (command === 'uptime') {
      return {
        success: true,
        output: LinuxSimulator.uptime(),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // pwd
    if (command === 'pwd') {
      return {
        success: true,
        output: LinuxSimulator.pwd(),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // cd
    if (command === 'cd' || command.startsWith('cd ')) {
      const path = command.replace('cd', '').trim();
      const output = LinuxSimulator.cd(path);
      return {
        success: !output.includes('No such file'),
        output,
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // ls (also handle ll as alias for ls -la)
    if (command === 'ls' || command.startsWith('ls ') || command === 'll' || command.startsWith('ll ')) {
      let args = command;
      // Handle ll as alias for ls -la
      if (command === 'll') {
        args = '-la';
      } else if (command.startsWith('ll ')) {
        args = '-la ' + command.substring(3);
      } else {
        args = command.replace('ls', '').trim();
      }
      return {
        success: true,
        output: LinuxSimulator.ls(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // cat
    if (command.startsWith('cat ')) {
      const filename = command.replace('cat ', '').trim();
      const output = LinuxSimulator.cat(filename);
      return {
        success: !output.includes('No such file') && !output.includes('Permission denied'),
        output,
        isValid: true,
        pointsAwarded: output.includes('Permission denied') ? 0 : 2,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // echo
    if (command.startsWith('echo ')) {
      const args = command.replace('echo ', '');
      return {
        success: true,
        output: LinuxSimulator.echo(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // env
    if (command === 'env') {
      return {
        success: true,
        output: LinuxSimulator.env(),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // export
    if (command === 'export' || command.startsWith('export ')) {
      const args = command.replace('export', '').trim();
      return {
        success: true,
        output: LinuxSimulator.exportCmd(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // history
    if (command === 'history') {
      return {
        success: true,
        output: LinuxSimulator.history(),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // ifconfig
    if (command === 'ifconfig') {
      return {
        success: true,
        output: LinuxSimulator.ifconfig(),
        isValid: true,
        pointsAwarded: 2,
        keywords: ['eth0', 'inet'],
        executionTime: Date.now() - startTime,
      };
    }

    // ip
    if (command === 'ip' || command.startsWith('ip ')) {
      const args = command.replace('ip', '').trim();
      return {
        success: true,
        output: LinuxSimulator.ip(args),
        isValid: true,
        pointsAwarded: 2,
        keywords: ['inet'],
        executionTime: Date.now() - startTime,
      };
    }

    // ping (limited to 4 packets simulation)
    if (command.startsWith('ping ')) {
      const target = command.split(' ').filter(p => !p.startsWith('-')).pop() || '';
      return {
        success: true,
        output: LinuxSimulator.ping(target),
        isValid: true,
        pointsAwarded: 2,
        keywords: ['icmp_seq'],
        executionTime: Date.now() - startTime,
      };
    }

    // netstat
    if (command === 'netstat' || command.startsWith('netstat ')) {
      const args = command.replace('netstat', '').trim();
      return {
        success: true,
        output: LinuxSimulator.netstat(args),
        isValid: true,
        pointsAwarded: 3,
        keywords: ['LISTEN', 'ESTABLISHED'],
        executionTime: Date.now() - startTime,
      };
    }

    // ps
    if (command === 'ps' || command.startsWith('ps ')) {
      const args = command.replace('ps', '').trim();
      return {
        success: true,
        output: LinuxSimulator.ps(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // top
    if (command === 'top') {
      return {
        success: true,
        output: LinuxSimulator.top(),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // free
    if (command === 'free' || command.startsWith('free ')) {
      const args = command.replace('free', '').trim();
      return {
        success: true,
        output: LinuxSimulator.free(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // df
    if (command === 'df' || command.startsWith('df ')) {
      const args = command.replace('df', '').trim();
      return {
        success: true,
        output: LinuxSimulator.df(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // which
    if (command.startsWith('which ')) {
      const cmd = command.replace('which ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.which(cmd),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // file
    if (command.startsWith('file ')) {
      const filename = command.replace('file ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.file(filename),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // wc
    if (command.startsWith('wc ')) {
      const args = command.replace('wc ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.wc(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // grep
    if (command.startsWith('grep ')) {
      const args = command.replace('grep ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.grep(args),
        isValid: true,
        pointsAwarded: 2,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // head
    if (command.startsWith('head ')) {
      const args = command.replace('head ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.head(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // tail
    if (command.startsWith('tail ')) {
      const args = command.replace('tail ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.tail(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // touch
    if (command.startsWith('touch ')) {
      const filename = command.replace('touch ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.touch(filename),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // mkdir
    if (command.startsWith('mkdir ')) {
      const dirname = command.replace('mkdir ', '').trim().replace('-p ', '');
      return {
        success: true,
        output: LinuxSimulator.mkdir(dirname),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // rm
    if (command.startsWith('rm ')) {
      const args = command.replace('rm ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.rm(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // cp
    if (command.startsWith('cp ')) {
      const args = command.replace('cp ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.cp(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // mv
    if (command.startsWith('mv ')) {
      const args = command.replace('mv ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.mv(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // chmod
    if (command.startsWith('chmod ')) {
      const args = command.replace('chmod ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.chmod(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // man
    if (command.startsWith('man ')) {
      const cmd = command.replace('man ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.man(cmd),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // curl
    if (command.startsWith('curl ')) {
      const args = command.replace('curl ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.curl(args),
        isValid: true,
        pointsAwarded: 3,
        keywords: ['HTTP'],
        executionTime: Date.now() - startTime,
      };
    }

    // wget
    if (command.startsWith('wget ')) {
      const args = command.replace('wget ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.wget(args),
        isValid: true,
        pointsAwarded: 3,
        keywords: ['saved'],
        executionTime: Date.now() - startTime,
      };
    }

    // ssh
    if (command.startsWith('ssh ')) {
      const args = command.replace('ssh ', '').trim();
      return {
        success: true,
        output: LinuxSimulator.ssh(args),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // nano - text editor
    if (command === 'nano' || command.startsWith('nano ')) {
      const filename = command.replace('nano', '').trim();
      return {
        success: true,
        output: LinuxSimulator.nano(filename),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // vim/vi - text editor
    if (command === 'vim' || command.startsWith('vim ') || command === 'vi' || command.startsWith('vi ')) {
      const filename = command.replace(/^(vim|vi)\s*/, '').trim();
      return {
        success: true,
        output: LinuxSimulator.vim(filename),
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // nc/netcat
    if (command.startsWith('nc ') || command.startsWith('netcat ')) {
      const args = command.replace(/^(nc|netcat) /, '').trim();
      return {
        success: true,
        output: LinuxSimulator.nc(args),
        isValid: true,
        pointsAwarded: 5,
        keywords: ['Connection'],
        executionTime: Date.now() - startTime,
      };
    }

    // sudo
    if (command.startsWith('sudo ')) {
      const subCommand = command.replace('sudo ', '').trim();
      const result = LinuxSimulator.sudo(subCommand);

      if (result.output) {
        return {
          success: true,
          output: `[sudo] password for student: \n${result.output}`,
          isValid: true,
          pointsAwarded: 5,
          keywords: ['sudo'],
          executionTime: Date.now() - startTime,
        };
      }

      // Execute the actual command with elevated privileges
      const subResult = this.execute(result.command);
      return {
        ...subResult,
        output: `[sudo] password for student: \n${subResult.output}`,
        pointsAwarded: subResult.pointsAwarded + 2,
      };
    }

    // ========== OSINT Commands ==========

    // OSINT commands - handle both with and without arguments
    if (command === 'whois' || command.startsWith('whois ')) {
      return this.executeWhois(command, startTime);
    }

    if (command === 'nslookup' || command.startsWith('nslookup ')) {
      return this.executeNslookup(command, startTime);
    }

    if (command === 'geoip' || command.startsWith('geoip ')) {
      return this.executeGeoip(command, startTime);
    }

    if (command === 'dig' || command.startsWith('dig ')) {
      return this.executeDig(command, startTime);
    }

    if (command === 'host' || command.startsWith('host ')) {
      return this.executeHost(command, startTime);
    }

    if (command === 'traceroute' || command.startsWith('traceroute ')) {
      return this.executeTraceroute(command, startTime);
    }

    // Nmap commands
    if (command === 'nmap' || command.startsWith('nmap ')) {
      return this.executeNmap(command, startTime);
    }

    // Vulnerability assessment commands
    if (command === 'searchsploit' || command.startsWith('searchsploit ')) {
      const query = command.replace('searchsploit ', '').replace('searchsploit', '').trim();
      if (!query) {
        return {
          success: false,
          output: 'Usage: searchsploit <search_term>\n\nExample: searchsploit apache 2.4',
          isValid: false,
          pointsAwarded: 0,
          keywords: [],
          executionTime: Date.now() - startTime,
        };
      }
      const output = VulnSimulator.searchsploit(query);
      return {
        success: true,
        output,
        isValid: true,
        pointsAwarded: 10,
        keywords: ['CVE', 'exploit'],
        executionTime: Date.now() - startTime,
      };
    }

    if (command === 'hashid' || command.startsWith('hashid ')) {
      const hash = command.replace('hashid ', '').replace('hashid', '').trim();
      if (!hash) {
        return {
          success: false,
          output: 'Usage: hashid <hash>\n\nExample: hashid 5f4dcc3b5aa765d61d8327deb882cf99',
          isValid: false,
          pointsAwarded: 0,
          keywords: [],
          executionTime: Date.now() - startTime,
        };
      }
      const output = VulnSimulator.hashid(hash);
      return {
        success: true,
        output,
        isValid: true,
        pointsAwarded: 5,
        keywords: ['MD5', 'SHA'],
        executionTime: Date.now() - startTime,
      };
    }

    if (command === 'john' || command.startsWith('john ')) {
      const hash = command.replace('john ', '').replace('john', '').trim();
      if (!hash) {
        return {
          success: false,
          output: 'John the Ripper password cracker\n\nUsage: john [OPTIONS] <password-files>\n\nExample: john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt',
          isValid: false,
          pointsAwarded: 0,
          keywords: [],
          executionTime: Date.now() - startTime,
        };
      }
      const output = VulnSimulator.john(hash);
      return {
        success: true,
        output,
        isValid: true,
        pointsAwarded: 15,
        keywords: ['password', 'cracked'],
        executionTime: Date.now() - startTime,
      };
    }

    if (command.startsWith('nikto ')) {
      const target = command.split(' ')[1];
      const output = VulnSimulator.nikto(target);
      return {
        success: true,
        output,
        isValid: true,
        pointsAwarded: 10,
        keywords: ['vulnerability', 'Apache'],
        executionTime: Date.now() - startTime,
      };
    }

    // Web exploitation commands
    if (command.startsWith('sqlmap ')) {
      const output = WebSimulator.sqlmap(command);
      return {
        success: true,
        output,
        isValid: true,
        pointsAwarded: 20,
        keywords: ['vulnerable', 'injection'],
        executionTime: Date.now() - startTime,
      };
    }

    if (command.startsWith('test-xss ')) {
      const parts = command.split(' ');
      const payload = parts.slice(1, -1).join(' ');
      const target = parts[parts.length - 1];
      const output = WebSimulator.testXss(payload, target);
      return {
        success: output.includes('DETECTED'),
        output,
        isValid: true,
        pointsAwarded: output.includes('DETECTED') ? 15 : 5,
        keywords: ['XSS', 'vulnerability'],
        executionTime: Date.now() - startTime,
      };
    }

    if (command.startsWith('dirb ') || command.startsWith('dirbuster ')) {
      const target = command.split(' ')[1];
      const output = WebSimulator.dirb(target);
      return {
        success: true,
        output,
        isValid: true,
        pointsAwarded: 10,
        keywords: ['admin', 'backup'],
        executionTime: Date.now() - startTime,
      };
    }

    // ========== Metasploit Framework Commands ==========
    if (command === 'msfconsole' || command.startsWith('msfconsole ')) {
      return this.executeMetasploit(command, startTime);
    }

    // MSF commands (when in msfconsole context)
    const msfCommands = ['search', 'use', 'info', 'show', 'set', 'setg', 'unset', 'options', 'run', 'exploit', 'back', 'sessions', 'db_status', 'workspace'];
    const firstWord = command.split(' ')[0].toLowerCase();
    if (msfCommands.includes(firstWord)) {
      return this.executeMetasploit(command, startTime);
    }

    // Meterpreter commands
    const meterpreterCommands = ['sysinfo', 'getuid', 'getsystem', 'hashdump', 'ps', 'shell', 'migrate', 'background', 'download', 'upload'];
    if (meterpreterCommands.includes(firstWord)) {
      return this.executeMeterpreter(command, startTime);
    }

    // ========== CTF Commands ==========
    if (command === 'ctf' || command.startsWith('ctf-')) {
      // TODO: Get userId from session context
      const userId = 'current-user';
      return this.executeCTF(command, userId, startTime);
    }

    if (command.startsWith('submit-flag ')) {
      const userId = 'current-user';
      return this.submitCTFFlag(command, userId, startTime);
    }

    // Unknown command
    return {
      success: false,
      output: `Command not found: ${command.split(' ')[0]}\nType 'help' to see available commands.`,
      isValid: false,
      pointsAwarded: 0,
      keywords: [],
      executionTime: Date.now() - startTime,
    };
  }

  private static helpCommand(startTime: number): CommandResult {
    const output = `
\x1b[1;36m╔══════════════════════════════════════════════════════════════════╗
║              PERINTAH TERMINAL YANG TERSEDIA                     ║
╚══════════════════════════════════════════════════════════════════╝\x1b[0m

\x1b[1;33m📂 NAVIGASI & FILE\x1b[0m
  pwd                         - Tampilkan direktori saat ini
  cd <path>                   - Pindah direktori (cd, cd .., cd ~)
  ls [-la]                    - Daftar isi direktori
  cat <file>                  - Tampilkan isi file
  head [-n N] <file>          - Tampilkan N baris pertama
  tail [-n N] <file>          - Tampilkan N baris terakhir
  touch <file>                - Buat file kosong
  mkdir <dir>                 - Buat direktori baru
  rm [-rf] <file>             - Hapus file/direktori
  cp <src> <dest>             - Salin file
  mv <src> <dest>             - Pindah/rename file
  chmod <mode> <file>         - Ubah permission file

\x1b[1;33m✏️  EDITOR TEKS\x1b[0m
  nano <file>                 - Editor teks sederhana
  vim <file>                  - Editor teks Vim
  vi <file>                   - Alias untuk Vim

\x1b[1;33m🔍 PENCARIAN & TEKS\x1b[0m
  grep <pattern> <file>       - Cari pola dalam file
  wc [-lwc] <file>            - Hitung baris/kata/karakter
  file <file>                 - Identifikasi tipe file
  which <command>             - Lokasi perintah

\x1b[1;33m💻 SISTEM\x1b[0m
  whoami                      - Tampilkan user saat ini
  id                          - Info identitas user
  hostname                    - Nama host sistem
  uname [-a]                  - Info sistem operasi
  date                        - Tanggal dan waktu
  uptime                      - Waktu sistem berjalan
  ps [aux]                    - Daftar proses
  top                         - Monitor proses (snapshot)
  free [-h]                   - Penggunaan memori
  df [-h]                     - Penggunaan disk
  env                         - Variabel environment
  export VAR=value            - Set variabel
  history                     - Riwayat perintah
  man <command>               - Manual/bantuan

\x1b[1;33m🌐 JARINGAN\x1b[0m
  ifconfig                    - Konfigurasi interface
  ip addr                     - Info IP address
  ping <host>                 - Test koneksi (4 paket)
  netstat [-tuln]             - Statistik jaringan
  curl <url>                  - Transfer data HTTP
  wget <url>                  - Download file
  ssh <host>                  - Secure shell (simulasi)
  nc <host> <port>            - Netcat utility

\x1b[1;33m🔒 SUDO\x1b[0m
  sudo <command>              - Jalankan sebagai root
  sudo cat /etc/shadow        - Baca file terproteksi

\x1b[1;36m═══════════════════════════════════════════════════════════════════\x1b[0m

\x1b[1;32m🎯 OSINT (Reconnaissance)\x1b[0m
  whois <domain>              - Lookup info domain
  nslookup <domain>           - DNS lookup
  dig <domain> [type]         - DNS query (A, MX, NS, TXT)
  host <domain>               - Simple DNS lookup
  geoip <ip>                  - IP geolocation
  traceroute <host>           - Trace route

\x1b[1;32m📡 NETWORK SCANNING (Nmap)\x1b[0m
  nmap -sn <network>          - Ping scan (host discovery)
  nmap -sS <target>           - TCP SYN scan (stealth)
  nmap -sV <target>           - Service version detection
  nmap -O <target>            - OS detection
  nmap -A <target>            - Aggressive scan
  nmap -sU <target>           - UDP scan

\x1b[1;32m🔓 VULNERABILITY ASSESSMENT\x1b[0m
  searchsploit <query>        - Cari exploit database
  hashid <hash>               - Identifikasi tipe hash
  john <hash>                 - Crack password hash
  nikto <target>              - Web vulnerability scanner

\x1b[1;32m🕷️ WEB EXPLOITATION\x1b[0m
  sqlmap --url <url>          - SQL injection testing
  test-xss <payload> <url>    - XSS vulnerability testing
  dirb <target>               - Directory brute force

\x1b[1;32m💀 METASPLOIT FRAMEWORK\x1b[0m
  msfconsole                  - Launch Metasploit console
  search <term>               - Search for modules
  use <module>                - Select a module
  info                        - Show module information
  options                     - Show module options
  set <option> <value>        - Set an option value
  run / exploit               - Execute the module
  sessions                    - List active sessions
  back                        - Go back to main console

\x1b[1;32m🎭 METERPRETER (Post-Exploitation)\x1b[0m
  sysinfo                     - Get system information
  getuid                      - Get current user ID
  getsystem                   - Attempt privilege escalation
  hashdump                    - Dump password hashes
  ps                          - List processes
  shell                       - Drop to system shell
  download <file>             - Download file from target
  upload <file>               - Upload file to target

\x1b[1;32m🏁 CTF CHALLENGES\x1b[0m
  ctf                         - CTF help menu
  ctf-list [category]         - List available challenges
  ctf-info <id>               - Show challenge details
  ctf-progress                - Show your progress
  ctf-leaderboard             - Show leaderboard
  submit-flag <id> <flag>     - Submit a flag

\x1b[1;36m═══════════════════════════════════════════════════════════════════\x1b[0m

\x1b[1;35m📝 TEXT PROCESSING (NEW!)\x1b[0m
  awk '<program>' <file>      - Pattern scanning & processing
  sed 's/old/new/g' <file>    - Stream editor
  cut -d',' -f1 <file>        - Cut sections from lines
  sort [-rn] <file>           - Sort lines
  uniq [-c] <file>            - Report/omit repeated lines
  tr 'a-z' 'A-Z'              - Translate characters
  diff <file1> <file2>        - Compare files
  less <file>                 - Pager for viewing files

\x1b[1;35m🔗 FILE UTILITIES (NEW!)\x1b[0m
  find <path> -name '*.txt'   - Search for files
  ln -s <src> <dest>          - Create symbolic link
  du -sh <path>               - Disk usage
  stat <file>                 - File statistics
  chown <owner> <file>        - Change file owner

\x1b[1;35m⚙️ PROCESS CONTROL (NEW!)\x1b[0m
  kill [-9] <pid>             - Send signal to process
  jobs                        - List background jobs
  bg [job]                    - Resume job in background
  fg [job]                    - Bring job to foreground

\x1b[1;35m📦 ARCHIVE (NEW!)\x1b[0m
  tar -cvzf <file>.tar.gz     - Create archive
  tar -xvzf <file>.tar.gz     - Extract archive
  gzip <file>                 - Compress file
  gunzip <file>.gz            - Decompress file
  zip <archive> <files>       - Create ZIP archive
  unzip <archive>             - Extract ZIP archive

\x1b[1;35m🔌 NETWORK ADVANCED (NEW!)\x1b[0m
  arp [-a]                    - ARP table
  ss [-tuln]                  - Socket statistics
  tcpdump [-i eth0]           - Packet capture
  lsof [-i]                   - List open files

\x1b[1;35m⛓️ PIPES & REDIRECTION (NEW!)\x1b[0m
  cmd1 | cmd2                 - Pipe output to next command
  cmd > file                  - Redirect output (overwrite)
  cmd >> file                 - Redirect output (append)
  cmd1 && cmd2                - Run cmd2 if cmd1 succeeds
  cmd1 || cmd2                - Run cmd2 if cmd1 fails

\x1b[1;33m⚡ TIPS\x1b[0m
  clear / Ctrl+L              - Bersihkan layar
  Ctrl+C                      - Batalkan perintah
  ↑ / ↓                       - Navigasi history
    `.trim();

    return {
      success: true,
      output,
      isValid: true,
      pointsAwarded: 0,
      keywords: [],
      executionTime: Date.now() - startTime,
    };
  }

  private static executeWhois(command: string, startTime: number): CommandResult {
    const domain = command.replace(/^whois\s*/, '').trim();

    if (!domain) {
      return {
        success: false,
        output: 'Usage: whois <domain>\n\nExample: whois google.com',
        isValid: false,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    const result = OsintSimulator.whois(domain);

    return {
      success: result.success,
      output: result.output,
      isValid: result.success,
      pointsAwarded: result.success ? 10 : 0,
      keywords: result.keywords,
      executionTime: Date.now() - startTime,
    };
  }

  private static executeNslookup(command: string, startTime: number): CommandResult {
    const domain = command.replace(/^nslookup\s*/, '').trim();

    if (!domain) {
      return {
        success: false,
        output: 'Usage: nslookup <domain>\n\nExample: nslookup google.com',
        isValid: false,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    const result = OsintSimulator.nslookup(domain);

    return {
      success: result.success,
      output: result.output,
      isValid: result.success,
      pointsAwarded: result.success ? 10 : 0,
      keywords: result.keywords,
      executionTime: Date.now() - startTime,
    };
  }

  private static executeGeoip(command: string, startTime: number): CommandResult {
    const ip = command.replace(/^geoip\s*/, '').trim();

    if (!ip) {
      return {
        success: false,
        output: 'Usage: geoip <ip_address>',
        isValid: false,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    const result = OsintSimulator.geoip(ip);

    return {
      success: result.success,
      output: result.output,
      isValid: result.success,
      pointsAwarded: result.success ? 10 : 0,
      keywords: result.keywords,
      executionTime: Date.now() - startTime,
    };
  }

  private static executeDig(command: string, startTime: number): CommandResult {
    const parts = command.replace(/^dig\s*/, '').trim().split(' ');
    const domain = parts[0];
    const type = parts[1] || 'A';

    if (!domain) {
      return {
        success: false,
        output: 'Usage: dig <domain> [type]\n\nExample: dig google.com A',
        isValid: false,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    const result = OsintSimulator.dig(domain, type);

    return {
      success: result.success,
      output: result.output,
      isValid: result.success,
      pointsAwarded: result.success ? 10 : 0,
      keywords: result.keywords,
      executionTime: Date.now() - startTime,
    };
  }

  private static executeHost(command: string, startTime: number): CommandResult {
    const domain = command.replace(/^host\s*/, '').trim();

    if (!domain) {
      return {
        success: false,
        output: 'Usage: host <domain>\n\nExample: host google.com',
        isValid: false,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    const result = OsintSimulator.host(domain);

    return {
      success: result.success,
      output: result.output,
      isValid: result.success,
      pointsAwarded: result.success ? 5 : 0,
      keywords: result.keywords,
      executionTime: Date.now() - startTime,
    };
  }

  private static executeTraceroute(command: string, startTime: number): CommandResult {
    const target = command.replace(/^traceroute\s*/, '').trim();

    if (!target) {
      return {
        success: false,
        output: 'Usage: traceroute <host>\n\nExample: traceroute google.com',
        isValid: false,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    const result = OsintSimulator.traceroute(target);

    return {
      success: result.success,
      output: result.output,
      isValid: result.success,
      pointsAwarded: result.success ? 5 : 0,
      keywords: result.keywords,
      executionTime: Date.now() - startTime,
    };
  }

  private static executeNmap(command: string, startTime: number): CommandResult {
    let output = '';
    let success = false;

    // Handle nmap without any arguments
    if (command === 'nmap') {
      return {
        success: false,
        output: `Nmap 7.94 ( https://nmap.org )
Usage: nmap [Scan Type(s)] [Options] <target specification>

TARGET SPECIFICATION:
  Can pass hostnames, IP addresses, networks, etc.
  Ex: scanme.nmap.org, 192.168.0.1, 10.0.0.0/24

SCAN TECHNIQUES:
  -sS   TCP SYN scan (default)
  -sT   TCP connect scan
  -sU   UDP scan
  -sV   Service version detection
  -sn   Ping scan (no port scan)
  -A    Enable OS detection, version detection, script scanning

Example: nmap -sV 192.168.1.1`,
        isValid: false,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // Parse nmap options
    if (command.includes('-sn')) {
      const network = command.split(' ').pop() || '';
      output = NmapSimulator.pingScan(network);
      success = true;
    } else if (command.includes('-sS')) {
      const target = command.split(' ').pop() || '';
      output = NmapSimulator.synScan(target);
      success = true;
    } else if (command.includes('-sV')) {
      const target = command.split(' ').pop() || '';
      output = NmapSimulator.versionScan(target);
      success = true;
    } else if (command.includes('-O')) {
      const target = command.split(' ').pop() || '';
      output = NmapSimulator.osDetection(target);
      success = true;
    } else if (command.includes('-A')) {
      const target = command.split(' ').pop() || '';
      output = NmapSimulator.aggressiveScan(target);
      success = true;
    } else if (command.includes('-sU')) {
      const target = command.split(' ').pop() || '';
      output = NmapSimulator.udpScan(target);
      success = true;
    } else {
      output = 'Usage: nmap [options] <target>\nType "help" for available options';
      success = false;
    }

    return {
      success,
      output,
      isValid: success,
      pointsAwarded: success ? 10 : 0,
      keywords: success ? ['Nmap', 'scan'] : [],
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute Metasploit commands
   */
  private static executeMetasploit(command: string, startTime: number): CommandResult {
    const output = MetasploitSimulator.execute(command);

    return {
      success: true,
      output,
      isValid: true,
      pointsAwarded: command.includes('exploit') || command.includes('run') ? 15 : 5,
      keywords: ['metasploit', 'msf'],
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute Meterpreter commands
   */
  private static executeMeterpreter(command: string, startTime: number): CommandResult {
    const output = MetasploitSimulator.meterpreterCommand(command);

    return {
      success: true,
      output,
      isValid: true,
      pointsAwarded: command.includes('hashdump') || command.includes('getsystem') ? 20 : 5,
      keywords: ['meterpreter', 'post-exploitation'],
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute CTF commands
   */
  private static executeCTF(command: string, userId: string, startTime: number): CommandResult {
    const output = CTFSystem.executeCommand(command, userId);

    return {
      success: true,
      output,
      isValid: true,
      pointsAwarded: 0,
      keywords: ['ctf'],
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Submit CTF flag
   */
  private static submitCTFFlag(command: string, userId: string, startTime: number): CommandResult {
    const args = command.replace('submit-flag', '').trim().split(/\s+/);

    if (args.length < 2) {
      return {
        success: false,
        output: 'Usage: submit-flag <challenge-id> <flag>',
        isValid: false,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    const [challengeId, ...flagParts] = args;
    const flag = flagParts.join(' ');

    const result = CTFSystem.submitFlag(userId, challengeId, flag);

    return {
      success: result.correct,
      output: result.message,
      isValid: true,
      pointsAwarded: result.pointsAwarded,
      keywords: result.correct ? ['ctf', 'solved'] : ['ctf'],
      executionTime: Date.now() - startTime,
    };
  }

  // ========== PIPE & REDIRECTION SUPPORT ==========

  /**
   * Execute commands connected by pipes (|)
   * Takes output of each command and passes it to the next
   */
  private static executePipedCommands(command: string, startTime: number): CommandResult {
    const commands = command.split(' | ').map(c => c.trim());
    let pipeOutput = '';
    let totalPoints = 0;
    const allKeywords: string[] = [];

    for (let i = 0; i < commands.length; i++) {
      let cmd = commands[i];

      // For subsequent commands, we need to handle piped input
      if (i > 0 && pipeOutput) {
        // Handle commands that can accept piped input
        const result = this.executeWithPipedInput(cmd, pipeOutput, startTime);
        pipeOutput = result.output;
        totalPoints += result.pointsAwarded;
        allKeywords.push(...result.keywords);

        if (!result.success) {
          return {
            success: false,
            output: result.output,
            isValid: false,
            pointsAwarded: totalPoints,
            keywords: allKeywords,
            executionTime: Date.now() - startTime,
          };
        }
      } else {
        // First command in the pipe
        const result = this.executeSingleCommand(cmd, startTime);
        pipeOutput = result.output;
        totalPoints += result.pointsAwarded;
        allKeywords.push(...result.keywords);
      }
    }

    return {
      success: true,
      output: pipeOutput,
      isValid: true,
      pointsAwarded: totalPoints,
      keywords: allKeywords,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute a command with piped input
   */
  private static executeWithPipedInput(cmd: string, input: string, startTime: number): CommandResult {
    const parts = cmd.split(' ');
    const command = parts[0];
    const args = parts.slice(1).join(' ');

    let output = '';

    switch (command) {
      case 'grep': {
        const pattern = args.replace(/['"]/g, '');
        const lines = input.split('\n');
        const matched = lines.filter(line =>
          line.toLowerCase().includes(pattern.toLowerCase())
        );
        output = matched.join('\n');
        break;
      }
      case 'head': {
        const numMatch = args.match(/-n\s*(\d+)|-(\d+)/);
        const n = numMatch ? parseInt(numMatch[1] || numMatch[2]) : 10;
        output = input.split('\n').slice(0, n).join('\n');
        break;
      }
      case 'tail': {
        const numMatch = args.match(/-n\s*(\d+)|-(\d+)/);
        const n = numMatch ? parseInt(numMatch[1] || numMatch[2]) : 10;
        const lines = input.split('\n');
        output = lines.slice(-n).join('\n');
        break;
      }
      case 'wc': {
        const lines = input.split('\n');
        const words = input.split(/\s+/).filter(w => w.length > 0);
        const chars = input.length;
        if (args.includes('-l')) {
          output = String(lines.length);
        } else if (args.includes('-w')) {
          output = String(words.length);
        } else if (args.includes('-c')) {
          output = String(chars);
        } else {
          output = `${lines.length} ${words.length} ${chars}`;
        }
        break;
      }
      case 'sort': {
        const lines = input.split('\n').filter(l => l.length > 0);
        if (args.includes('-r')) {
          lines.sort().reverse();
        } else if (args.includes('-n')) {
          lines.sort((a, b) => parseFloat(a) - parseFloat(b));
        } else {
          lines.sort();
        }
        output = lines.join('\n');
        break;
      }
      case 'uniq': {
        const lines = input.split('\n');
        const unique = Array.from(new Set(lines));
        output = unique.join('\n');
        break;
      }
      case 'tr': {
        // Parse tr arguments like 'a-z' 'A-Z'
        const trArgs = args.match(/['"]([^'"]+)['"]|(\S+)/g) || [];
        if (trArgs.length >= 2 && trArgs[0] && trArgs[1]) {
          const from = trArgs[0].replace(/['"]/g, '');
          const to = trArgs[1].replace(/['"]/g, '');

          if (from === 'a-z' && to === 'A-Z') {
            output = input.toUpperCase();
          } else if (from === 'A-Z' && to === 'a-z') {
            output = input.toLowerCase();
          } else if (args.includes('-d')) {
            // Delete characters
            const pattern = from.replace(/\\/g, '');
            output = input.replace(new RegExp(`[${pattern}]`, 'g'), '');
          } else {
            output = input;
          }
        } else {
          output = input;
        }
        break;
      }
      case 'cut': {
        const lines = input.split('\n');
        let delimiter = '\t';
        let fields: number[] = [];

        const dMatch = args.match(/-d\s*['"]?([^'"'\s]+)['"]?/);
        if (dMatch) delimiter = dMatch[1];

        const fMatch = args.match(/-f\s*(\S+)/);
        if (fMatch) {
          fields = fMatch[1].split(',').map(f => parseInt(f));
        }

        output = lines.map(line => {
          const cols = line.split(delimiter);
          return fields.map(f => cols[f - 1] || '').join(delimiter);
        }).join('\n');
        break;
      }
      case 'awk': {
        // Simple awk for piped input
        const awkMatch = args.match(/['"](.+)['"]/);
        if (awkMatch) {
          const program = awkMatch[1];
          const lines = input.split('\n');

          if (program.includes('print $')) {
            const fieldMatch = program.match(/print \$(\d+)/);
            if (fieldMatch) {
              const fieldNum = parseInt(fieldMatch[1]);
              output = lines.map(line => {
                const fields = line.split(/\s+/);
                return fieldNum === 0 ? line : (fields[fieldNum - 1] || '');
              }).join('\n');
            }
          } else {
            output = input;
          }
        } else {
          output = input;
        }
        break;
      }
      case 'sed': {
        const sedMatch = args.match(/['"]s\/(.+?)\/(.+?)\/([gi]*)['"]|s\/(.+?)\/(.+?)\/([gi]*)/);
        if (sedMatch) {
          const pattern = sedMatch[1] || sedMatch[4];
          const replacement = sedMatch[2] || sedMatch[5];
          const flags = sedMatch[3] || sedMatch[6] || '';
          const regex = new RegExp(pattern, flags.includes('g') ? 'g' : '');
          output = input.replace(regex, replacement);
        } else {
          output = input;
        }
        break;
      }
      case 'tee': {
        // tee outputs to both stdout and file
        output = input;
        break;
      }
      case 'xargs': {
        // Simple xargs - just pass through for now
        output = `[xargs received: ${input.split('\n').length} arguments]`;
        break;
      }
      case 'cat': {
        output = input;
        break;
      }
      default:
        output = `[Pipe to '${command}' - simulated]\n${input}`;
    }

    return {
      success: true,
      output,
      isValid: true,
      pointsAwarded: 1,
      keywords: ['pipe'],
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute command with output redirection (> or >>)
   */
  private static executeWithRedirection(command: string, startTime: number): CommandResult {
    let append = false;
    let parts: string[];

    if (command.includes(' >> ')) {
      append = true;
      parts = command.split(' >> ');
    } else {
      parts = command.split(' > ');
    }

    if (parts.length !== 2) {
      return {
        success: false,
        output: 'Invalid redirection syntax',
        isValid: false,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    const cmd = parts[0].trim();
    const targetFile = parts[1].trim();

    // Execute the command
    const result = this.executeSingleCommand(cmd, startTime);

    // Simulate writing to file
    return {
      success: true,
      output: `[Output ${append ? 'appended to' : 'written to'} ${targetFile}]`,
      isValid: true,
      pointsAwarded: result.pointsAwarded,
      keywords: [...result.keywords, 'redirect'],
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute commands chained with && or ||
   */
  private static executeChainedCommands(command: string, operator: '&&' | '||', startTime: number): CommandResult {
    const commands = command.split(` ${operator} `).map(c => c.trim());
    const outputs: string[] = [];
    let totalPoints = 0;
    const allKeywords: string[] = [];
    let lastSuccess = true;

    for (const cmd of commands) {
      // For &&, only run if previous succeeded
      // For ||, only run if previous failed
      if ((operator === '&&' && !lastSuccess) || (operator === '||' && lastSuccess)) {
        break;
      }

      const result = this.executeSingleCommand(cmd, startTime);
      outputs.push(result.output);
      totalPoints += result.pointsAwarded;
      allKeywords.push(...result.keywords);
      lastSuccess = result.success;
    }

    return {
      success: lastSuccess,
      output: outputs.join('\n'),
      isValid: true,
      pointsAwarded: totalPoints,
      keywords: allKeywords,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute a single command without pipes/redirects
   * This wraps the main execute logic for use by pipe handlers
   */
  private static executeSingleCommand(command: string, startTime: number): CommandResult {
    // Temporarily store and call execute, but prevent infinite recursion
    // by checking for special characters
    if (command.includes(' | ') || command.includes(' > ') || command.includes(' && ') || command.includes(' || ')) {
      return {
        success: false,
        output: 'Nested pipes/redirects not supported',
        isValid: false,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // Call the basic command handler first
    const basicResult = this.executeBasicCommand(command, startTime);

    // If basic handler returned fallthrough, try other handlers
    if (basicResult.output.startsWith('__FALLTHROUGH__:')) {
      return this.executeAdvancedCommand(command, startTime);
    }

    return basicResult;
  }

  /**
   * Execute advanced commands (OSINT, Nmap, Vuln, Web, Metasploit, CTF)
   */
  private static executeAdvancedCommand(command: string, startTime: number): CommandResult {
    // OSINT commands
    if (command.startsWith('whois ')) {
      return this.executeWhois(command, startTime);
    }
    if (command.startsWith('nslookup ')) {
      return this.executeNslookup(command, startTime);
    }
    if (command.startsWith('geoip ')) {
      return this.executeGeoip(command, startTime);
    }
    if (command.startsWith('dig ')) {
      return this.executeDig(command, startTime);
    }
    if (command.startsWith('host ')) {
      return this.executeHost(command, startTime);
    }
    if (command.startsWith('traceroute ')) {
      return this.executeTraceroute(command, startTime);
    }

    // Nmap commands
    if (command.startsWith('nmap ')) {
      return this.executeNmap(command, startTime);
    }

    // Vulnerability assessment commands
    if (command.startsWith('searchsploit ')) {
      const query = command.replace('searchsploit ', '').trim();
      const output = VulnSimulator.searchsploit(query);
      return { success: true, output, isValid: true, pointsAwarded: 10, keywords: ['CVE', 'exploit'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('hashid ')) {
      const hash = command.replace('hashid ', '').trim();
      const output = VulnSimulator.hashid(hash);
      return { success: true, output, isValid: true, pointsAwarded: 5, keywords: ['MD5', 'SHA'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('john ')) {
      const hash = command.replace('john ', '').trim();
      const output = VulnSimulator.john(hash);
      return { success: true, output, isValid: true, pointsAwarded: 15, keywords: ['password', 'cracked'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('nikto ')) {
      const target = command.split(' ')[1];
      const output = VulnSimulator.nikto(target);
      return { success: true, output, isValid: true, pointsAwarded: 10, keywords: ['vulnerability', 'Apache'], executionTime: Date.now() - startTime };
    }

    // Web exploitation commands
    if (command.startsWith('sqlmap ')) {
      const output = WebSimulator.sqlmap(command);
      return { success: true, output, isValid: true, pointsAwarded: 20, keywords: ['vulnerable', 'injection'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('test-xss ')) {
      const parts = command.split(' ');
      const payload = parts.slice(1, -1).join(' ');
      const target = parts[parts.length - 1];
      const output = WebSimulator.testXss(payload, target);
      return { success: output.includes('DETECTED'), output, isValid: true, pointsAwarded: output.includes('DETECTED') ? 15 : 5, keywords: ['XSS', 'vulnerability'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('dirb ') || command.startsWith('dirbuster ')) {
      const target = command.split(' ')[1];
      const output = WebSimulator.dirb(target);
      return { success: true, output, isValid: true, pointsAwarded: 10, keywords: ['admin', 'backup'], executionTime: Date.now() - startTime };
    }

    // Metasploit Framework Commands
    if (command === 'msfconsole' || command.startsWith('msfconsole ')) {
      return this.executeMetasploit(command, startTime);
    }
    const msfCommands = ['search', 'use', 'info', 'show', 'set', 'setg', 'unset', 'options', 'run', 'exploit', 'back', 'sessions', 'db_status', 'workspace'];
    const firstWord = command.split(' ')[0].toLowerCase();
    if (msfCommands.includes(firstWord)) {
      return this.executeMetasploit(command, startTime);
    }

    // Meterpreter commands
    const meterpreterCommands = ['sysinfo', 'getuid', 'getsystem', 'hashdump', 'shell', 'migrate', 'background', 'download', 'upload'];
    if (meterpreterCommands.includes(firstWord)) {
      return this.executeMeterpreter(command, startTime);
    }

    // CTF Commands
    if (command === 'ctf' || command.startsWith('ctf-')) {
      const userId = 'current-user';
      return this.executeCTF(command, userId, startTime);
    }
    if (command.startsWith('submit-flag ')) {
      const userId = 'current-user';
      return this.submitCTFFlag(command, userId, startTime);
    }

    // Remaining Linux commands that weren't in basicCommand
    if (command.startsWith('ping ')) {
      const target = command.split(' ').filter(p => !p.startsWith('-')).pop() || '';
      return { success: true, output: LinuxSimulator.ping(target), isValid: true, pointsAwarded: 2, keywords: ['icmp_seq'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('netstat ') || command === 'netstat') {
      const args = command.replace('netstat', '').trim();
      return { success: true, output: LinuxSimulator.netstat(args), isValid: true, pointsAwarded: 3, keywords: ['LISTEN', 'ESTABLISHED'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('ip ') || command === 'ip') {
      const args = command.replace('ip', '').trim();
      return { success: true, output: LinuxSimulator.ip(args), isValid: true, pointsAwarded: 2, keywords: ['inet'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('ps ') || command === 'ps') {
      const args = command.replace('ps', '').trim();
      return { success: true, output: LinuxSimulator.ps(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('free ') || command === 'free') {
      const args = command.replace('free', '').trim();
      return { success: true, output: LinuxSimulator.free(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('df ') || command === 'df') {
      const args = command.replace('df', '').trim();
      return { success: true, output: LinuxSimulator.df(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('export ') || command === 'export') {
      const args = command.replace('export', '').trim();
      return { success: true, output: LinuxSimulator.exportCmd(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('which ')) {
      const cmd = command.replace('which ', '').trim();
      return { success: true, output: LinuxSimulator.which(cmd), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('file ')) {
      const filename = command.replace('file ', '').trim();
      return { success: true, output: LinuxSimulator.file(filename), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('wc ')) {
      const args = command.replace('wc ', '').trim();
      return { success: true, output: LinuxSimulator.wc(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('grep ')) {
      const args = command.replace('grep ', '').trim();
      return { success: true, output: LinuxSimulator.grep(args), isValid: true, pointsAwarded: 2, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('head ')) {
      const args = command.replace('head ', '').trim();
      return { success: true, output: LinuxSimulator.head(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('tail ')) {
      const args = command.replace('tail ', '').trim();
      return { success: true, output: LinuxSimulator.tail(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('touch ')) {
      const filename = command.replace('touch ', '').trim();
      return { success: true, output: LinuxSimulator.touch(filename), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('mkdir ')) {
      const dirname = command.replace('mkdir ', '').trim().replace('-p ', '');
      return { success: true, output: LinuxSimulator.mkdir(dirname), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('rm ')) {
      const args = command.replace('rm ', '').trim();
      return { success: true, output: LinuxSimulator.rm(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('cp ')) {
      const args = command.replace('cp ', '').trim();
      return { success: true, output: LinuxSimulator.cp(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('mv ')) {
      const args = command.replace('mv ', '').trim();
      return { success: true, output: LinuxSimulator.mv(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('chmod ')) {
      const args = command.replace('chmod ', '').trim();
      return { success: true, output: LinuxSimulator.chmod(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('man ')) {
      const cmd = command.replace('man ', '').trim();
      return { success: true, output: LinuxSimulator.man(cmd), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('curl ')) {
      const args = command.replace('curl ', '').trim();
      return { success: true, output: LinuxSimulator.curl(args), isValid: true, pointsAwarded: 3, keywords: ['HTTP'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('wget ')) {
      const args = command.replace('wget ', '').trim();
      return { success: true, output: LinuxSimulator.wget(args), isValid: true, pointsAwarded: 3, keywords: ['saved'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('ssh ')) {
      const args = command.replace('ssh ', '').trim();
      return { success: true, output: LinuxSimulator.ssh(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'nano' || command.startsWith('nano ')) {
      const filename = command.replace('nano', '').trim();
      return { success: true, output: LinuxSimulator.nano(filename), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'vim' || command.startsWith('vim ') || command === 'vi' || command.startsWith('vi ')) {
      const filename = command.replace(/^(vim|vi)\s*/, '').trim();
      return { success: true, output: LinuxSimulator.vim(filename), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('nc ') || command.startsWith('netcat ')) {
      const args = command.replace(/^(nc|netcat) /, '').trim();
      return { success: true, output: LinuxSimulator.nc(args), isValid: true, pointsAwarded: 5, keywords: ['Connection'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('sudo ')) {
      const subCommand = command.replace('sudo ', '').trim();
      const result = LinuxSimulator.sudo(subCommand);
      if (result.output) {
        return { success: true, output: `[sudo] password for student: \n${result.output}`, isValid: true, pointsAwarded: 5, keywords: ['sudo'], executionTime: Date.now() - startTime };
      }
      const subResult = this.executeSingleCommand(result.command, startTime);
      return { ...subResult, output: `[sudo] password for student: \n${subResult.output}`, pointsAwarded: subResult.pointsAwarded + 2 };
    }

    // Unknown command
    return {
      success: false,
      output: `Command not found: ${command.split(' ')[0]}\nType 'help' to see available commands.`,
      isValid: false,
      pointsAwarded: 0,
      keywords: [],
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Execute basic command without pipe/redirect handling
   */
  private static executeBasicCommand(command: string, startTime: number): CommandResult {
    // Help command
    if (command === 'help' || command === '--help') {
      return this.helpCommand(startTime);
    }

    // Clear command
    if (command === 'clear' || command === 'cls') {
      return {
        success: true,
        output: '',
        isValid: true,
        pointsAwarded: 0,
        keywords: [],
        executionTime: Date.now() - startTime,
      };
    }

    // Basic Linux commands
    if (command === 'whoami') {
      return { success: true, output: LinuxSimulator.whoami(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'id') {
      return { success: true, output: LinuxSimulator.id(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'hostname') {
      return { success: true, output: LinuxSimulator.hostname(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'pwd') {
      return { success: true, output: LinuxSimulator.pwd(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'date') {
      return { success: true, output: LinuxSimulator.date(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'uptime') {
      return { success: true, output: LinuxSimulator.uptime(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'env') {
      return { success: true, output: LinuxSimulator.env(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'history') {
      return { success: true, output: LinuxSimulator.history(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'ifconfig') {
      return { success: true, output: LinuxSimulator.ifconfig(), isValid: true, pointsAwarded: 2, keywords: ['eth0', 'inet'], executionTime: Date.now() - startTime };
    }
    if (command === 'jobs') {
      return { success: true, output: LinuxSimulator.jobs(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'exit') {
      return { success: true, output: LinuxSimulator.exit(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'alias') {
      return { success: true, output: LinuxSimulator.alias(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'mount') {
      return { success: true, output: LinuxSimulator.mount(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'groups') {
      return { success: true, output: LinuxSimulator.groups(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'dmesg') {
      return { success: true, output: LinuxSimulator.dmesg(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'top') {
      return { success: true, output: LinuxSimulator.top(), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }

    // Commands with arguments
    if (command.startsWith('uname ') || command === 'uname') {
      return { success: true, output: LinuxSimulator.uname(command.replace('uname', '').trim()), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('cd ') || command === 'cd') {
      const output = LinuxSimulator.cd(command.replace('cd', '').trim());
      return { success: !output.includes('No such file'), output, isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'ls' || command.startsWith('ls ') || command === 'll' || command.startsWith('ll ')) {
      let args = command;
      if (command === 'll') args = '-la';
      else if (command.startsWith('ll ')) args = '-la ' + command.substring(3);
      else args = command.replace('ls', '').trim();
      return { success: true, output: LinuxSimulator.ls(args), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('cat ')) {
      const output = LinuxSimulator.cat(command.replace('cat ', '').trim());
      return { success: !output.includes('No such file'), output, isValid: true, pointsAwarded: 2, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('echo ')) {
      return { success: true, output: LinuxSimulator.echo(command.replace('echo ', '')), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }

    // New text processing commands
    if (command.startsWith('awk ')) {
      return { success: true, output: LinuxSimulator.awk(command.replace('awk ', '')), isValid: true, pointsAwarded: 2, keywords: ['awk'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('sed ')) {
      return { success: true, output: LinuxSimulator.sed(command.replace('sed ', '')), isValid: true, pointsAwarded: 2, keywords: ['sed'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('cut ')) {
      return { success: true, output: LinuxSimulator.cut(command.replace('cut ', '')), isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('sort ')) {
      return { success: true, output: LinuxSimulator.sort(command.replace('sort ', '')), isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('uniq ')) {
      return { success: true, output: LinuxSimulator.uniq(command.replace('uniq ', '')), isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command === 'tr' || command.startsWith('tr ')) {
      return { success: true, output: LinuxSimulator.tr(command.replace('tr ', '')), isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('diff ')) {
      return { success: true, output: LinuxSimulator.diff(command.replace('diff ', '')), isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('less ') || command.startsWith('more ')) {
      return { success: true, output: LinuxSimulator.less(command.replace(/^(less|more) /, '')), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }

    // File utility commands
    if (command.startsWith('find ') || command === 'find') {
      return { success: true, output: LinuxSimulator.find(command.replace('find', '').trim()), isValid: true, pointsAwarded: 2, keywords: ['find'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('ln ')) {
      return { success: true, output: LinuxSimulator.ln(command.replace('ln ', '')), isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('du ') || command === 'du') {
      return { success: true, output: LinuxSimulator.du(command.replace('du', '').trim()), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('stat ')) {
      return { success: true, output: LinuxSimulator.stat(command.replace('stat ', '')), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('chown ')) {
      return { success: true, output: LinuxSimulator.chown(command.replace('chown ', '')), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }

    // Process control
    if (command.startsWith('kill ') || command === 'kill -l') {
      return { success: true, output: LinuxSimulator.kill(command.replace('kill ', '')), isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('bg ') || command === 'bg') {
      return { success: true, output: LinuxSimulator.bg(command.replace('bg', '').trim()), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('fg ') || command === 'fg') {
      return { success: true, output: LinuxSimulator.fg(command.replace('fg', '').trim()), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }

    // Archive commands
    if (command.startsWith('tar ')) {
      return { success: true, output: LinuxSimulator.tar(command.replace('tar ', '')), isValid: true, pointsAwarded: 2, keywords: ['tar'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('gzip ') || command.startsWith('gunzip ')) {
      const args = command.replace(/^g(un)?zip /, '');
      const output = command.startsWith('gunzip') ? LinuxSimulator.gunzip(args) : LinuxSimulator.gzip(args);
      return { success: true, output, isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('zip ')) {
      return { success: true, output: LinuxSimulator.zip(command.replace('zip ', '')), isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('unzip ')) {
      return { success: true, output: LinuxSimulator.unzip(command.replace('unzip ', '')), isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }

    // Network commands
    if (command.startsWith('arp ') || command === 'arp') {
      return { success: true, output: LinuxSimulator.arp(command.replace('arp', '').trim()), isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('ss ') || command === 'ss') {
      return { success: true, output: LinuxSimulator.ss(command.replace('ss', '').trim()), isValid: true, pointsAwarded: 2, keywords: ['ss'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('tcpdump ') || command === 'tcpdump') {
      return { success: true, output: LinuxSimulator.tcpdump(command.replace('tcpdump', '').trim()), isValid: true, pointsAwarded: 5, keywords: ['tcpdump', 'capture'], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('lsof ') || command === 'lsof') {
      return { success: true, output: LinuxSimulator.lsof(command.replace('lsof', '').trim()), isValid: true, pointsAwarded: 1, keywords: [], executionTime: Date.now() - startTime };
    }

    // Misc commands
    if (command.startsWith('source ') || command.startsWith('. ')) {
      return { success: true, output: LinuxSimulator.source(command.replace(/^(source|\.) /, '')), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('passwd ') || command === 'passwd') {
      return { success: true, output: LinuxSimulator.passwd(command.replace('passwd', '').trim()), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('su ') || command === 'su') {
      return { success: true, output: LinuxSimulator.su(command.replace('su', '').trim()), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('dmesg ')) {
      return { success: true, output: LinuxSimulator.dmesg(command.replace('dmesg ', '')), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }
    if (command.startsWith('groups ')) {
      return { success: true, output: LinuxSimulator.groups(command.replace('groups ', '')), isValid: true, pointsAwarded: 0, keywords: [], executionTime: Date.now() - startTime };
    }

    // Return unknown command - let the main execute handle remaining cases
    return {
      success: false,
      output: `__FALLTHROUGH__:${command}`,
      isValid: false,
      pointsAwarded: 0,
      keywords: [],
      executionTime: Date.now() - startTime,
    };
  }
}
