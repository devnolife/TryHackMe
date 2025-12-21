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

  // ========== TEXT PROCESSING COMMANDS ==========

  /**
   * awk - pattern scanning and processing language
   */
  static awk(args: string): string {
    if (!args) {
      return "usage: awk [-F fs] [-v var=value] ['prog' | -f progfile] [file ...]";
    }

    // Parse awk arguments
    const parts = args.match(/(?:'[^']*'|"[^"]*"|[^\s]+)/g) || [];
    let fieldSep = ' ';
    let program = '';
    let filename = '';

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '-F' && parts[i + 1]) {
        fieldSep = parts[i + 1].replace(/'/g, '').replace(/"/g, '');
        i++;
      } else if (parts[i].startsWith("'") || parts[i].startsWith('"')) {
        program = parts[i].replace(/^['"]|['"]$/g, '');
      } else if (!parts[i].startsWith('-')) {
        filename = parts[i];
      }
    }

    if (!filename) {
      return 'awk: no input files';
    }

    // Resolve file path
    let fullPath = filename;
    if (!filename.startsWith('/')) {
      fullPath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const fileEntry = virtualFileSystem[fullPath];
    if (!fileEntry || fileEntry.type !== 'file') {
      return `awk: cannot open '${filename}' (No such file or directory)`;
    }

    const lines = (fileEntry.content || '').split('\n');
    const results: string[] = [];

    // Common awk patterns
    if (program.includes('print $')) {
      const fieldMatch = program.match(/print \$(\d+)/);
      if (fieldMatch) {
        const fieldNum = parseInt(fieldMatch[1]);
        for (const line of lines) {
          const fields = line.split(fieldSep === ' ' ? /\s+/ : fieldSep);
          if (fieldNum === 0) {
            results.push(line);
          } else if (fields[fieldNum - 1]) {
            results.push(fields[fieldNum - 1]);
          }
        }
      }
    } else if (program === '{print}' || program === '{print $0}') {
      return fileEntry.content || '';
    } else if (program.includes('NR')) {
      // Line number operations
      for (let i = 0; i < lines.length; i++) {
        results.push(`${i + 1}: ${lines[i]}`);
      }
    } else if (program.includes('NF')) {
      // Field count
      for (const line of lines) {
        const fields = line.split(fieldSep === ' ' ? /\s+/ : fieldSep);
        results.push(String(fields.length));
      }
    } else {
      // Default: print all
      return fileEntry.content || '';
    }

    return results.join('\n');
  }

  /**
   * sed - stream editor
   */
  static sed(args: string): string {
    if (!args) {
      return "usage: sed [-n] script [file ...]\n       sed [-n] -e script [-e script] ... [-f script_file] ... [file ...]";
    }

    // Parse sed arguments
    const parts = args.match(/(?:'[^']*'|"[^"]*"|[^\s]+)/g) || [];
    let inPlace = false;
    let script = '';
    let filename = '';

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '-i') {
        inPlace = true;
      } else if (parts[i] === '-e' && parts[i + 1]) {
        script = parts[i + 1].replace(/^['"]|['"]$/g, '');
        i++;
      } else if (parts[i].startsWith("'") || parts[i].startsWith('"')) {
        script = parts[i].replace(/^['"]|['"]$/g, '');
      } else if (!parts[i].startsWith('-')) {
        filename = parts[i];
      }
    }

    if (!filename) {
      return 'sed: no input files';
    }

    // Resolve file path
    let fullPath = filename;
    if (!filename.startsWith('/')) {
      fullPath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const fileEntry = virtualFileSystem[fullPath];
    if (!fileEntry || fileEntry.type !== 'file') {
      return `sed: can't read ${filename}: No such file or directory`;
    }

    let content = fileEntry.content || '';

    // Parse substitution command: s/pattern/replacement/flags
    const subMatch = script.match(/^s([\/|#])(.+?)\1(.+?)\1([gi]*)$/);
    if (subMatch) {
      const [, , pattern, replacement, flags] = subMatch;
      const regex = new RegExp(pattern, flags.includes('g') ? 'g' : '');
      content = content.replace(regex, replacement);
    } else if (script.match(/^\d+d$/)) {
      // Delete line: sed '3d'
      const lineNum = parseInt(script);
      const lines = content.split('\n');
      lines.splice(lineNum - 1, 1);
      content = lines.join('\n');
    } else if (script === '$d') {
      // Delete last line
      const lines = content.split('\n');
      lines.pop();
      content = lines.join('\n');
    } else if (script.match(/^\d+,\d+d$/)) {
      // Delete range: sed '2,4d'
      const [start, end] = script.replace('d', '').split(',').map(Number);
      const lines = content.split('\n');
      lines.splice(start - 1, end - start + 1);
      content = lines.join('\n');
    }

    if (inPlace) {
      virtualFileSystem[fullPath].content = content;
      return '';
    }

    return content;
  }

  /**
   * cut - remove sections from each line of files
   */
  static cut(args: string): string {
    if (!args) {
      return "cut: you must specify a list of bytes, characters, or fields\nTry 'cut --help' for more information.";
    }

    const parts = args.split(' ');
    let delimiter = '\t';
    let fields: number[] = [];
    let chars: number[] = [];
    let filename = '';

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '-d' && parts[i + 1]) {
        delimiter = parts[i + 1].replace(/'/g, '').replace(/"/g, '');
        i++;
      } else if (parts[i].startsWith('-d')) {
        delimiter = parts[i].substring(2).replace(/'/g, '').replace(/"/g, '');
      } else if (parts[i] === '-f' && parts[i + 1]) {
        fields = this.parseRange(parts[i + 1]);
        i++;
      } else if (parts[i].startsWith('-f')) {
        fields = this.parseRange(parts[i].substring(2));
      } else if (parts[i] === '-c' && parts[i + 1]) {
        chars = this.parseRange(parts[i + 1]);
        i++;
      } else if (parts[i].startsWith('-c')) {
        chars = this.parseRange(parts[i].substring(2));
      } else if (!parts[i].startsWith('-')) {
        filename = parts[i];
      }
    }

    if (!filename) {
      return 'cut: no input files';
    }

    // Resolve file path
    let fullPath = filename;
    if (!filename.startsWith('/')) {
      fullPath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const fileEntry = virtualFileSystem[fullPath];
    if (!fileEntry || fileEntry.type !== 'file') {
      return `cut: ${filename}: No such file or directory`;
    }

    const lines = (fileEntry.content || '').split('\n');
    const results: string[] = [];

    for (const line of lines) {
      if (fields.length > 0) {
        const fieldsList = line.split(delimiter);
        const selected = fields.map(f => fieldsList[f - 1] || '').join(delimiter);
        results.push(selected);
      } else if (chars.length > 0) {
        const selected = chars.map(c => line[c - 1] || '').join('');
        results.push(selected);
      }
    }

    return results.join('\n');
  }

  /**
   * Helper to parse range like "1,3" or "1-5" or "2-"
   */
  private static parseRange(rangeStr: string): number[] {
    const result: number[] = [];
    const parts = rangeStr.split(',');

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-');
        const s = parseInt(start) || 1;
        const e = parseInt(end) || 100;
        for (let i = s; i <= e; i++) {
          result.push(i);
        }
      } else {
        result.push(parseInt(part));
      }
    }

    return result.filter(n => !isNaN(n));
  }

  /**
   * sort - sort lines of text files
   */
  static sort(args: string): string {
    if (!args) {
      return 'sort: missing operand';
    }

    const parts = args.split(' ');
    let reverse = false;
    let numeric = false;
    let unique = false;
    let filename = '';

    for (const part of parts) {
      if (part === '-r') reverse = true;
      else if (part === '-n') numeric = true;
      else if (part === '-u') unique = true;
      else if (part === '-rn' || part === '-nr') { reverse = true; numeric = true; }
      else if (!part.startsWith('-')) filename = part;
    }

    if (!filename) {
      return 'sort: missing operand';
    }

    // Resolve file path
    let fullPath = filename;
    if (!filename.startsWith('/')) {
      fullPath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const fileEntry = virtualFileSystem[fullPath];
    if (!fileEntry || fileEntry.type !== 'file') {
      return `sort: cannot read: ${filename}: No such file or directory`;
    }

    let lines = (fileEntry.content || '').split('\n').filter(l => l.length > 0);

    if (numeric) {
      lines.sort((a, b) => {
        const numA = parseFloat(a) || 0;
        const numB = parseFloat(b) || 0;
        return numA - numB;
      });
    } else {
      lines.sort();
    }

    if (reverse) {
      lines.reverse();
    }

    if (unique) {
      lines = Array.from(new Set(lines));
    }

    return lines.join('\n');
  }

  /**
   * uniq - report or omit repeated lines
   */
  static uniq(args: string): string {
    if (!args) {
      return 'uniq: missing operand';
    }

    const parts = args.split(' ');
    let count = false;
    let duplicateOnly = false;
    let uniqueOnly = false;
    let filename = '';

    for (const part of parts) {
      if (part === '-c') count = true;
      else if (part === '-d') duplicateOnly = true;
      else if (part === '-u') uniqueOnly = true;
      else if (!part.startsWith('-')) filename = part;
    }

    if (!filename) {
      return 'uniq: missing operand';
    }

    // Resolve file path
    let fullPath = filename;
    if (!filename.startsWith('/')) {
      fullPath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const fileEntry = virtualFileSystem[fullPath];
    if (!fileEntry || fileEntry.type !== 'file') {
      return `uniq: ${filename}: No such file or directory`;
    }

    const lines = (fileEntry.content || '').split('\n');
    const results: string[] = [];
    const counts: Map<string, number> = new Map();

    // Count consecutive duplicates
    let prevLine = '';
    let prevCount = 0;

    for (const line of lines) {
      if (line === prevLine) {
        prevCount++;
      } else {
        if (prevLine !== '') {
          counts.set(prevLine, prevCount);
        }
        prevLine = line;
        prevCount = 1;
      }
    }
    if (prevLine !== '') {
      counts.set(prevLine, prevCount);
    }

    counts.forEach((cnt, line) => {
      if (duplicateOnly && cnt < 2) return;
      if (uniqueOnly && cnt > 1) return;

      if (count) {
        results.push(`      ${cnt} ${line}`);
      } else {
        results.push(line);
      }
    });

    return results.join('\n');
  }

  /**
   * tr - translate or delete characters
   */
  static tr(args: string): string {
    if (!args) {
      return "usage: tr [-cdst] [-c] string1 string2";
    }

    // tr is typically used with pipes, simulate with example
    return `[tr requires piped input]
Example: echo "hello" | tr 'a-z' 'A-Z'
Result: HELLO

Common usage:
  tr 'a-z' 'A-Z'      - Convert to uppercase
  tr 'A-Z' 'a-z'      - Convert to lowercase
  tr -d '\\n'          - Delete newlines
  tr -s ' '           - Squeeze multiple spaces`;
  }

  /**
   * diff - compare files line by line
   */
  static diff(args: string): string {
    if (!args) {
      return 'diff: missing operand';
    }

    const parts = args.split(' ').filter(p => !p.startsWith('-'));
    if (parts.length < 2) {
      return 'diff: missing operand after first file';
    }

    const [file1, file2] = parts;

    // Resolve paths
    let path1 = file1.startsWith('/') ? file1 : `${currentDir}/${file1}`;
    let path2 = file2.startsWith('/') ? file2 : `${currentDir}/${file2}`;

    const entry1 = virtualFileSystem[path1];
    const entry2 = virtualFileSystem[path2];

    if (!entry1 || entry1.type !== 'file') {
      return `diff: ${file1}: No such file or directory`;
    }
    if (!entry2 || entry2.type !== 'file') {
      return `diff: ${file2}: No such file or directory`;
    }

    const lines1 = (entry1.content || '').split('\n');
    const lines2 = (entry2.content || '').split('\n');

    if (entry1.content === entry2.content) {
      return ''; // Files are identical
    }

    // Simple diff output
    const results: string[] = [];
    const maxLines = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLines; i++) {
      if (lines1[i] !== lines2[i]) {
        if (lines1[i] && !lines2[i]) {
          results.push(`${i + 1}d${i}`);
          results.push(`< ${lines1[i]}`);
        } else if (!lines1[i] && lines2[i]) {
          results.push(`${i}a${i + 1}`);
          results.push(`> ${lines2[i]}`);
        } else {
          results.push(`${i + 1}c${i + 1}`);
          results.push(`< ${lines1[i]}`);
          results.push('---');
          results.push(`> ${lines2[i]}`);
        }
      }
    }

    return results.join('\n');
  }

  /**
   * less - opposite of more (pager)
   */
  static less(args: string): string {
    if (!args) {
      return 'Missing filename ("less --help" for help)';
    }

    const filename = args.split(' ').filter(p => !p.startsWith('-'))[0];

    // Resolve file path
    let fullPath = filename;
    if (!filename.startsWith('/')) {
      fullPath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const fileEntry = virtualFileSystem[fullPath];
    if (!fileEntry || fileEntry.type !== 'file') {
      return `${filename}: No such file or directory`;
    }

    const content = fileEntry.content || '';
    const lines = content.split('\n');

    // Show first 20 lines with pager info
    const preview = lines.slice(0, 20).join('\n');
    const remaining = lines.length > 20 ? lines.length - 20 : 0;

    return `${preview}\n\x1b[7m:${remaining > 0 ? ` (${remaining} more lines - use 'cat' to see all)` : ' (END)'}\x1b[0m`;
  }

  /**
   * more - file perusal filter for viewing
   */
  static more(args: string): string {
    return this.less(args); // Alias to less
  }

  // ========== FILE UTILITY COMMANDS ==========

  /**
   * find - search for files in a directory hierarchy
   */
  static find(args: string): string {
    if (!args) {
      args = '.';
    }

    const parts = args.split(' ');
    let searchPath = '.';
    let namePattern = '';
    let typeFilter = '';

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '-name' && parts[i + 1]) {
        namePattern = parts[i + 1].replace(/'/g, '').replace(/"/g, '');
        i++;
      } else if (parts[i] === '-type' && parts[i + 1]) {
        typeFilter = parts[i + 1];
        i++;
      } else if (!parts[i].startsWith('-')) {
        searchPath = parts[i];
      }
    }

    // Resolve search path
    let basePath = searchPath;
    if (searchPath === '.') {
      basePath = currentDir;
    } else if (!searchPath.startsWith('/')) {
      basePath = currentDir === '/' ? `/${searchPath}` : `${currentDir}/${searchPath}`;
    }

    const results: string[] = [];

    for (const path of Object.keys(virtualFileSystem)) {
      if (!path.startsWith(basePath)) continue;

      const entry = virtualFileSystem[path];
      const filename = path.split('/').pop() || '';

      // Type filter
      if (typeFilter === 'f' && entry.type !== 'file') continue;
      if (typeFilter === 'd' && entry.type !== 'dir') continue;

      // Name pattern (simple glob matching)
      if (namePattern) {
        const regex = new RegExp('^' + namePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
        if (!regex.test(filename)) continue;
      }

      // Format output relative to search path
      const relativePath = path.replace(basePath, searchPath);
      results.push(relativePath || searchPath);
    }

    return results.sort().join('\n') || `find: '${searchPath}': No such file or directory`;
  }

  /**
   * ln - make links between files
   */
  static ln(args: string): string {
    if (!args) {
      return "ln: missing file operand\nTry 'ln --help' for more information.";
    }

    const parts = args.split(' ');
    let symbolic = false;
    const files: string[] = [];

    for (const part of parts) {
      if (part === '-s') symbolic = true;
      else if (!part.startsWith('-')) files.push(part);
    }

    if (files.length < 2) {
      return 'ln: missing destination file operand';
    }

    const [source, target] = files;

    // Resolve source path
    let sourcePath = source;
    if (!source.startsWith('/')) {
      sourcePath = currentDir === '/' ? `/${source}` : `${currentDir}/${source}`;
    }

    if (!virtualFileSystem[sourcePath]) {
      return `ln: failed to access '${source}': No such file or directory`;
    }

    // Resolve target path
    let targetPath = target;
    if (!target.startsWith('/')) {
      targetPath = currentDir === '/' ? `/${target}` : `${currentDir}/${target}`;
    }

    // Create symbolic link (simulated)
    virtualFileSystem[targetPath] = {
      type: 'file',
      permissions: symbolic ? 'lrwxrwxrwx' : virtualFileSystem[sourcePath].permissions,
      owner: 'student',
      size: virtualFileSystem[sourcePath].size,
      content: virtualFileSystem[sourcePath].content,
    };

    return '';
  }

  /**
   * du - estimate file space usage
   */
  static du(args: string): string {
    const parts = (args || '').split(' ');
    let human = false;
    let summary = false;
    let targetPath = '.';

    for (const part of parts) {
      if (part === '-h') human = true;
      else if (part === '-s') summary = true;
      else if (part === '-sh' || part === '-hs') { human = true; summary = true; }
      else if (!part.startsWith('-') && part) targetPath = part;
    }

    // Resolve path
    let fullPath = targetPath;
    if (targetPath === '.') {
      fullPath = currentDir;
    } else if (!targetPath.startsWith('/')) {
      fullPath = currentDir === '/' ? `/${targetPath}` : `${currentDir}/${targetPath}`;
    }

    if (!virtualFileSystem[fullPath]) {
      return `du: cannot access '${targetPath}': No such file or directory`;
    }

    // Calculate sizes
    const results: string[] = [];
    let totalSize = 0;

    for (const path of Object.keys(virtualFileSystem)) {
      if (!path.startsWith(fullPath)) continue;

      const entry = virtualFileSystem[path];
      const size = entry.size || (entry.type === 'dir' ? 4096 : 0);
      totalSize += size;

      if (!summary) {
        const displaySize = human ? this.formatSize(size) : String(Math.ceil(size / 1024));
        const relativePath = path.replace(fullPath, targetPath);
        results.push(`${displaySize}\t${relativePath}`);
      }
    }

    if (summary) {
      const displaySize = human ? this.formatSize(totalSize) : String(Math.ceil(totalSize / 1024));
      return `${displaySize}\t${targetPath}`;
    }

    return results.join('\n');
  }

  /**
   * Format bytes to human readable
   */
  private static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}G`;
  }

  /**
   * stat - display file or file system status
   */
  static stat(args: string): string {
    if (!args) {
      return "stat: missing operand\nTry 'stat --help' for more information.";
    }

    const filename = args.split(' ').filter(p => !p.startsWith('-'))[0];

    // Resolve file path
    let fullPath = filename;
    if (!filename.startsWith('/')) {
      fullPath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    const entry = virtualFileSystem[fullPath];
    if (!entry) {
      return `stat: cannot statx '${filename}': No such file or directory`;
    }

    const size = entry.size || (entry.type === 'dir' ? 4096 : 0);
    const blocks = Math.ceil(size / 512);
    const now = new Date();

    return `  File: ${filename}
  Size: ${size}\t\tBlocks: ${blocks}\t\tIO Block: 4096   ${entry.type === 'dir' ? 'directory' : 'regular file'}
Device: 801h/2049d\tInode: ${Math.floor(Math.random() * 1000000)}\t\tLinks: 1
Access: (${entry.permissions?.substring(1, 4) || '0644'}/${entry.permissions || '-rw-r--r--'})\tUid: ( 1000/ ${entry.owner || 'student'})\tGid: ( 1000/ ${entry.owner || 'student'})
Access: ${now.toISOString()}
Modify: ${now.toISOString()}
Change: ${now.toISOString()}
 Birth: -`;
  }

  /**
   * chown - change file owner and group
   */
  static chown(args: string): string {
    if (!args) {
      return "chown: missing operand\nTry 'chown --help' for more information.";
    }

    const parts = args.split(' ').filter(p => !p.startsWith('-'));
    if (parts.length < 2) {
      return "chown: missing operand after owner";
    }

    const [owner, filename] = parts;

    // Resolve file path
    let fullPath = filename;
    if (!filename.startsWith('/')) {
      fullPath = currentDir === '/' ? `/${filename}` : `${currentDir}/${filename}`;
    }

    if (!virtualFileSystem[fullPath]) {
      return `chown: cannot access '${filename}': No such file or directory`;
    }

    // Check permissions (simulated - only root can chown)
    return `chown: changing ownership of '${filename}': Operation not permitted
[Use sudo chown to change ownership]`;
  }

  // ========== PROCESS & JOB CONTROL ==========

  /**
   * kill - send a signal to a process
   */
  static kill(args: string): string {
    if (!args) {
      return 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]';
    }

    if (args === '-l') {
      return ` 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL       5) SIGTRAP
 6) SIGABRT      7) SIGBUS       8) SIGFPE       9) SIGKILL     10) SIGUSR1
11) SIGSEGV     12) SIGUSR2     13) SIGPIPE     14) SIGALRM     15) SIGTERM
16) SIGSTKFLT   17) SIGCHLD     18) SIGCONT     19) SIGSTOP     20) SIGTSTP
21) SIGTTIN     22) SIGTTOU     23) SIGURG      24) SIGXCPU     25) SIGXFSZ
26) SIGVTALRM   27) SIGPROF     28) SIGWINCH    29) SIGIO       30) SIGPWR
31) SIGSYS`;
    }

    const parts = args.split(' ');
    let signal = '15'; // SIGTERM
    let pid = '';

    for (const part of parts) {
      if (part.startsWith('-')) {
        signal = part.substring(1);
      } else {
        pid = part;
      }
    }

    if (!pid) {
      return 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...';
    }

    // Simulate kill
    const pidNum = parseInt(pid);
    if (isNaN(pidNum)) {
      return `kill: ${pid}: arguments must be process or job IDs`;
    }

    // Some PIDs are "protected"
    if (pidNum === 1) {
      return 'kill: (1) - Operation not permitted';
    }

    return ''; // Success (silent)
  }

  /**
   * jobs - display status of jobs
   */
  static jobs(): string {
    // Simulated background jobs
    return `[1]+  Running                 nmap -sV 192.168.1.0/24 &
