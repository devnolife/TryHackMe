/**
 * Linux Command Simulator
 * Simulates basic Linux terminal commands for educational purposes
 */

// Virtual file system structure
const virtualFileSystem: Record<string, { type: 'dir' | 'file'; content?: string; permissions?: string; owner?: string; size?: number }> = {
  '/': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' },
  '/home': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' },
  '/home/student': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'student' },
  '/home/student/Desktop': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'student' },
  '/home/student/Documents': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'student' },
  '/home/student/targets.txt': {
    type: 'file',
    permissions: '-rw-r--r--',
    owner: 'student',
    size: 156,
    content: `# Target List for Penetration Testing
# =====================================

192.168.1.100    - Web Server (Apache)
192.168.1.101    - Database Server (MySQL)
192.168.1.102    - Mail Server
10.0.0.50        - Internal Gateway
example-company.com - Primary Target Domain`
  },
  '/home/student/notes.txt': {
    type: 'file',
    permissions: '-rw-r--r--',
    owner: 'student',
    size: 89,
    content: `Lab Notes:
- Jangan lupa scan dengan nmap -sV terlebih dahulu
- Cek WHOIS untuk info domain
- Gunakan nikto untuk scan web vulnerabilities`
  },
  '/home/student/wordlist.txt': {
    type: 'file',
    permissions: '-rw-r--r--',
    owner: 'student',
    size: 2048,
    content: `admin
password
123456
password123
admin123
root
toor
qwerty
letmein
welcome
monkey
dragon
master
1234567890
abc123`
  },
  '/etc': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' },
  '/etc/passwd': {
    type: 'file',
    permissions: '-rw-r--r--',
    owner: 'root',
    size: 1847,
    content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
student:x:1000:1000:Student User:/home/student:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false`
  },
  '/etc/shadow': {
    type: 'file',
    permissions: '-rw-r-----',
    owner: 'root',
    size: 1024,
    content: `[Permission Denied - Use sudo to access this file]`
  },
  '/etc/hosts': {
    type: 'file',
    permissions: '-rw-r--r--',
    owner: 'root',
    size: 256,
    content: `127.0.0.1       localhost
127.0.1.1       kali
192.168.1.100   target.local
192.168.1.101   db.target.local
10.0.0.1        gateway.local

# The following lines are desirable for IPv6 capable hosts
::1     localhost ip6-localhost ip6-loopback
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters`
  },
  '/etc/hostname': {
    type: 'file',
    permissions: '-rw-r--r--',
    owner: 'root',
    size: 5,
    content: 'kali'
  },
  '/var': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' },
  '/var/log': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' },
  '/var/www': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'www-data' },
  '/tmp': { type: 'dir', permissions: 'drwxrwxrwt', owner: 'root' },
  '/usr': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' },
  '/usr/bin': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' },
  '/usr/share': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' },
  '/usr/share/wordlists': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' },
  '/usr/share/wordlists/rockyou.txt': {
    type: 'file',
    permissions: '-rw-r--r--',
    owner: 'root',
    size: 139921497,
    content: '[File too large to display - 14.3 million passwords]'
  },
  '/root': { type: 'dir', permissions: 'drwx------', owner: 'root' },
  '/opt': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' },
  '/bin': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root' },
};

// Environment variables
const environment: Record<string, string> = {
  USER: 'student',
  HOME: '/home/student',
  PWD: '/home/student',
  SHELL: '/bin/bash',
  PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
  TERM: 'xterm-256color',
  LANG: 'en_US.UTF-8',
  HOSTNAME: 'kali',
  LOGNAME: 'student',
  OLDPWD: '/home/student',
};

// Current working directory
let currentDir = '/home/student';

// Command history for session
const commandHistory: string[] = [];

// Simulated network interfaces
const networkInterfaces = {
  eth0: {
    ip: '192.168.1.50',
    netmask: '255.255.255.0',
    broadcast: '192.168.1.255',
    mac: '00:0c:29:ab:cd:ef',
  },
  lo: {
    ip: '127.0.0.1',
    netmask: '255.0.0.0',
    broadcast: '',
    mac: '00:00:00:00:00:00',
  },
};

export class LinuxSimulator {
  /**
   * Add command to history
   */
  static addToHistory(cmd: string): void {
    commandHistory.push(cmd);
  }

  /**
   * Get current directory
   */
  static getCurrentDir(): string {
    return currentDir;
  }

  /**
   * Get completions for a partial path (for tab completion)
   */
  static getPathCompletions(partialPath: string): string[] {
    // Determine the base directory and partial name
    let basePath: string;
    let partial: string;

    if (partialPath.includes('/')) {
      const lastSlash = partialPath.lastIndexOf('/');
      partial = partialPath.substring(lastSlash + 1);
      basePath = partialPath.substring(0, lastSlash) || '/';

      // Handle relative paths
      if (!basePath.startsWith('/')) {
        basePath = currentDir === '/' ? `/${basePath}` : `${currentDir}/${basePath}`;
      }
    } else {
      basePath = currentDir;
      partial = partialPath;
    }

    // Normalize basePath
    basePath = basePath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';

    // Find all entries in basePath that start with partial
    const entries: string[] = [];
    const prefix = basePath === '/' ? '/' : basePath + '/';

    for (const path of Object.keys(virtualFileSystem)) {
      if (path === basePath) continue;
      if (path.startsWith(prefix)) {
        const relativePath = path.substring(prefix.length);
        if (!relativePath.includes('/')) {
          // Check if it starts with partial
          if (relativePath.toLowerCase().startsWith(partial.toLowerCase())) {
            const isDir = virtualFileSystem[path].type === 'dir';
            entries.push(relativePath + (isDir ? '/' : ''));
          }
        }
      }
    }

    return entries.sort();
  }

  /**
   * Alias for getPathCompletions
   */
  static getCompletions(partialPath: string): string[] {
    return LinuxSimulator.getPathCompletions(partialPath);
  }

  /**
   * whoami - print current user
   */
  static whoami(): string {
    return 'student';
  }

  /**
   * id - print user identity
   */
  static id(): string {
    return 'uid=1000(student) gid=1000(student) groups=1000(student),27(sudo),44(video),46(plugdev),109(netdev)';
  }

  /**
   * hostname - show system hostname
   */
  static hostname(): string {
    return 'kali';
  }

  /**
   * uname - print system information
   */
  static uname(options: string = ''): string {
    if (options === '-a' || options === '--all') {
      return 'Linux kali 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.27-1kali1 (2023-05-12) x86_64 GNU/Linux';
    }
    if (options === '-r') {
      return '6.1.0-kali9-amd64';
    }
    if (options === '-n') {
      return 'kali';
    }
    if (options === '-s') {
      return 'Linux';
    }
    if (options === '-m') {
      return 'x86_64';
    }
    return 'Linux';
  }

  /**
   * date - print current date/time
   */
  static date(): string {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    const time = now.toTimeString().split(' ')[0];
    const year = now.getFullYear();

    return `${day} ${month} ${date} ${time} WIB ${year}`;
  }

  /**
   * uptime - show how long system has been running
   */
  static uptime(): string {
    const hours = Math.floor(Math.random() * 24);
    const mins = Math.floor(Math.random() * 60);
    return ` 10:23:45 up ${hours}:${mins},  1 user,  load average: 0.52, 0.58, 0.59`;
  }

  /**
   * pwd - print working directory
   */
  static pwd(): string {
    return currentDir;
  }

  /**
   * cd - change directory
   */
  static cd(path: string = ''): string {
    if (!path || path === '~') {
      currentDir = '/home/student';
      environment.OLDPWD = environment.PWD;
      environment.PWD = currentDir;
      return '';
    }

    if (path === '-') {
      const temp = currentDir;
      currentDir = environment.OLDPWD;
      environment.OLDPWD = temp;
      environment.PWD = currentDir;
      return currentDir;
    }

    if (path === '..') {
      if (currentDir !== '/') {
        const parts = currentDir.split('/').filter(p => p);
        parts.pop();
        environment.OLDPWD = currentDir;
        currentDir = '/' + parts.join('/');
        environment.PWD = currentDir;
      }
      return '';
    }

    // Absolute path
    let targetPath = path;
    if (!path.startsWith('/')) {
      targetPath = currentDir === '/' ? `/${path}` : `${currentDir}/${path}`;
    }

    // Normalize path
    targetPath = targetPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';

    if (virtualFileSystem[targetPath] && virtualFileSystem[targetPath].type === 'dir') {
      environment.OLDPWD = currentDir;
      currentDir = targetPath;
      environment.PWD = currentDir;
      return '';
    }

    return `bash: cd: ${path}: No such file or directory`;
  }

  /**
   * ls - list directory contents
   */
  static ls(args: string = ''): string {
    const showHidden = args.includes('-a');
    const showLong = args.includes('-l');
    const showAll = args.includes('-la') || args.includes('-al');

    // Get target path from args (last non-flag argument)
    let targetPath = currentDir;
    const parts = args.split(' ').filter(p => !p.startsWith('-'));
    if (parts.length > 0) {
      targetPath = parts[parts.length - 1];
      if (!targetPath.startsWith('/')) {
        targetPath = currentDir === '/' ? `/${targetPath}` : `${currentDir}/${targetPath}`;
      }
    }

    // Normalize path
    targetPath = targetPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';

    // Check if path exists
    if (!virtualFileSystem[targetPath]) {
      return `ls: cannot access '${args.split(' ').pop()}': No such file or directory`;
    }

    // If it's a file, show just the file
    if (virtualFileSystem[targetPath].type === 'file') {
      if (showLong || showAll) {
        const file = virtualFileSystem[targetPath];
        const size = file.size || 0;
        return `${file.permissions} 1 ${file.owner} ${file.owner} ${size.toString().padStart(8)} Dec 19 10:00 ${targetPath.split('/').pop()}`;
      }
      return targetPath.split('/').pop() || '';
    }

    // Find all entries in this directory
    const entries: string[] = [];
    const prefix = targetPath === '/' ? '/' : targetPath + '/';

    for (const path of Object.keys(virtualFileSystem)) {
      if (path === targetPath) continue;
      if (path.startsWith(prefix)) {
        const relativePath = path.substring(prefix.length);
        if (!relativePath.includes('/')) {
          entries.push(relativePath);
        }
      }
    }

    if (entries.length === 0) {
      return '';
    }

    entries.sort();

    if (showLong || showAll) {
      let output = `total ${entries.length * 4}\n`;

      if (showHidden || showAll) {
        output += `drwxr-xr-x 2 student student     4096 Dec 19 10:00 \x1b[1;34m.\x1b[0m\n`;
        output += `drwxr-xr-x 3 student student     4096 Dec 19 10:00 \x1b[1;34m..\x1b[0m\n`;
      }

      for (const entry of entries) {
        const fullPath = targetPath === '/' ? `/${entry}` : `${targetPath}/${entry}`;
        const item = virtualFileSystem[fullPath];
        if (item) {
          const size = item.size || 4096;
          const isDir = item.type === 'dir';
          const coloredName = isDir ? `\x1b[1;34m${entry}\x1b[0m` : entry;
          output += `${item.permissions} 1 ${item.owner?.padEnd(7) || 'student'} ${item.owner?.padEnd(7) || 'student'} ${size.toString().padStart(8)} Dec 19 10:00 ${coloredName}\n`;
        }
      }
      return output.trim();
    }

    // Simple listing with colors
    return entries.map(entry => {
      const fullPath = targetPath === '/' ? `/${entry}` : `${targetPath}/${entry}`;
      const item = virtualFileSystem[fullPath];
      if (item?.type === 'dir') {
        return `\x1b[1;34m${entry}\x1b[0m`;
      }
      return entry;
    }).join('  ');
  }

  /**
   * cat - read file contents
   */
  static cat(filename: string): string {
    if (!filename) {
      return 'cat: missing operand';
    }

    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const file = virtualFileSystem[filePath];
    if (!file) {
      return `cat: ${filename}: No such file or directory`;
    }

    if (file.type === 'dir') {
      return `cat: ${filename}: Is a directory`;
    }

    // Check permissions for shadow file
    if (filePath === '/etc/shadow') {
      return `cat: ${filename}: Permission denied`;
    }

    return file.content || '';
  }

  /**
   * echo - display a line of text
   */
  static echo(args: string): string {
    if (!args) {
      return '';
    }

    // Handle environment variables
    let output = args;
    for (const [key, value] of Object.entries(environment)) {
      output = output.replace(new RegExp(`\\$${key}`, 'g'), value);
      output = output.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }

    // Remove quotes
    output = output.replace(/^["']|["']$/g, '');

    return output;
  }

  /**
   * env - print environment
   */
  static env(): string {
    return Object.entries(environment)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  }

  /**
   * export - show or set environment variables
   */
  static exportCmd(args: string): string {
    if (!args) {
      return Object.entries(environment)
        .map(([key, value]) => `declare -x ${key}="${value}"`)
        .join('\n');
    }

    const match = args.match(/^(\w+)=(.*)$/);
    if (match) {
      environment[match[1]] = match[2].replace(/^["']|["']$/g, '');
      return '';
    }

    return `bash: export: \`${args}': not a valid identifier`;
  }

  /**
   * history - command history
   */
  static history(): string {
    if (commandHistory.length === 0) {
      return '';
    }
    return commandHistory.map((cmd, i) => `  ${(i + 1).toString().padStart(3)}  ${cmd}`).join('\n');
  }

  /**
   * ifconfig - network interface configuration
   */
  static ifconfig(): string {
    let output = '';

    output += `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet ${networkInterfaces.eth0.ip}  netmask ${networkInterfaces.eth0.netmask}  broadcast ${networkInterfaces.eth0.broadcast}
        inet6 fe80::20c:29ff:feab:cdef  prefixlen 64  scopeid 0x20<link>
        ether ${networkInterfaces.eth0.mac}  txqueuelen 1000  (Ethernet)
        RX packets 12584  bytes 1234567 (1.1 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 8432  bytes 987654 (964.5 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

`;

    output += `lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 1234  bytes 123456 (120.5 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 1234  bytes 123456 (120.5 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`;

    return output;
  }

  /**
   * ip - show IP addresses
   */
  static ip(args: string): string {
    if (args === 'a' || args === 'addr' || args === 'address') {
      return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether ${networkInterfaces.eth0.mac} brd ff:ff:ff:ff:ff:ff
    inet ${networkInterfaces.eth0.ip}/24 brd ${networkInterfaces.eth0.broadcast} scope global dynamic noprefixroute eth0
       valid_lft 86313sec preferred_lft 86313sec
    inet6 fe80::20c:29ff:feab:cdef/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever`;
    }

    if (args === 'r' || args === 'route') {
      return `default via 192.168.1.1 dev eth0 proto dhcp metric 100 
192.168.1.0/24 dev eth0 proto kernel scope link src ${networkInterfaces.eth0.ip} metric 100`;
    }

    return 'Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }\n       ip addr | ip route';
  }

  /**
   * ping - send ICMP ECHO_REQUEST
   */
  static ping(target: string): string {
    if (!target) {
      return 'ping: usage error: Destination address required';
    }

    const ip = target.includes('.') ? target : `93.184.216.34`;

    return `PING ${target} (${ip}) 56(84) bytes of data.
64 bytes from ${ip}: icmp_seq=1 ttl=56 time=12.3 ms
64 bytes from ${ip}: icmp_seq=2 ttl=56 time=11.8 ms
64 bytes from ${ip}: icmp_seq=3 ttl=56 time=12.1 ms
64 bytes from ${ip}: icmp_seq=4 ttl=56 time=11.9 ms

--- ${target} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3005ms
rtt min/avg/max/mdev = 11.832/12.025/12.284/0.179 ms`;
  }

  /**
   * netstat - network statistics
   */
  static netstat(args: string = ''): string {
    if (args.includes('-tuln') || args.includes('-tulpn')) {
      return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1234/sshd           
tcp        0      0 127.0.0.1:5432          0.0.0.0:*               LISTEN      2345/postgres       
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      3456/nginx          
tcp6       0      0 :::22                   :::*                    LISTEN      1234/sshd           
tcp6       0      0 :::443                  :::*                    LISTEN      3456/nginx          
udp        0      0 0.0.0.0:68              0.0.0.0:*                           987/dhclient`;
    }

    return `Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State      
tcp        0      0 192.168.1.50:54832      93.184.216.34:443       ESTABLISHED
tcp        0      0 192.168.1.50:33920      142.250.185.78:443      TIME_WAIT`;
  }

  /**
   * nano - simple text editor
   */
  static nano(filename: string = ''): string {
    if (!filename) {
      return `\x1b[1;36m  GNU nano 7.2\x1b[0m

\x1b[7m  New Buffer                                                                  \x1b[0m

\x1b[1;33m[Nano tidak dapat berjalan di terminal simulasi ini]\x1b[0m
\x1b[1;33m[Gunakan 'cat' untuk membaca file atau 'echo "text" > file' untuk menulis]\x1b[0m

\x1b[90m^G\x1b[0m Help      \x1b[90m^O\x1b[0m Write Out  \x1b[90m^W\x1b[0m Where Is  \x1b[90m^K\x1b[0m Cut       \x1b[90m^T\x1b[0m Execute   \x1b[90m^C\x1b[0m Location
\x1b[90m^X\x1b[0m Exit      \x1b[90m^R\x1b[0m Read File  \x1b[90m^\\\x1b[0m Replace   \x1b[90m^U\x1b[0m Paste     \x1b[90m^J\x1b[0m Justify   \x1b[90m^/\x1b[0m Go To Line`;
    }

    // Check if file exists
    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const file = virtualFileSystem[filePath];
    const fileContent = file?.content || '[File baru]';
    const displayName = filename.length > 40 ? '...' + filename.slice(-37) : filename;

    return `\x1b[1;36m  GNU nano 7.2\x1b[0m                    \x1b[1;37m${displayName}\x1b[0m

\x1b[7m  File: ${displayName}                                                        \x1b[0m

${file ? fileContent.split('\n').slice(0, 5).join('\n') : '\x1b[90m[File kosong atau baru]\x1b[0m'}
${file?.content && file.content.split('\n').length > 5 ? '\x1b[90m... (file terpotong)\x1b[0m' : ''}

\x1b[1;33m[Nano tidak dapat berjalan di terminal simulasi ini]\x1b[0m
\x1b[1;33m[Gunakan 'cat ${filename}' untuk melihat isi lengkap]\x1b[0m

\x1b[90m^G\x1b[0m Help      \x1b[90m^O\x1b[0m Write Out  \x1b[90m^W\x1b[0m Where Is  \x1b[90m^K\x1b[0m Cut       \x1b[90m^T\x1b[0m Execute   \x1b[90m^C\x1b[0m Location
\x1b[90m^X\x1b[0m Exit      \x1b[90m^R\x1b[0m Read File  \x1b[90m^\\\x1b[0m Replace   \x1b[90m^U\x1b[0m Paste     \x1b[90m^J\x1b[0m Justify   \x1b[90m^/\x1b[0m Go To Line`;
  }

  /**
   * vim/vi - advanced text editor
   */
  static vim(filename: string = ''): string {
    if (!filename) {
      return `\x1b[1;32mVIM - Vi IMproved 9.0\x1b[0m

~
~
~                              \x1b[1;37mVIM - Vi IMproved\x1b[0m
~
~                               version 9.0.1378
~                           by Bram Moolenaar et al.
~
~              \x1b[1;33m[Vim tidak dapat berjalan di terminal simulasi ini]\x1b[0m
~              \x1b[1;33m[Gunakan 'cat' untuk membaca atau 'nano' sebagai alternatif]\x1b[0m
~
~                 type  :q<Enter>               to exit
~                 type  :help<Enter>            for on-line help
~
~`;
    }

    // Check if file exists
    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const file = virtualFileSystem[filePath];
    const displayName = filename.length > 40 ? '...' + filename.slice(-37) : filename;

    if (!file) {
      return `"${displayName}" [New File]
~
~
~
\x1b[1;33m[Vim tidak dapat berjalan di terminal simulasi ini]\x1b[0m
\x1b[1;33m[Gunakan 'touch ${filename}' untuk membuat file baru]\x1b[0m
~
~
"${displayName}" [New File]`;
    }

    const lines = file.content?.split('\n') || [];
    const displayLines = lines.slice(0, 8);

    return `"${displayName}" ${lines.length}L, ${file.size || 0}C
${displayLines.join('\n')}
${lines.length > 8 ? '\x1b[90m~\x1b[0m\n\x1b[90m... (file terpotong, ' + (lines.length - 8) + ' baris lagi)\x1b[0m' : ''}
~
\x1b[1;33m[Vim tidak dapat berjalan di terminal simulasi ini]\x1b[0m
\x1b[1;33m[Gunakan 'cat ${filename}' untuk melihat isi lengkap]\x1b[0m
"${displayName}" ${lines.length}L, ${file.size || 0}C`;
  }

  /**
   * ps - process status
   */
  static ps(args: string = ''): string {
    if (args === 'aux' || args === '-aux') {
      return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1 169388 12064 ?        Ss   Dec19   0:01 /sbin/init
root         234  0.0  0.0  97708  7640 ?        Ss   Dec19   0:00 /lib/systemd/systemd-journald
root         256  0.0  0.0  22600  5540 ?        Ss   Dec19   0:00 /lib/systemd/systemd-udevd
root         423  0.0  0.0  16160  7168 ?        Ss   Dec19   0:00 sshd: /usr/sbin/sshd -D
root         512  0.0  0.1 226384 15936 ?        Ss   Dec19   0:00 /usr/sbin/apache2 -k start
www-data     514  0.0  0.0 227532  8960 ?        S    Dec19   0:00 /usr/sbin/apache2 -k start
student     1001  0.0  0.0  18508  9344 pts/0    Ss   10:23   0:00 -bash
student     1234  0.0  0.0  20324  3456 pts/0    R+   10:45   0:00 ps aux`;
    }

    return `    PID TTY          TIME CMD
   1001 pts/0    00:00:00 bash
   1234 pts/0    00:00:00 ps`;
  }

  /**
   * top - display processes (static snapshot)
   */
  static top(): string {
    return `top - 10:45:23 up 2:30,  1 user,  load average: 0.52, 0.58, 0.59
Tasks: 143 total,   1 running, 142 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.2 us,  2.1 sy,  0.0 ni, 92.5 id,  0.1 wa,  0.0 hi,  0.1 si,  0.0 st
MiB Mem :   7976.8 total,   3456.2 free,   2134.5 used,   2386.1 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5432.1 avail Mem 

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    512 www-data  20   0  226384  15936   8192 S   2.3   0.2   0:12.34 apache2
    423 root      20   0   16160   7168   6400 S   0.3   0.1   0:00.45 sshd
      1 root      20   0  169388  12064  8192  S   0.0   0.2   0:01.23 systemd
   1001 student   20   0   18508   9344   7680 S   0.0   0.1   0:00.05 bash

[Press 'q' to quit - This is a simulated snapshot]`;
  }

  /**
   * free - memory usage
   */
  static free(args: string = ''): string {
    const human = args.includes('-h');

    if (human) {
      return `               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       2.1Gi       3.4Gi       234Mi       2.3Gi       5.3Gi
Swap:          2.0Gi          0B       2.0Gi`;
    }

    return `               total        used        free      shared  buff/cache   available
Mem:         8167424     2186240     3538944      239616     2442240     5568512
Swap:        2097148           0     2097148`;
  }

  /**
   * df - disk space usage
   */
  static df(args: string = ''): string {
    const human = args.includes('-h');

    if (human) {
      return `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   18G   30G  37% /
tmpfs           3.9G     0  3.9G   0% /dev/shm
tmpfs           798M  1.4M  796M   1% /run
tmpfs           5.0M     0  5.0M   0% /run/lock
/dev/sda2       100G   45G   50G  47% /home`;
    }

    return `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1       52428800 18874368  31457280  37% /
tmpfs            4088352        0   4088352   0% /dev/shm
tmpfs             816396     1428    814968   1% /run
tmpfs               5120        0      5120   0% /run/lock
/dev/sda2      104857600 47185920  52428800  47% /home`;
  }

  /**
   * which - locate a command
   */
  static which(cmd: string): string {
    if (!cmd) {
      return '';
    }

    const commands: Record<string, string> = {
      'ls': '/usr/bin/ls',
      'cat': '/usr/bin/cat',
      'grep': '/usr/bin/grep',
      'find': '/usr/bin/find',
      'nmap': '/usr/bin/nmap',
      'python': '/usr/bin/python3',
      'python3': '/usr/bin/python3',
      'bash': '/usr/bin/bash',
      'ssh': '/usr/bin/ssh',
      'curl': '/usr/bin/curl',
      'wget': '/usr/bin/wget',
      'nikto': '/usr/bin/nikto',
      'sqlmap': '/usr/bin/sqlmap',
      'hydra': '/usr/bin/hydra',
      'john': '/usr/bin/john',
      'hashcat': '/usr/bin/hashcat',
      'metasploit': '/usr/bin/msfconsole',
      'msfconsole': '/usr/bin/msfconsole',
      'burpsuite': '/usr/bin/burpsuite',
      'wireshark': '/usr/bin/wireshark',
    };

    return commands[cmd] || `which: no ${cmd} in (${environment.PATH})`;
  }

  /**
   * file - determine file type
   */
  static file(filename: string): string {
    if (!filename) {
      return 'Usage: file [-bchiklLNnprsvz0] [file ...]';
    }

    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const f = virtualFileSystem[filePath];
    if (!f) {
      return `${filename}: cannot open (No such file or directory)`;
    }

    if (f.type === 'dir') {
      return `${filename}: directory`;
    }

    if (filename.endsWith('.txt')) {
      return `${filename}: ASCII text`;
    }
    if (filename.endsWith('.sh')) {
      return `${filename}: Bourne-Again shell script, ASCII text executable`;
    }
    if (filename.endsWith('.py')) {
      return `${filename}: Python script, ASCII text executable`;
    }

    return `${filename}: ASCII text`;
  }

  /**
   * wc - word, line, character count
   */
  static wc(args: string): string {
    const parts = args.split(' ').filter(p => p);
    const flags = parts.filter(p => p.startsWith('-')).join('');
    const filename = parts.find(p => !p.startsWith('-'));

    if (!filename) {
      return 'wc: missing operand';
    }

    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const f = virtualFileSystem[filePath];
    if (!f || f.type === 'dir') {
      return `wc: ${filename}: No such file or directory`;
    }

    const content = f.content || '';
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(w => w).length;
    const chars = content.length;

    if (flags.includes('l')) {
      return `${lines} ${filename}`;
    }
    if (flags.includes('w')) {
      return `${words} ${filename}`;
    }
    if (flags.includes('c')) {
      return `${chars} ${filename}`;
    }

    return `  ${lines}   ${words}  ${chars} ${filename}`;
  }

  /**
   * grep - search text patterns
   */
  static grep(args: string): string {
    const parts = args.split(' ').filter(p => p);
    if (parts.length < 2) {
      return 'Usage: grep [OPTION]... PATTERN [FILE]...';
    }

    const pattern = parts[0];
    const filename = parts[1];

    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const f = virtualFileSystem[filePath];
    if (!f || f.type === 'dir') {
      return `grep: ${filename}: No such file or directory`;
    }

    const content = f.content || '';
    const lines = content.split('\n');
    const matches = lines.filter(line => line.toLowerCase().includes(pattern.toLowerCase()));

    if (matches.length === 0) {
      return '';
    }

    // Highlight matches
    return matches.map(line => {
      return line.replace(new RegExp(`(${pattern})`, 'gi'), '\x1b[1;31m$1\x1b[0m');
    }).join('\n');
  }

  /**
   * head - output first part of file
   */
  static head(args: string): string {
    const parts = args.split(' ').filter(p => p);
    let lines = 10;
    let filename = '';

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '-n' && parts[i + 1]) {
        lines = parseInt(parts[i + 1]) || 10;
        i++;
      } else if (!parts[i].startsWith('-')) {
        filename = parts[i];
      }
    }

    if (!filename) {
      return 'head: missing file operand';
    }

    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const f = virtualFileSystem[filePath];
    if (!f || f.type === 'dir') {
      return `head: ${filename}: No such file or directory`;
    }

    const content = f.content || '';
    return content.split('\n').slice(0, lines).join('\n');
  }

  /**
   * tail - output last part of file
   */
  static tail(args: string): string {
    const parts = args.split(' ').filter(p => p);
    let lines = 10;
    let filename = '';

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '-n' && parts[i + 1]) {
        lines = parseInt(parts[i + 1]) || 10;
        i++;
      } else if (!parts[i].startsWith('-')) {
        filename = parts[i];
      }
    }

    if (!filename) {
      return 'tail: missing file operand';
    }

    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const f = virtualFileSystem[filePath];
    if (!f || f.type === 'dir') {
      return `tail: ${filename}: No such file or directory`;
    }

    const content = f.content || '';
    const allLines = content.split('\n');
    return allLines.slice(-lines).join('\n');
  }

  /**
   * touch - create empty file or update timestamp
   */
  static touch(filename: string): string {
    if (!filename) {
      return 'touch: missing file operand';
    }

    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    if (!virtualFileSystem[filePath]) {
      virtualFileSystem[filePath] = {
        type: 'file',
        permissions: '-rw-r--r--',
        owner: 'student',
        size: 0,
        content: ''
      };
    }

    return '';
  }

  /**
   * mkdir - create directory
   */
  static mkdir(dirname: string): string {
    if (!dirname) {
      return 'mkdir: missing operand';
    }

    let dirPath = dirname;
    if (!dirname.startsWith('/')) {
      dirPath = currentDir === '/' ? `/${dirname}` : `${currentDir}/${dirname}`;
    }

    if (virtualFileSystem[dirPath]) {
      return `mkdir: cannot create directory '${dirname}': File exists`;
    }

    virtualFileSystem[dirPath] = {
      type: 'dir',
      permissions: 'drwxr-xr-x',
      owner: 'student'
    };

    return '';
  }

  /**
   * rm - remove file
   */
  static rm(args: string): string {
    const parts = args.split(' ').filter(p => p);
    const recursive = parts.includes('-r') || parts.includes('-rf') || parts.includes('-fr');
    const filename = parts.find(p => !p.startsWith('-'));

    if (!filename) {
      return 'rm: missing operand';
    }

    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const f = virtualFileSystem[filePath];
    if (!f) {
      return `rm: cannot remove '${filename}': No such file or directory`;
    }

    if (f.type === 'dir' && !recursive) {
      return `rm: cannot remove '${filename}': Is a directory`;
    }

    // Don't allow removing system files
    if (filePath.startsWith('/etc') || filePath.startsWith('/usr') || filePath.startsWith('/bin')) {
      return `rm: cannot remove '${filename}': Permission denied`;
    }

    delete virtualFileSystem[filePath];
    return '';
  }

  /**
   * cp - copy file
   */
  static cp(args: string): string {
    const parts = args.split(' ').filter(p => !p.startsWith('-'));
    if (parts.length < 2) {
      return 'cp: missing destination file operand';
    }

    const src = parts[0];
    const dest = parts[1];

    let srcPath = src;
    if (!src.startsWith('/')) {
      srcPath = currentDir === '/' ? `/${src}` : `${currentDir}/${src}`;
    }

    let destPath = dest;
    if (!dest.startsWith('/')) {
      destPath = currentDir === '/' ? `/${dest}` : `${currentDir}/${dest}`;
    }

    const f = virtualFileSystem[srcPath];
    if (!f) {
      return `cp: cannot stat '${src}': No such file or directory`;
    }

    virtualFileSystem[destPath] = { ...f };
    return '';
  }

  /**
   * mv - move/rename file
   */
  static mv(args: string): string {
    const parts = args.split(' ').filter(p => !p.startsWith('-'));
    if (parts.length < 2) {
      return 'mv: missing destination file operand';
    }

    const src = parts[0];
    const dest = parts[1];

    let srcPath = src;
    if (!src.startsWith('/')) {
      srcPath = currentDir === '/' ? `/${src}` : `${currentDir}/${src}`;
    }

    let destPath = dest;
    if (!dest.startsWith('/')) {
      destPath = currentDir === '/' ? `/${dest}` : `${currentDir}/${dest}`;
    }

    const f = virtualFileSystem[srcPath];
    if (!f) {
      return `mv: cannot stat '${src}': No such file or directory`;
    }

    virtualFileSystem[destPath] = { ...f };
    delete virtualFileSystem[srcPath];
    return '';
  }

  /**
   * chmod - change file permissions (simulated)
   */
  static chmod(args: string): string {
    const parts = args.split(' ').filter(p => p);
    if (parts.length < 2) {
      return 'chmod: missing operand';
    }

    const mode = parts[0];
    const filename = parts[1];

    let filePath = filename;
    if (!filename.startsWith('/')) {
      filePath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    if (!virtualFileSystem[filePath]) {
      return `chmod: cannot access '${filename}': No such file or directory`;
    }

    // Just acknowledge the command
    return '';
  }

  /**
   * sudo - execute as superuser (simulated)
   */
  static sudo(command: string): { needsPassword: boolean; output: string; command: string } {
    if (!command) {
      return { needsPassword: false, output: 'usage: sudo -h | -K | -k | -V\n       sudo [-v] command', command: '' };
    }

    // Some commands that benefit from sudo
    if (command.includes('cat /etc/shadow')) {
      return {
        needsPassword: true,
        output: `root:$6$xyz123:19356:0:99999:7:::
daemon:*:19212:0:99999:7:::
bin:*:19212:0:99999:7:::
sys:*:19212:0:99999:7:::
student:$6$abc456$hashed.password.here:19356:0:99999:7:::
www-data:*:19212:0:99999:7:::
mysql:!:19212:0:99999:7:::`,
        command
      };
    }

    if (command.startsWith('apt ') || command.startsWith('apt-get ')) {
      return {
        needsPassword: true,
        output: `Reading package lists... Done
Building dependency tree... Done
This is a simulated environment. Package management is not available.`,
        command
      };
    }

    if (command.startsWith('systemctl ')) {
      return {
        needsPassword: true,
        output: `System control is simulated in this environment.`,
        command
      };
    }

    // For other commands, just pass through
    return { needsPassword: true, output: '', command };
  }

  /**
   * man - manual pages (simplified)
   */
  static man(command: string): string {
    if (!command) {
      return 'What manual page do you want?\nFor example, try \'man nmap\'';
    }

    const manPages: Record<string, string> = {
      'nmap': `NMAP(1)                        Nmap Reference Guide                       NMAP(1)

NAME
       nmap - Network exploration tool and security / port scanner

SYNOPSIS
       nmap [Scan Type...] [Options] {target specification}

DESCRIPTION
       Nmap ("Network Mapper") is an open source tool for network exploration 
       and security auditing.

COMMON OPTIONS
       -sS    TCP SYN scan (stealth scan)
       -sV    Version detection
       -sn    Ping scan - disable port scan
       -O     Enable OS detection
       -A     Enable OS detection, version detection, script scanning, and traceroute
       -p     Port specification
       -sU    UDP scan

EXAMPLES
       nmap -sS 192.168.1.1
       nmap -sV -p 1-1000 target.com
       nmap -A 192.168.1.0/24`,

      'ls': `LS(1)                           User Commands                          LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

COMMON OPTIONS
       -a     do not ignore entries starting with .
       -l     use a long listing format
       -h     with -l, print sizes in human readable format

EXAMPLES
       ls -la
       ls -lh /home`,

      'grep': `GREP(1)                         User Commands                         GREP(1)

NAME
       grep - print lines that match patterns

SYNOPSIS
       grep [OPTION...] PATTERNS [FILE...]

COMMON OPTIONS
       -i     ignore case distinctions
       -r     read all files under each directory, recursively
       -n     prefix each line of output with the line number

EXAMPLES
       grep "error" /var/log/syslog
       grep -r "password" /etc/`,
    };

    return manPages[command] || `No manual entry for ${command}`;
  }

  /**
   * curl - transfer data (simulated)
   */
  static curl(args: string): string {
    if (!args) {
      return 'curl: try \'curl --help\' for more information';
    }

    const url = args.split(' ').find(p => p.startsWith('http'));
    if (!url) {
      return 'curl: no URL specified';
    }

    return `<!DOCTYPE html>
<html>
<head>
    <title>Simulated Response</title>
</head>
<body>
    <h1>Response from ${url}</h1>
    <p>This is a simulated HTTP response for educational purposes.</p>
    <p>In a real environment, this would show the actual content from the URL.</p>
</body>
</html>`;
  }

  /**
   * wget - download files (simulated)
   */
  static wget(args: string): string {
    if (!args) {
      return 'wget: missing URL';
    }

    const url = args.split(' ').find(p => p.startsWith('http'));
    if (!url) {
      return 'wget: missing URL';
    }

    const filename = url.split('/').pop() || 'index.html';

    return `--${new Date().toISOString()}--  ${url}
Resolving ${new URL(url).hostname}... 93.184.216.34
Connecting to ${new URL(url).hostname}|93.184.216.34|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1256 (1.2K) [text/html]
Saving to: '${filename}'

${filename}     100%[===================>]   1.23K  --.-KB/s    in 0s      

${new Date().toISOString()} (12.3 MB/s) - '${filename}' saved [1256/1256]

[Simulated - file not actually downloaded]`;
  }

  /**
   * ssh - secure shell (simulated)
   */
  static ssh(args: string): string {
    if (!args) {
      return 'usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface]\n           [-b bind_address] [-c cipher_spec] [-D [bind_address:]port]\n           [-E log_file] [-e escape_char] [-F configfile]\n           [-I pkcs11] [-i identity_file] [-J [user@]host[:port]]\n           [-L address] [-l login_name] [-m mac_spec]\n           [-O ctl_cmd] [-o option] [-p port] [-Q query_option]\n           [-R address] [-S ctl_path] [-W host:port]\n           [-w local_tun[:remote_tun]] destination [command]';
    }

    return `ssh: connect to host ${args} port 22: Connection refused
[This is a simulated environment - SSH connections are not available]`;
  }

  /**
   * nc/netcat - networking utility (simulated)
   */
  static nc(args: string): string {
    if (!args) {
      return 'usage: nc [-46CDdFhklNnrStUuvZz] [-I length] [-i interval] [-M ttl]\n          [-m minttl] [-O length] [-P proxy_username] [-p source_port]\n          [-q seconds] [-s source] [-T keyword] [-V rtable] [-W recvlimit]\n          [-w timeout] [-X proxy_protocol] [-x proxy_address[:port]]\n          [destination] [port]';
    }

    if (args.includes('-l')) {
      return 'Listening on [0.0.0.0] (simulated)\n[Press Ctrl+C to stop]';
    }

    const parts = args.split(' ').filter(p => !p.startsWith('-'));
    if (parts.length >= 2) {
      return `Connection to ${parts[0]} ${parts[1]} port [tcp/*] succeeded!`;
    }

    return 'nc: missing hostname and port arguments';
  }
}
