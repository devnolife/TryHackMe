/**
 * Metasploit Framework Simulator
 * Simulates the Metasploit Framework for educational purposes
 */

export interface MsfModule {
  name: string;
  type: 'exploit' | 'auxiliary' | 'post' | 'payload' | 'encoder' | 'nop';
  rank: 'excellent' | 'great' | 'good' | 'normal' | 'average' | 'low' | 'manual';
  description: string;
  platform: string[];
  targets?: string[];
  options: MsfOption[];
  references?: string[];
}

export interface MsfOption {
  name: string;
  required: boolean;
  description: string;
  defaultValue?: string;
  currentValue?: string;
}

export interface MsfSession {
  id: number;
  type: 'meterpreter' | 'shell';
  targetHost: string;
  targetPort: number;
  via: string;
  info: string;
}

export class MetasploitSimulator {
  private static currentModule: MsfModule | null = null;
  private static sessions: MsfSession[] = [];
  private static sessionIdCounter = 1;
  private static moduleOptions: Record<string, string> = {};

  // Available modules database
  private static readonly MODULES: Record<string, MsfModule> = {
    'exploit/multi/handler': {
      name: 'exploit/multi/handler',
      type: 'exploit',
      rank: 'manual',
      description: 'Generic Payload Handler',
      platform: ['multi'],
      options: [
        { name: 'PAYLOAD', required: true, description: 'The payload to use' },
        { name: 'LHOST', required: true, description: 'The listen address' },
        { name: 'LPORT', required: true, description: 'The listen port', defaultValue: '4444' },
      ],
    },
    'exploit/unix/ftp/vsftpd_234_backdoor': {
      name: 'exploit/unix/ftp/vsftpd_234_backdoor',
      type: 'exploit',
      rank: 'excellent',
      description: 'VSFTPD v2.3.4 Backdoor Command Execution',
      platform: ['unix'],
      targets: ['Automatic'],
      options: [
        { name: 'RHOSTS', required: true, description: 'The target host(s)' },
        { name: 'RPORT', required: true, description: 'The target port', defaultValue: '21' },
      ],
      references: ['CVE-2011-2523', 'OSVDB-73573'],
    },
    'exploit/windows/smb/ms17_010_eternalblue': {
      name: 'exploit/windows/smb/ms17_010_eternalblue',
      type: 'exploit',
      rank: 'excellent',
      description: 'MS17-010 EternalBlue SMB Remote Windows Kernel Pool Corruption',
      platform: ['windows'],
      targets: ['Windows 7', 'Windows Server 2008 R2', 'Windows 8.1', 'Windows Server 2012'],
      options: [
        { name: 'RHOSTS', required: true, description: 'The target host(s)' },
        { name: 'RPORT', required: true, description: 'The target port', defaultValue: '445' },
        { name: 'SMBDomain', required: false, description: 'The Windows domain to use', defaultValue: '.' },
        { name: 'SMBUser', required: false, description: 'The username to authenticate as' },
        { name: 'SMBPass', required: false, description: 'The password for the specified username' },
      ],
      references: ['CVE-2017-0143', 'CVE-2017-0144', 'MS17-010'],
    },
    'exploit/windows/smb/ms08_067_netapi': {
      name: 'exploit/windows/smb/ms08_067_netapi',
      type: 'exploit',
      rank: 'great',
      description: 'MS08-067 Microsoft Server Service Relative Path Stack Corruption',
      platform: ['windows'],
      targets: ['Windows XP SP2/SP3', 'Windows 2003 SP1/SP2'],
      options: [
        { name: 'RHOSTS', required: true, description: 'The target host(s)' },
        { name: 'RPORT', required: true, description: 'The target port', defaultValue: '445' },
      ],
      references: ['CVE-2008-4250', 'MS08-067'],
    },
    'exploit/multi/http/apache_mod_cgi_bash_env_exec': {
      name: 'exploit/multi/http/apache_mod_cgi_bash_env_exec',
      type: 'exploit',
      rank: 'excellent',
      description: 'Apache mod_cgi Bash Environment Variable Code Injection (Shellshock)',
      platform: ['linux', 'unix'],
      options: [
        { name: 'RHOSTS', required: true, description: 'The target host(s)' },
        { name: 'RPORT', required: true, description: 'The target port', defaultValue: '80' },
        { name: 'TARGETURI', required: true, description: 'Path to CGI script', defaultValue: '/cgi-bin/vulnerable.cgi' },
      ],
      references: ['CVE-2014-6271', 'CVE-2014-6278'],
    },
    'auxiliary/scanner/ssh/ssh_login': {
      name: 'auxiliary/scanner/ssh/ssh_login',
      type: 'auxiliary',
      rank: 'normal',
      description: 'SSH Login Check Scanner',
      platform: ['multi'],
      options: [
        { name: 'RHOSTS', required: true, description: 'The target host(s)' },
        { name: 'RPORT', required: true, description: 'The target port', defaultValue: '22' },
        { name: 'USERNAME', required: false, description: 'A specific username to authenticate as' },
        { name: 'PASSWORD', required: false, description: 'A specific password to authenticate with' },
        { name: 'USERPASS_FILE', required: false, description: 'File containing users and passwords' },
        { name: 'STOP_ON_SUCCESS', required: false, description: 'Stop guessing when a credential works', defaultValue: 'false' },
      ],
    },
    'auxiliary/scanner/smb/smb_ms17_010': {
      name: 'auxiliary/scanner/smb/smb_ms17_010',
      type: 'auxiliary',
      rank: 'normal',
      description: 'MS17-010 SMB RCE Detection',
      platform: ['windows'],
      options: [
        { name: 'RHOSTS', required: true, description: 'The target host(s)' },
        { name: 'RPORT', required: true, description: 'The target port', defaultValue: '445' },
        { name: 'THREADS', required: false, description: 'The number of concurrent threads', defaultValue: '1' },
      ],
    },
    'auxiliary/scanner/portscan/tcp': {
      name: 'auxiliary/scanner/portscan/tcp',
      type: 'auxiliary',
      rank: 'normal',
      description: 'TCP Port Scanner',
      platform: ['multi'],
      options: [
        { name: 'RHOSTS', required: true, description: 'The target host(s)' },
        { name: 'PORTS', required: true, description: 'Ports to scan', defaultValue: '1-10000' },
        { name: 'THREADS', required: false, description: 'The number of concurrent threads', defaultValue: '1' },
        { name: 'TIMEOUT', required: false, description: 'The socket connect timeout', defaultValue: '1000' },
      ],
    },
    'post/multi/recon/local_exploit_suggester': {
      name: 'post/multi/recon/local_exploit_suggester',
      type: 'post',
      rank: 'normal',
      description: 'Multi Recon Local Exploit Suggester',
      platform: ['multi'],
      options: [
        { name: 'SESSION', required: true, description: 'The session to run this module on' },
        { name: 'SHOWDESCRIPTION', required: false, description: 'Display a detailed description', defaultValue: 'false' },
      ],
    },
    'post/windows/gather/hashdump': {
      name: 'post/windows/gather/hashdump',
      type: 'post',
      rank: 'normal',
      description: 'Windows Gather Local User Account Password Hashes (Registry)',
      platform: ['windows'],
      options: [
        { name: 'SESSION', required: true, description: 'The session to run this module on' },
      ],
    },
    'payload/windows/meterpreter/reverse_tcp': {
      name: 'payload/windows/meterpreter/reverse_tcp',
      type: 'payload',
      rank: 'normal',
      description: 'Windows Meterpreter (Reflective Injection), Reverse TCP Stager',
      platform: ['windows'],
      options: [
        { name: 'LHOST', required: true, description: 'The listen address' },
        { name: 'LPORT', required: true, description: 'The listen port', defaultValue: '4444' },
        { name: 'EXITFUNC', required: false, description: 'Exit technique', defaultValue: 'process' },
      ],
    },
    'payload/linux/x86/meterpreter/reverse_tcp': {
      name: 'payload/linux/x86/meterpreter/reverse_tcp',
      type: 'payload',
      rank: 'normal',
      description: 'Linux Meterpreter, Reverse TCP Stager',
      platform: ['linux'],
      options: [
        { name: 'LHOST', required: true, description: 'The listen address' },
        { name: 'LPORT', required: true, description: 'The listen port', defaultValue: '4444' },
      ],
    },
  };