[2]-  Stopped                 vim notes.txt`;
  }

  /**
   * bg - resume job in background
   */
  static bg(args: string): string {
    const jobNum = args || '1';
    return `[${jobNum}]+ nmap -sV 192.168.1.0/24 &`;
  }

  /**
   * fg - bring job to foreground
   */
  static fg(args: string): string {
    const jobNum = args || '1';
    return `[Bringing job ${jobNum} to foreground...]
[Job completed or use Ctrl+C to interrupt]`;
  }

  // ========== ARCHIVE COMMANDS ==========

  /**
   * tar - tape archive
   */
  static tar(args: string): string {
    if (!args) {
      return "tar: You must specify one of the '-Acdtrux', '--delete' or '--test-label' options\nTry 'tar --help' or 'tar --usage' for more information.";
    }

    const parts = args.split(' ');
    let operation = '';
    let verbose = false;
    let archive = '';
    const files: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.includes('c')) operation = 'create';
      if (part.includes('x')) operation = 'extract';
      if (part.includes('t')) operation = 'list';
      if (part.includes('v')) verbose = true;
      if (part.includes('z')) { /* gzip */ }
      if (part === '-f' && parts[i + 1]) {
        archive = parts[++i];
      } else if (part.includes('f') && !part.startsWith('-')) {
        archive = parts[++i] || '';
      } else if (!part.startsWith('-') && part !== archive) {
        files.push(part);
      }
    }

    if (!archive) {
      return 'tar: Refusing to create/extract archive to stdout/stdin';
    }

    if (operation === 'create') {
      if (files.length === 0) {
        return 'tar: Cowardly refusing to create an empty archive';
      }
      const output = verbose
        ? files.map(f => `a ${f}`).join('\n')
        : '';
      return output || `tar: ${archive}: archive created`;
    }

    if (operation === 'extract') {
      return verbose
        ? `x ./extracted_file1.txt\nx ./extracted_file2.txt\nx ./config/\nx ./config/settings.conf`
        : '';
    }

    if (operation === 'list') {
      return `drwxr-xr-x student/student   0 2024-01-15 10:30 ./
