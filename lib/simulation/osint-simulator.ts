/**
 * OSINT Simulator
 * Simulates OSINT tools like whois, nslookup, dig, geoip, etc.
 */

interface OsintResult {
  success: boolean;
  output: string;
  keywords: string[];
}

export class OsintSimulator {
  /**
   * Simulate WHOIS lookup
   */
  static whois(domain: string): OsintResult {
    const domains: Record<string, any> = {
      'example-company.com': {
        domain: 'EXAMPLE-COMPANY.COM',
        registrant: 'ABC Corporation',
        registrantEmail: 'admin@example-company.com',
        nameServers: ['ns1.example-company.com', 'ns2.example-company.com'],
        creationDate: '2020-01-15',
        expirationDate: '2025-01-15',
        registrar: 'Example Registrar Inc.',
      },
      'demo-company.com': {
        domain: 'DEMO-COMPANY.COM',
        registrant: 'Demo Company Inc.',
        registrantEmail: 'contact@demo-company.com',
        nameServers: ['ns1.demo-company.com', 'ns2.demo-company.com'],
        creationDate: '2019-06-20',
        expirationDate: '2024-06-20',
        registrar: 'Domain Registrar LLC',
      },
    };

    const info = domains[domain.toLowerCase()];

    if (!info) {
      return {
        success: false,
        output: `Error: Domain "${domain}" not found in WHOIS database`,
        keywords: [],
      };
    }

    const output = `
Domain Name: ${info.domain}
Registrant Organization: ${info.registrant}
Registrant Email: ${info.registrantEmail}
Registrar: ${info.registrar}
Name Server: ${info.nameServers[0]}
Name Server: ${info.nameServers[1]}
Creation Date: ${info.creationDate}
Expiration Date: ${info.expirationDate}
DNSSEC: unsigned

>>> Last update of WHOIS database: ${new Date().toISOString()}
    `.trim();

    return {
      success: true,
      output,
      keywords: ['Registrant', info.registrant, 'Name Server'],
    };
  }

  /**
   * Simulate nslookup DNS query
   */
  static nslookup(domain: string): OsintResult {
    const dnsRecords: Record<string, any> = {
      'example-company.com': {
        ip: '192.168.1.100',
        server: '8.8.8.8',
      },
      'demo-company.com': {
        ip: '10.0.0.50',
        server: '8.8.8.8',
      },
    };

    const record = dnsRecords[domain.toLowerCase()];

    if (!record) {
      return {
        success: false,
        output: `** server can't find ${domain}: NXDOMAIN`,
        keywords: [],
      };
    }

    const output = `
Server:         ${record.server}
Address:        ${record.server}#53

Non-authoritative answer:
Name:   ${domain}
Address: ${record.ip}
    `.trim();

    return {
      success: true,
      output,
      keywords: ['Address', record.ip],
    };
  }

  /**
   * Simulate IP geolocation lookup
   */
  static geoip(ip: string): OsintResult {
    const geoData: Record<string, any> = {
      '192.168.1.100': {
        location: 'Jakarta, Indonesia',
        isp: 'Indonesia Telecommunication',
        asn: 'AS12345',
        latitude: -6.2088,
        longitude: 106.8456,
      },
      '10.0.0.50': {
        location: 'Surabaya, Indonesia',
        isp: 'PT. Telekomunikasi Indonesia',
        asn: 'AS23456',
        latitude: -7.2575,
        longitude: 112.7521,
      },
    };

    const geo = geoData[ip];

    if (!geo) {
      return {
        success: false,
        output: `Error: Unable to locate IP address "${ip}"`,
        keywords: [],
      };
    }

    const output = `
IP Address: ${ip}
Location: ${geo.location}
ISP: ${geo.isp}
ASN: ${geo.asn}
Coordinates: ${geo.latitude}, ${geo.longitude}
Latitude: ${geo.latitude}
Longitude: ${geo.longitude}
    `.trim();

    return {
      success: true,
      output,
      keywords: ['Location', geo.location.split(',')[0], 'Indonesia'],
    };
  }

  /**
   * Simulate dig DNS query
   */
  static dig(domain: string, type: string = 'A'): OsintResult {
    const records: Record<string, any> = {
      'example-company.com': {
        A: ['192.168.1.100'],
        MX: ['10 mail.example-company.com'],
        NS: ['ns1.example-company.com', 'ns2.example-company.com'],
        TXT: ['"v=spf1 include:_spf.google.com ~all"'],
      },
    };

    const record = records[domain.toLowerCase()];

    if (!record) {
      return {
        success: false,
        output: `; <<>> DiG 9.16.1 <<>> ${domain}\n;; Got answer: NXDOMAIN`,
        keywords: [],
      };
    }

    const queryResults = record[type.toUpperCase()] || [];
    const results = queryResults.map((r: string) => `${domain}.\t\t300\tIN\t${type}\t${r}`).join('\n');

    const output = `
; <<>> DiG 9.16.1 <<>> ${domain} ${type}
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345

;; QUESTION SECTION:
;${domain}.\t\tIN\t${type}

;; ANSWER SECTION:
${results}

;; Query time: 25 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: ${new Date().toString()}
;; MSG SIZE rcvd: 128
    `.trim();

    return {
      success: true,
      output,
      keywords: [type, ...queryResults],
    };
  }

  /**
   * Simulate traceroute command
   */
  static traceroute(target: string): OsintResult {
    const output = `
traceroute to ${target} (192.168.1.100), 30 hops max, 60 byte packets
 1  gateway (192.168.0.1)  1.234 ms  1.123 ms  1.456 ms
 2  10.0.0.1 (10.0.0.1)  5.678 ms  5.432 ms  5.890 ms
 3  172.16.0.1 (172.16.0.1)  12.345 ms  12.123 ms  12.567 ms
 4  ${target} (192.168.1.100)  18.901 ms  18.789 ms  18.654 ms
    `.trim();

    return {
      success: true,
      output,
      keywords: ['gateway', '192.168.1.100'],
    };
  }

  /**
   * Simulate host command
   */
  static host(domain: string): OsintResult {
    const hosts: Record<string, string> = {
      'example-company.com': '192.168.1.100',
      'demo-company.com': '10.0.0.50',
    };

    const ip = hosts[domain.toLowerCase()];

    if (!ip) {
      return {
        success: false,
        output: `Host ${domain} not found: 3(NXDOMAIN)`,
        keywords: [],
      };
    }

    const output = `${domain} has address ${ip}`;

    return {
      success: true,
      output,
      keywords: ['address', ip],
    };
  }
}