  /**
   * Get MSF banner
   */
  static banner(): string {
    return `
                                                  
     \x1b[31m,--.\x1b[0m                                                    
   \x1b[31m,--.'|\x1b[0m                                                    
   |  | :                        \x1b[34m__  ,--.\x1b[0m                     
   :  : '                       \x1b[34m,' ,'/ /|\x1b[0m                     
   |  ' |      \x1b[32m.---.    ,---.\x1b[0m  \x1b[34m'  | |' |\x1b[0m   \x1b[33m,---.     ,---.\x1b[0m  
   '  | |     \x1b[32m/.  ./|  /     \\\x1b[0m \x1b[34m|  |   ,'\x1b[0m  \x1b[33m/     \\   /     \\\x1b[0m 
   |  | :   \x1b[32m.-' . ' | /    / '\x1b[0m\x1b[34m'  :  /\x1b[0m   \x1b[33m/    /  | /    /  |\x1b[0m
   '  : |__\x1b[32m/___/ \\: |.    ' / \x1b[0m\x1b[34m|  | '\x1b[0m   \x1b[33m.    ' / |.    ' / |\x1b[0m
   |  | '.'\x1b[32m.   \\  ' .'   ; : |\x1b[0m\x1b[34m;  : |\x1b[0m   \x1b[33m'   ;   /|'   ;   /|\x1b[0m
   ;  :    ;\x1b[32m\\   \\   ' '   | '/ \x1b[0m\x1b[34m|  , ;\x1b[0m   \x1b[33m'   |  / |'   |  / |\x1b[0m
   |  ,   /  \x1b[32m\\   \\    |   :    :\x1b[0m \x1b[34m---'\x1b[0m    \x1b[33m|   :    ||   :    |\x1b[0m
    ---'-'    \x1b[32m\\   \\ |  \\   \\  /\x1b[0m           \x1b[33m\\   \\  /  \\   \\  /\x1b[0m 
               \x1b[32m'---"    '----'\x1b[0m            \x1b[33m'----'    '----'\x1b[0m  


       =[ \x1b[34mmetasploit v6.3.43-dev\x1b[0m                          ]
+ -- --=[ \x1b[32m2376 exploits - 1232 auxiliary - 416 post\x1b[0m       ]
+ -- --=[ \x1b[32m1388 payloads - 46 encoders - 11 nops\x1b[0m           ]
+ -- --=[ \x1b[32m9 evasion\x1b[0m                                        ]

Metasploit Documentation: https://docs.metasploit.com/

\x1b[33m[*]\x1b[0m Starting persistent handler(s)...
msf6 > `;
  }