-rw-r--r-- student/student 1234 2024-01-15 10:30 ./file1.txt
-rw-r--r-- student/student  567 2024-01-15 10:30 ./file2.txt
drwxr-xr-x student/student    0 2024-01-15 10:30 ./config/`;
    }

    return 'tar: invalid operation';
  }

  /**
   * gzip - compress files
   */
  static gzip(args: string): string {
    if (!args) {
      return 'gzip: compressed data not written to a terminal';
    }

    const parts = args.split(' ');
    let decompress = false;
    let keep = false;
    let filename = '';

    for (const part of parts) {
      if (part === '-d') decompress = true;
      else if (part === '-k') keep = true;
      else if (!part.startsWith('-')) filename = part;
    }

    if (!filename) {
      return 'gzip: missing file operand';
    }

    if (decompress) {
      if (!filename.endsWith('.gz')) {
        return `gzip: ${filename}: unknown suffix -- ignored`;
      }
      const newName = filename.replace('.gz', '');
      return keep ? '' : `[${filename} -> ${newName}]`;
    }

    return keep ? '' : `[${filename} -> ${filename}.gz]`;
  }

  /**
   * gunzip - decompress files
   */
  static gunzip(args: string): string {
    return this.gzip(`-d ${args}`);
  }

  /**
   * zip - package and compress files
   */
  static zip(args: string): string {
    if (!args) {
      return 'zip error: Nothing to do!';
    }

    const parts = args.split(' ');
    let recursive = false;
    const files: string[] = [];

    for (const part of parts) {
      if (part === '-r') recursive = true;
      else if (!part.startsWith('-')) files.push(part);
    }

    if (files.length < 2) {
      return 'zip error: Nothing to do!';
    }

    const archive = files[0];
    const sources = files.slice(1);

    const output = [`  adding: ${sources[0]} (deflated 45%)`];
    if (recursive && sources.length > 0) {
      output.push(`  adding: ${sources[0]}/file1.txt (deflated 32%)`);
      output.push(`  adding: ${sources[0]}/file2.txt (stored 0%)`);
    }

    return output.join('\n');
  }

  /**
   * unzip - extract compressed files
   */
  static unzip(args: string): string {
    if (!args) {
      return 'UnZip 6.00 of 20 April 2009, by Debian.\nUsage: unzip [-Z] [-opts[modifiers]] file[.zip] [list] [-x xlist] [-d exdir]';
    }

    const parts = args.split(' ');
    let list = false;
    let archive = '';

    for (const part of parts) {
      if (part === '-l') list = true;
      else if (!part.startsWith('-')) archive = part;
    }

    if (!archive) {
      return 'unzip: missing archive name';
    }

    if (list) {
      return `Archive:  ${archive}
  Length      Date    Time    Name
