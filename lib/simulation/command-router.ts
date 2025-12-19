/**
 * Command Router
 * Routes commands to appropriate simulators and validates them
 */

import { OsintSimulator } from './osint-simulator';
import { NmapSimulator } from './nmap-simulator';
import { VulnSimulator } from './vuln-simulator';
import { WebSimulator } from './web-simulator';
import { LinuxSimulator } from './linux-simulator';

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
      return {
        success: true,
        output,
        isValid: true,
        pointsAwarded: 10,
        keywords: ['CVE', 'exploit'],
        executionTime: Date.now() - startTime,
      };
    }

    if (command.startsWith('hashid ')) {
      const hash = command.replace('hashid ', '').trim();
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

    if (command.startsWith('john ')) {
      const hash = command.replace('john ', '').trim();
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
    const domain = command.replace('whois ', '').trim();

    if (!domain) {
      return {
        success: false,
        output: 'Usage: whois <domain>',
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
    const domain = command.replace('nslookup ', '').trim();

    if (!domain) {
      return {
        success: false,
        output: 'Usage: nslookup <domain>',
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
    const ip = command.replace('geoip ', '').trim();

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
    const parts = command.replace('dig ', '').trim().split(' ');
    const domain = parts[0];
    const type = parts[1] || 'A';

    if (!domain) {
      return {
        success: false,
        output: 'Usage: dig <domain> [type]',
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
    const domain = command.replace('host ', '').trim();

    if (!domain) {
      return {
        success: false,
        output: 'Usage: host <domain>',
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
    const target = command.replace('traceroute ', '').trim();

    if (!target) {
      return {
        success: false,
        output: 'Usage: traceroute <host>',
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
}