  /**
   * Execute msfconsole command
   */
  static execute(command: string): string {
    const args = command.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case 'msfconsole':
        return this.banner();
      case 'help':
      case '?':
        return this.help();
      case 'search':
        return this.search(args.slice(1).join(' '));
      case 'use':
        return this.use(args.slice(1).join(' '));
      case 'info':
        return this.info(args[1]);
      case 'show':
        return this.show(args[1]);
      case 'set':
        return this.set(args[1], args.slice(2).join(' '));
      case 'setg':
        return this.set(args[1], args.slice(2).join(' '), true);
      case 'unset':
        return this.unset(args[1]);
      case 'options':
        return this.options();
      case 'run':
      case 'exploit':
        return this.exploit();
      case 'back':
        return this.back();
      case 'sessions':
        return this.showSessions(args[1]);
      case 'exit':
      case 'quit':
        return 'Exiting msf console...';
      case 'db_status':
        return this.dbStatus();
      case 'workspace':
        return this.workspace(args.slice(1));
      default:
        return `[-] Unknown command: ${cmd}. Type 'help' for available commands.`;
    }
  }

  /**
   * Help command
   */
  private static help(): string {
    return `
Core Commands
=============

    Command       Description
    -------       -----------
    ?             Help menu
    back          Move back from the current context
    exit          Exit the console
    help          Help menu
    info          Displays information about one or more modules
    options       Displays options for the current module
    quit          Exit the console
    run           Launches the selected module
    search        Searches module names and descriptions
    sessions      Dump session listings and display information
    set           Sets a context-specific variable to a value
    setg          Sets a global variable to a value
    show          Displays modules of a given type, or all modules
    unset         Unsets one or more context-specific variables
    use           Interacts with a module by name or search term

Database Commands
=================

    Command        Description
    -------        -----------
    db_status      Show the current database status
    workspace      Switch between database workspaces

Module Commands
===============

    Command       Description
    -------       -----------
    exploit       Launch the selected exploit module
    info          Display information about one or more modules
    options       Display the current module's options
    run           Alias for 'exploit'
`;
  }

  /**
   * Search for modules
   */
  private static search(query: string): string {
    if (!query) {
      return '[-] Please provide a search term';
    }

    const searchTerm = query.toLowerCase();
    const matches: MsfModule[] = [];

    for (const [_, module] of Object.entries(this.MODULES)) {
      if (
        module.name.toLowerCase().includes(searchTerm) ||
        module.description.toLowerCase().includes(searchTerm)
      ) {
        matches.push(module);
      }
    }

    if (matches.length === 0) {
      return `[-] No modules found matching '${query}'`;
    }

    let output = `\nMatching Modules\n================\n\n`;
    output += `   #  Name                                                 Disclosure Date  Rank       Description\n`;
    output += `   -  ----                                                 ---------------  ----       -----------\n`;

    matches.forEach((module, index) => {
      const name = module.name.padEnd(55);
      const rank = module.rank.padEnd(10);
      output += `   ${index}  ${name} 2023-01-01       ${rank} ${module.description}\n`;
    });

    output += `\nInteract with a module by name or index. For example \x1b[32minfo 0\x1b[0m, \x1b[32muse 0\x1b[0m or \x1b[32muse ${matches[0]?.name || 'exploit/...'}\x1b[0m\n`;

    return output;
  }

  /**
   * Use a module
   */
  private static use(moduleName: string): string {
    if (!moduleName) {
      return '[-] No module name specified';
    }

    // Check if it's an index
    const index = parseInt(moduleName);
    if (!isNaN(index)) {
      const modules = Object.values(this.MODULES);
      if (index >= 0 && index < modules.length) {
        this.currentModule = modules[index];
        this.moduleOptions = {};
        return `[*] Using configured module ${this.currentModule.name}\nmsf6 ${this.currentModule.type}(\x1b[31m${this.currentModule.name.split('/').pop()}\x1b[0m) > `;
      }
    }

    const module = this.MODULES[moduleName];
    if (!module) {
      return `[-] Failed to load module: ${moduleName}`;
    }

    this.currentModule = module;
    this.moduleOptions = {};

    // Set default values
    module.options.forEach(opt => {
      if (opt.defaultValue) {
        this.moduleOptions[opt.name] = opt.defaultValue;
      }
    });

    return `[*] Using configured module ${module.name}\nmsf6 ${module.type}(\x1b[31m${module.name.split('/').pop()}\x1b[0m) > `;
  }

  /**
   * Show module info
   */
  private static info(moduleName?: string): string {
    const module = moduleName ? this.MODULES[moduleName] : this.currentModule;

    if (!module) {
      return '[-] No module selected. Use the "use" command to select a module.';
    }

    let output = `
       Name: ${module.name}
     Module: ${module.type}
   Platform: ${module.platform.join(', ')}
       Rank: ${module.rank}

Provided by:
  Metasploit Framework Team

Description:
  ${module.description}

`;

    if (module.references) {
      output += `References:\n`;
      module.references.forEach(ref => {
        output += `  ${ref}\n`;
      });
      output += '\n';
    }

    if (module.targets) {
      output += `Available targets:\n`;
      module.targets.forEach((target, index) => {
        output += `  Id  Name\n`;
        output += `  --  ----\n`;
        output += `  ${index}   ${target}\n`;
      });
    }

    return output;
  }

  /**
   * Show modules or options
   */
  private static show(what?: string): string {
    switch (what?.toLowerCase()) {
      case 'exploits':
        return this.showModulesByType('exploit');
      case 'auxiliary':
        return this.showModulesByType('auxiliary');
      case 'post':
        return this.showModulesByType('post');
      case 'payloads':
        return this.showModulesByType('payload');
      case 'options':
        return this.options();
      case 'targets':
        return this.showTargets();
      case 'sessions':
        return this.showSessions();
      default:
        return `[-] Invalid parameter "${what}", use "show -h" for more information`;
    }
  }

  /**
   * Show modules by type
   */
  private static showModulesByType(type: string): string {
    const modules = Object.values(this.MODULES).filter(m => m.type === type);

    if (modules.length === 0) {
      return `[-] No ${type} modules found`;
    }

    let output = `\n${type.charAt(0).toUpperCase() + type.slice(1)} Modules\n${'='.repeat(type.length + 8)}\n\n`;
    output += `   #  Name                                                 Rank       Description\n`;
    output += `   -  ----                                                 ----       -----------\n`;

    modules.forEach((module, index) => {
      output += `   ${index}  ${module.name.padEnd(55)} ${module.rank.padEnd(10)} ${module.description}\n`;
    });

    return output;
  }

  /**
   * Show targets for current module
   */
  private static showTargets(): string {
    if (!this.currentModule) {
      return '[-] No module selected';
    }

    if (!this.currentModule.targets) {
      return '[-] No targets available for this module';
    }

    let output = `\nExploit targets:\n\n`;
    output += `   Id  Name\n`;
    output += `   --  ----\n`;

    this.currentModule.targets.forEach((target, index) => {
      output += `   ${index}   ${target}\n`;
    });

    return output;
  }

  /**
   * Display module options
   */
  private static options(): string {
    if (!this.currentModule) {
      return '[-] No module selected. Use the "use" command to select a module.';
    }

    let output = `\nModule options (${this.currentModule.name}):\n\n`;
    output += `   Name           Current Setting  Required  Description\n`;
    output += `   ----           ---------------  --------  -----------\n`;

    this.currentModule.options.forEach(opt => {
      const currentValue = this.moduleOptions[opt.name] || opt.defaultValue || '';
      const required = opt.required ? 'yes' : 'no';
      output += `   ${opt.name.padEnd(14)} ${currentValue.padEnd(16)} ${required.padEnd(9)} ${opt.description}\n`;
    });

    return output;
  }

  /**
   * Set an option
   */
  private static set(name: string, value: string, global: boolean = false): string {
    if (!name) {
      return '[-] Usage: set <option> <value>';
    }

    if (!this.currentModule && !global) {
      return '[-] No module selected';
    }

    this.moduleOptions[name.toUpperCase()] = value;
    return `${name.toUpperCase()} => ${value}`;
  }

  /**
   * Unset an option
   */
  private static unset(name: string): string {
    if (!name) {
      return '[-] Usage: unset <option>';
    }

    delete this.moduleOptions[name.toUpperCase()];
    return `[*] Unsetting ${name.toUpperCase()}...`;
  }

  /**
   * Run/exploit
   */
  private static exploit(): string {
    if (!this.currentModule) {
      return '[-] No module selected';
    }

    // Check required options
    const missing: string[] = [];
    this.currentModule.options.forEach(opt => {
      if (opt.required && !this.moduleOptions[opt.name]) {
        missing.push(opt.name);
      }
    });

    if (missing.length > 0) {
      return `[-] The following options are required but not set:\n${missing.map(m => `   - ${m}`).join('\n')}\n\nUse 'set <option> <value>' to configure the missing options.`;
    }

    const rhosts = this.moduleOptions['RHOSTS'] || '192.168.1.100';

    // Simulate exploit execution
    let output = `[*] Started reverse TCP handler on ${this.moduleOptions['LHOST'] || '0.0.0.0'}:${this.moduleOptions['LPORT'] || '4444'}\n`;

    if (this.currentModule.type === 'exploit') {
      output += `[*] ${rhosts} - Connecting to target...\n`;
      output += `[*] ${rhosts} - Sending exploit payload...\n`;

      // Simulate successful exploitation for known vulnerable targets
      if (this.currentModule.name.includes('vsftpd') ||
        this.currentModule.name.includes('ms17_010') ||
        this.currentModule.name.includes('ms08_067')) {

        const newSession: MsfSession = {
          id: this.sessionIdCounter++,
          type: 'meterpreter',
          targetHost: rhosts,
          targetPort: parseInt(this.moduleOptions['RPORT'] || '445'),
          via: this.currentModule.name,
          info: 'NT AUTHORITY\\SYSTEM @ TARGET',
        };
        this.sessions.push(newSession);

        output += `[*] ${rhosts} - Exploit completed, but no session was created.\n`;
        output += `[*] Sending stage (175686 bytes) to ${rhosts}\n`;
        output += `[*] Meterpreter session ${newSession.id} opened (${this.moduleOptions['LHOST'] || '10.10.14.1'}:${this.moduleOptions['LPORT'] || '4444'} -> ${rhosts}:49152)\n\n`;
        output += `meterpreter > `;
      } else {
        output += `[-] ${rhosts} - Exploit aborted due to failure: not-vulnerable\n`;
        output += `[*] Exploit completed, but no session was created.\n`;
      }
    } else if (this.currentModule.type === 'auxiliary') {
      output += `[*] Running module against ${rhosts}...\n`;

      if (this.currentModule.name.includes('smb_ms17_010')) {
        output += `[+] ${rhosts}:445 - Host is likely VULNERABLE to MS17-010! - Windows 7 Professional 7601 Service Pack 1 x64 (64-bit)\n`;
        output += `[*] Scanned 1 of 1 hosts (100% complete)\n`;
        output += `[*] Auxiliary module execution completed\n`;
      } else if (this.currentModule.name.includes('ssh_login')) {
        output += `[-] ${rhosts}:22 - Failed: 'root:password'\n`;
        output += `[-] ${rhosts}:22 - Failed: 'admin:admin'\n`;
        output += `[+] ${rhosts}:22 - Success: 'user:password123'\n`;
        output += `[*] Scanned 1 of 1 hosts (100% complete)\n`;
        output += `[*] Auxiliary module execution completed\n`;
      } else if (this.currentModule.name.includes('portscan')) {
        output += `[+] ${rhosts}:22 - TCP OPEN\n`;
        output += `[+] ${rhosts}:80 - TCP OPEN\n`;
        output += `[+] ${rhosts}:443 - TCP OPEN\n`;
        output += `[+] ${rhosts}:445 - TCP OPEN\n`;
        output += `[*] Scanned 1 of 1 hosts (100% complete)\n`;
        output += `[*] Auxiliary module execution completed\n`;
      } else {
        output += `[*] Auxiliary module execution completed\n`;
      }
    }

    return output;
  }

  /**
   * Go back to main console
   */
  private static back(): string {
    this.currentModule = null;
    this.moduleOptions = {};
    return 'msf6 > ';
  }

  /**
   * Show sessions
   */
  private static showSessions(arg?: string): string {
    if (arg === '-i' || arg === '-l') {
      // Interact with session
      return '[-] Usage: sessions -i <session_id>';
    }

    if (this.sessions.length === 0) {
      return '[-] No active sessions.';
    }

    let output = `\nActive sessions\n===============\n\n`;
    output += `  Id  Name  Type                     Information                    Connection\n`;
    output += `  --  ----  ----                     -----------                    ----------\n`;

    this.sessions.forEach(session => {
      output += `  ${session.id}         ${session.type.padEnd(24)} ${session.info.padEnd(30)} ${session.targetHost}:${session.targetPort}\n`;
    });

    return output;
  }

  /**
   * Database status
   */
  private static dbStatus(): string {
    return `[*] Connected to msf. Connection type: postgresql.`;
  }

  /**
   * Workspace command
   */
  private static workspace(args: string[]): string {
    if (args.length === 0) {
      return `* default\n  lab1\n  pentest\n`;
    }

    if (args[0] === '-a') {
      return `[*] Added workspace: ${args[1] || 'new_workspace'}`;
    }

    return `[*] Workspace: ${args[0]}`;
  }

  /**
   * Get prompt based on current state
   */
  static getPrompt(): string {
    if (this.currentModule) {
      return `msf6 ${this.currentModule.type}(\x1b[31m${this.currentModule.name.split('/').pop()}\x1b[0m) > `;
    }
    return 'msf6 > ';
  }

  /**
   * Meterpreter shell commands
   */
  static meterpreterCommand(command: string): string {
    const args = command.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case 'help':
        return this.meterpreterHelp();
      case 'sysinfo':
        return this.sysinfo();
      case 'getuid':
        return 'Server username: NT AUTHORITY\\SYSTEM';
      case 'getsystem':
        return '...got system via technique 1 (Named Pipe Impersonation (In Memory/Admin)).';
      case 'hashdump':
        return this.hashdump();
      case 'ps':
        return this.ps();
      case 'shell':
        return 'Process 3568 created.\nChannel 1 created.\nMicrosoft Windows [Version 6.1.7601]\nCopyright (c) 2009 Microsoft Corporation. All rights reserved.\n\nC:\\Windows\\system32>';
      case 'pwd':
        return 'C:\\Windows\\system32';
      case 'ls':
        return this.meterpreterLs();
      case 'download':
        return `[*] Downloading: ${args[1] || 'file'} -> ${args[1] || 'file'}\n[*] Downloaded 1.00 KiB of 1.00 KiB (100.0%): ${args[1] || 'file'}`;
      case 'upload':
        return `[*] uploading  : ${args[1] || 'file'} -> ${args[2] || 'C:\\Windows\\Temp\\file'}\n[*] uploaded   : ${args[1] || 'file'} -> ${args[2] || 'C:\\Windows\\Temp\\file'}`;
      case 'migrate':
        return `[*] Migrating from 1234 to ${args[1] || '5678'}...\n[*] Migration completed successfully.`;
      case 'background':
        return '[*] Backgrounding session 1...\nmsf6 > ';
      case 'exit':
        return '[*] Shutting down Meterpreter...\nmsf6 > ';
      default:
        return `[-] Unknown command: ${cmd}. Type 'help' for available commands.`;
    }
  }

  /**
   * Meterpreter help
   */
  private static meterpreterHelp(): string {
    return `
Core Commands
=============

    Command                   Description
    -------                   -----------
    background                Backgrounds the current session
    exit                      Terminate the meterpreter session
    help                      Help menu
    migrate                   Migrate the server to another process

Stdapi: File system Commands
============================

    Command       Description
    -------       -----------
    cd            Change directory
    download      Download a file or directory
    ls            List files
    pwd           Print working directory
    upload        Upload a file or directory

Stdapi: System Commands
=======================

    Command       Description
    -------       -----------
    getuid        Get the user that the server is running as
    getsystem     Attempt to elevate your privilege to that of local system
    ps            List running processes
    shell         Drop into a system command shell
    sysinfo       Gets information about the remote system

Priv: Password database Commands
================================

    Command       Description
    -------       -----------
    hashdump      Dumps the contents of the SAM database
`;
  }

  /**
   * Sysinfo command
   */
  private static sysinfo(): string {
    return `Computer        : TARGET
OS              : Windows 7 (6.1 Build 7601, Service Pack 1).
Architecture    : x64
System Language : en_US
Domain          : WORKGROUP
Logged On Users : 2
Meterpreter     : x64/windows`;
  }

  /**
   * Hashdump command
   */
  private static hashdump(): string {
    return `Administrator:500:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
user:1001:aad3b435b51404eeaad3b435b51404ee:5f4dcc3b5aa765d61d8327deb882cf99:::
admin:1002:aad3b435b51404eeaad3b435b51404ee:e10adc3949ba59abbe56e057f20f883e:::`;
  }

  /**
   * Process list
   */
  private static ps(): string {
    return `
Process List
============

 PID   PPID  Name                  Arch  Session  User                          Path
 ---   ----  ----                  ----  -------  ----                          ----
 0     0     [System Process]
 4     0     System                x64   0
 308   4     smss.exe              x64   0        NT AUTHORITY\\SYSTEM
 416   404   csrss.exe             x64   0        NT AUTHORITY\\SYSTEM
 468   460   csrss.exe             x64   1        NT AUTHORITY\\SYSTEM
 476   404   wininit.exe           x64   0        NT AUTHORITY\\SYSTEM
 516   460   winlogon.exe          x64   1        NT AUTHORITY\\SYSTEM
 568   476   services.exe          x64   0        NT AUTHORITY\\SYSTEM
 584   476   lsass.exe             x64   0        NT AUTHORITY\\SYSTEM
 592   476   lsm.exe               x64   0        NT AUTHORITY\\SYSTEM
 696   568   svchost.exe           x64   0        NT AUTHORITY\\SYSTEM
 772   568   svchost.exe           x64   0        NT AUTHORITY\\NETWORK SERVICE
 856   568   svchost.exe           x64   0        NT AUTHORITY\\LOCAL SERVICE
 1068  568   spoolsv.exe           x64   0        NT AUTHORITY\\SYSTEM
 1234  568   meterpreter.exe       x64   0        NT AUTHORITY\\SYSTEM          C:\\Windows\\Temp\\meterpreter.exe
`;
  }

  /**
   * Meterpreter ls
   */
  private static meterpreterLs(): string {
    return `
Listing: C:\\Windows\\system32
============================

Mode              Size      Type  Last modified              Name
----              ----      ----  -------------              ----
100777/rwxrwxrwx  339456    fil   2019-03-18 13:41:38 -0400  cmd.exe
100777/rwxrwxrwx  1024000   fil   2019-03-18 13:41:38 -0400  config
40777/rwxrwxrwx   0         dir   2019-03-18 13:41:38 -0400  drivers
100666/rw-rw-rw-  67584     fil   2019-03-18 13:41:38 -0400  calc.exe
100777/rwxrwxrwx  9728      fil   2019-03-18 13:41:38 -0400  net.exe
100777/rwxrwxrwx  83456     fil   2019-03-18 13:41:38 -0400  netstat.exe
100777/rwxrwxrwx  46080     fil   2019-03-18 13:41:38 -0400  tasklist.exe
`;
  }
}

export default MetasploitSimulator;