---------  ---------- -----   ----
     1234  2024-01-15 10:30   file1.txt
      567  2024-01-15 10:30   file2.txt
        0  2024-01-15 10:30   config/
      890  2024-01-15 10:30   config/settings.conf
---------                     -------
     2691                     4 files`;
    }

    return `Archive:  ${archive}
  inflating: file1.txt
  inflating: file2.txt
   creating: config/
  inflating: config/settings.conf`;
  }

  // ========== ADDITIONAL NETWORK COMMANDS ==========

  /**
   * arp - manipulate the system ARP cache
   */
  static arp(args: string = ''): string {
    if (args === '-a' || args === '') {
      return `? (192.168.1.1) at 00:11:22:33:44:55 [ether] on eth0
? (192.168.1.100) at 00:aa:bb:cc:dd:ee [ether] on eth0
? (192.168.1.101) at 00:ff:ee:dd:cc:bb [ether] on eth0`;
    }

    if (args === '-n') {
      return `Address                  HWtype  HWaddress           Flags Mask            Iface
192.168.1.1              ether   00:11:22:33:44:55   C                     eth0
192.168.1.100            ether   00:aa:bb:cc:dd:ee   C                     eth0
192.168.1.101            ether   00:ff:ee:dd:cc:bb   C                     eth0`;
    }

    return 'arp: invalid option';
  }

  /**
   * ss - another utility to investigate sockets
   */
  static ss(args: string = ''): string {
    if (args.includes('-tuln') || args.includes('-tlnp')) {
      return `Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process
