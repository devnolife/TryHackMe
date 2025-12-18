/**
 * Command Router
 * Routes commands to appropriate simulators and validates them
 */

import { OsintSimulator } from './osint-simulator';
import { NmapSimulator } from './nmap-simulator';
import { VulnSimulator } from './vuln-simulator';
import { WebSimulator } from './web-simulator';

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
Available Commands:
==================

OSINT Tools:
  whois <domain>              - WHOIS lookup for domain information
  nslookup <domain>           - DNS lookup
  dig <domain> [type]         - DNS query (A, MX, NS, TXT)
  host <domain>               - Simple DNS lookup
  geoip <ip>                  - IP geolocation lookup
  traceroute <host>           - Trace route to host

Network Scanning:
  nmap -sn <network>          - Ping scan (host discovery)
  nmap -sS <target>           - TCP SYN scan
  nmap -sV <target>           - Service version detection
  nmap -O <target>            - OS detection
  nmap -A <target>            - Aggressive scan (OS, version, scripts)
  nmap -sU <target>           - UDP scan

Vulnerability Assessment:
  searchsploit <query>        - Search exploit database
  hashid <hash>               - Identify hash type
  john <hash>                 - Crack password hash
  nikto <target>              - Web server vulnerability scanner

Web Exploitation:
  sqlmap --url <url>          - SQL injection testing
  test-xss <payload> <url>    - XSS vulnerability testing
  dirb <target>               - Directory brute force

General:
  help                        - Show this help message
  clear                       - Clear the terminal

Examples:
  whois example-company.com
  nslookup example-company.com
  nmap -sS 192.168.1.100
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
