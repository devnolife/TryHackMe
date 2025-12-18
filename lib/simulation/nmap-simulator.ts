/**
 * Nmap Simulator
 * Simulates Nmap scanning functionality
 */

export interface NmapPort {
  port: number;
  state: 'open' | 'closed' | 'filtered';
  service: string;
  version?: string;
}

export interface NmapHost {
  ip: string;
  hostname?: string;
  status: 'up' | 'down';
  ports: NmapPort[];
  os?: string;
}

export class NmapSimulator {
  private static hosts: Record<string, NmapHost> = {
    '192.168.1.100': {
      ip: '192.168.1.100',
      hostname: 'target.example-company.com',
      status: 'up',
      os: 'Linux 3.10.0-1160 (CentOS 7)',
      ports: [
        { port: 22, state: 'open', service: 'ssh', version: 'OpenSSH 7.4' },
        { port: 80, state: 'open', service: 'http', version: 'Apache 2.4.6' },
        { port: 443, state: 'open', service: 'https', version: 'Apache 2.4.6' },
        { port: 3306, state: 'open', service: 'mysql', version: 'MySQL 5.7.33' },
        { port: 5432, state: 'open', service: 'postgresql', version: 'PostgreSQL 12.8' },
      ],
    },
    '192.168.1.101': {
      ip: '192.168.1.101',
      hostname: 'web.example-company.com',
      status: 'up',
      os: 'Ubuntu Linux 20.04',
      ports: [
        { port: 22, state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1' },
        { port: 80, state: 'open', service: 'http', version: 'nginx 1.18.0' },
        { port: 443, state: 'open', service: 'https', version: 'nginx 1.18.0' },
      ],
    },
    '10.0.0.50': {
      ip: '10.0.0.50',
      hostname: 'server.demo-company.com',
      status: 'up',
      os: 'Windows Server 2019',
      ports: [
        { port: 80, state: 'open', service: 'http', version: 'Microsoft IIS 10.0' },
        { port: 443, state: 'open', service: 'https', version: 'Microsoft IIS 10.0' },
        { port: 3389, state: 'open', service: 'ms-wbt-server', version: 'Microsoft Terminal Services' },
        { port: 445, state: 'open', service: 'microsoft-ds', version: 'Windows Server 2019' },
      ],
    },
  };

  /**
   * Simulate basic ping scan (-sn)
   */
  static pingScan(network: string): string {
    const baseIP = network.split('/')[0].split('.').slice(0, 3).join('.');
    const activeHosts = Object.keys(this.hosts).filter(ip => ip.startsWith(baseIP));

    let output = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;
    output += `Nmap scan report for ${network}\n`;
    output += `Host discovery:\n\n`;

    activeHosts.forEach(ip => {
      const host = this.hosts[ip];
      output += `Nmap scan report for ${host.hostname || ip} (${ip})\n`;
      output += `Host is up (0.00050s latency).\n\n`;
    });

    output += `\nNmap done: ${Math.pow(2, 32 - parseInt(network.split('/')[1]))} IP addresses (${activeHosts.length} hosts up) scanned in 2.45 seconds`;

    return output;
  }

  /**
   * Simulate SYN scan (-sS)
   */
  static synScan(target: string): string {
    const host = this.hosts[target];

    if (!host) {
      return `Failed to resolve "${target}".`;
    }

    let output = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;
    output += `Nmap scan report for ${host.hostname || target} (${target})\n`;
    output += `Host is up (0.00050s latency).\n`;
    output += `Not shown: ${1000 - host.ports.length} closed ports\n`;
    output += `PORT     STATE SERVICE\n`;

    host.ports.forEach(port => {
      output += `${port.port}/tcp  ${port.state.padEnd(8)} ${port.service}\n`;
    });

    output += `\nNmap done: 1 IP address (1 host up) scanned in 0.25 seconds`;

    return output;
  }

  /**
   * Simulate version detection (-sV)
   */
  static versionScan(target: string): string {
    const host = this.hosts[target];

    if (!host) {
      return `Failed to resolve "${target}".`;
    }

    let output = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;
    output += `Nmap scan report for ${host.hostname || target} (${target})\n`;
    output += `Host is up (0.00050s latency).\n`;
    output += `PORT     STATE SERVICE    VERSION\n`;

    host.ports.forEach(port => {
      const version = port.version || 'unknown';
      output += `${port.port}/tcp  ${port.state.padEnd(8)} ${port.service.padEnd(11)} ${version}\n`;
    });

    output += `\nService detection performed. Please report any incorrect results at https://nmap.org/submit/\n`;
    output += `Nmap done: 1 IP address (1 host up) scanned in 12.45 seconds`;

    return output;
  }

  /**
   * Simulate OS detection (-O)
   */
  static osDetection(target: string): string {
    const host = this.hosts[target];

    if (!host) {
      return `Failed to resolve "${target}".`;
    }

    let output = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;
    output += `Nmap scan report for ${host.hostname || target} (${target})\n`;
    output += `Host is up (0.00050s latency).\n`;
    output += `Not shown: ${1000 - host.ports.length} closed ports\n`;
    output += `PORT     STATE SERVICE\n`;

    host.ports.forEach(port => {
      output += `${port.port}/tcp  ${port.state.padEnd(8)} ${port.service}\n`;
    });

    output += `\nDevice type: general purpose\n`;
    output += `Running: ${host.os}\n`;
    output += `OS CPE: cpe:/o:linux:linux_kernel:3.10\n`;
    output += `OS details: ${host.os}\n`;
    output += `Network Distance: 2 hops\n`;

    output += `\nOS detection performed. Please report any incorrect results at https://nmap.org/submit/\n`;
    output += `Nmap done: 1 IP address (1 host up) scanned in 8.67 seconds`;

    return output;
  }

  /**
   * Simulate aggressive scan (-A)
   */
  static aggressiveScan(target: string): string {
    const host = this.hosts[target];

    if (!host) {
      return `Failed to resolve "${target}".`;
    }

    let output = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;
    output += `Nmap scan report for ${host.hostname || target} (${target})\n`;
    output += `Host is up (0.00050s latency).\n`;
    output += `Not shown: ${1000 - host.ports.length} closed ports\n`;
    output += `PORT     STATE SERVICE    VERSION\n`;

    host.ports.forEach(port => {
      const version = port.version || 'unknown';
      output += `${port.port}/tcp  ${port.state.padEnd(8)} ${port.service.padEnd(11)} ${version}\n`;
    });

    output += `\nDevice type: general purpose\n`;
    output += `Running: ${host.os}\n`;
    output += `OS details: ${host.os}\n`;
    output += `Network Distance: 2 hops\n`;

    output += `\nTRACEROUTE (using port 80/tcp)\n`;
    output += `HOP RTT     ADDRESS\n`;
    output += `1   0.50 ms 192.168.0.1\n`;
    output += `2   1.23 ms ${target}\n`;

    output += `\nNmap done: 1 IP address (1 host up) scanned in 18.92 seconds`;

    return output;
  }

  /**
   * Simulate UDP scan (-sU)
   */
  static udpScan(target: string): string {
    const udpPorts = [
      { port: 53, service: 'domain' },
      { port: 67, service: 'dhcps' },
      { port: 123, service: 'ntp' },
      { port: 161, service: 'snmp' },
    ];

    let output = `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toLocaleString()}\n`;
    output += `Nmap scan report for ${target}\n`;
    output += `Host is up (0.00050s latency).\n`;
    output += `Not shown: ${1000 - udpPorts.length} closed ports\n`;
    output += `PORT     STATE         SERVICE\n`;

    udpPorts.forEach(port => {
      output += `${port.port}/udp  open|filtered ${port.service}\n`;
    });

    output += `\nNmap done: 1 IP address (1 host up) scanned in 75.34 seconds`;

    return output;
  }
}