tcp    LISTEN  0       128      0.0.0.0:22            0.0.0.0:*      users:(("sshd",pid=1234,fd=3))
tcp    LISTEN  0       128      0.0.0.0:80            0.0.0.0:*      users:(("apache2",pid=2345,fd=4))
tcp    LISTEN  0       128      127.0.0.1:3306        0.0.0.0:*      users:(("mysqld",pid=3456,fd=33))
tcp    LISTEN  0       128      0.0.0.0:443           0.0.0.0:*      users:(("apache2",pid=2345,fd=6))`;
    }

    return `Netid State  Recv-Q Send-Q   Local Address:Port     Peer Address:Port Process
tcp   ESTAB  0      0        192.168.1.50:45678   192.168.1.100:80
tcp   ESTAB  0      0        192.168.1.50:22      192.168.1.1:54321`;
  }

  /**
   * tcpdump - dump traffic on a network (simulated)
   */
  static tcpdump(args: string = ''): string {
    const iface = args.includes('-i') ? args.split('-i')[1]?.trim().split(' ')[0] || 'eth0' : 'eth0';

    return `tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on ${iface}, link-type EN10MB (Ethernet), snapshot length 262144 bytes
10:23:45.123456 IP 192.168.1.50.45678 > 192.168.1.100.80: Flags [S], seq 1234567890
10:23:45.123789 IP 192.168.1.100.80 > 192.168.1.50.45678: Flags [S.], seq 987654321, ack 1234567891
10:23:45.124012 IP 192.168.1.50.45678 > 192.168.1.100.80: Flags [.], ack 1
10:23:45.125678 IP 192.168.1.50.45678 > 192.168.1.100.80: Flags [P.], seq 1:73, ack 1, length 72: HTTP: GET / HTTP/1.1
10:23:45.234567 IP 192.168.1.100.80 > 192.168.1.50.45678: Flags [P.], seq 1:1461, ack 73, length 1460: HTTP: HTTP/1.1 200 OK

5 packets captured
5 packets received by filter
0 packets dropped by kernel
[Press Ctrl+C to stop capture - this is a simulation]`;
  }

  // ========== MISC COMMANDS ==========

  /**
   * alias - define or display aliases
   */
  static alias(args: string = ''): string {
    if (!args) {
      return `alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'
alias cls='clear'
alias ..='cd ..'
alias ...='cd ../..'`;
    }

    // Setting alias (simulated)
    return '';
  }

  /**
   * source / . - execute commands from a file
   */
  static source(args: string): string {
    if (!args) {
      return 'bash: source: filename argument required';
    }

    return `[Sourcing ${args}...]
[Environment variables loaded]`;
  }

  /**
   * exit - exit the shell
   */
  static exit(): string {
    return 'logout\n[Session terminated - This is a simulated environment]';
  }

  /**
   * dmesg - print kernel ring buffer
   */
  static dmesg(args: string = ''): string {
    const messages = `[    0.000000] Linux version 6.1.0-kali9-amd64 (devel@kali.org)
[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-6.1.0-kali9-amd64 root=/dev/sda1 ro quiet
[    0.000000] BIOS-provided physical RAM map:
[    0.000000] BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable
[    0.523456] CPU: Physical Processor ID: 0
[    0.523789] CPU: Processor Core ID: 0
[    1.234567] NET: Registered PF_INET protocol family
[    1.567890] eth0: registered PHC clock
[    2.345678] EXT4-fs (sda1): mounted filesystem with ordered data mode
[    3.456789] systemd[1]: Started Journal Service.`;

    if (args.includes('-T')) {
      // Add timestamps
      const now = new Date();
      return messages.split('\n').map(line =>
        `[${now.toISOString()}] ${line.substring(line.indexOf(']') + 2)}`
      ).join('\n');
    }

    return messages;
  }

  /**
   * lsof - list open files
   */
  static lsof(args: string = ''): string {
    if (args.includes('-i')) {
      return `COMMAND    PID    USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
sshd      1234    root    3u  IPv4  12345      0t0  TCP *:ssh (LISTEN)
apache2   2345    root    4u  IPv4  23456      0t0  TCP *:http (LISTEN)
apache2   2345    root    6u  IPv4  23457      0t0  TCP *:https (LISTEN)
mysqld    3456   mysql   33u  IPv4  34567      0t0  TCP localhost:mysql (LISTEN)`;
    }

    return `COMMAND    PID    USER   FD   TYPE DEVICE SIZE/OFF    NODE NAME
bash      1000 student  cwd    DIR    8,1     4096  131073 /home/student
bash      1000 student  rtd    DIR    8,1     4096       2 /
bash      1000 student  txt    REG    8,1  1113504  262155 /bin/bash
bash      1000 student  mem    REG    8,1  2030544  262252 /lib/x86_64-linux-gnu/libc-2.31.so`;
  }

  /**
   * mount - mount a filesystem
   */
  static mount(args: string = ''): string {
    if (!args) {
      return `/dev/sda1 on / type ext4 (rw,relatime)
/dev/sda2 on /home type ext4 (rw,relatime)
tmpfs on /run type tmpfs (rw,nosuid,nodev,mode=755)
tmpfs on /tmp type tmpfs (rw,nosuid,nodev)
proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)
sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)`;
    }

    return 'mount: only root can do that';
  }

  /**
   * groups - print the groups a user is in
   */
  static groups(args: string = ''): string {
    const user = args || 'student';
    if (user === 'student') {
      return 'student sudo video plugdev netdev';
    }
    if (user === 'root') {
      return 'root';
    }
    return `groups: '${user}': no such user`;
  }

  /**
   * passwd - change user password (simulated)
   */
  static passwd(args: string = ''): string {
    return `Changing password for ${args || 'student'}.
Current password: 
[This is a simulated environment - password change not available]`;
  }

  /**
   * su - switch user
   */
  static su(args: string = ''): string {
    if (args === '-' || args === 'root' || args === '- root') {
      return `Password: 
su: Authentication failure
[Use sudo for elevated privileges in this simulation]`;
    }
    return `su: user ${args || 'root'} does not exist or authentication failed`;
  }
}

