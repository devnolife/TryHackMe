/**
 * Web Exploitation Simulator
 * Simulates web vulnerability testing tools like sqlmap, XSS testing, etc.
 */

export class WebSimulator {
  /**
   * Simulate SQLMap (SQL Injection testing)
   */
  static sqlmap(args: string): string {
    const urlMatch = args.match(/--url[=\s]+(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[1] : 'http://target.com';

    let output = `
        ___
       __H__
 ___ ___[']_____ ___ ___  {1.6.11#stable}
|_ -| . ["]     | .'| . |
|___|_  [']_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[*] starting @ ${new Date().toLocaleTimeString()}

[12:00:01] [INFO] testing connection to the target URL
[12:00:02] [INFO] checking if the target is protected by some kind of WAF/IPS
[12:00:03] [INFO] testing if the target URL content is stable
[12:00:03] [INFO] target URL content is stable
[12:00:04] [INFO] testing if GET parameter 'id' is dynamic
[12:00:04] [INFO] GET parameter 'id' appears to be dynamic
[12:00:05] [INFO] heuristic (basic) test shows that GET parameter 'id' might be injectable
[12:00:05] [INFO] testing for SQL injection on GET parameter 'id'
[12:00:06] [INFO] testing 'AND boolean-based blind - WHERE or HAVING clause'
[12:00:07] [INFO] GET parameter 'id' appears to be 'AND boolean-based blind - WHERE or HAVING clause' injectable
[12:00:08] [INFO] testing 'MySQL >= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)'
[12:00:09] [INFO] GET parameter 'id' is 'MySQL >= 5.0 AND error-based' injectable
[12:00:10] [INFO] testing 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)'
[12:00:20] [INFO] GET parameter 'id' appears to be 'MySQL >= 5.0.12 AND time-based blind (query SLEEP)' injectable
[12:00:21] [INFO] testing 'Generic UNION query (NULL) - 1 to 20 columns'
[12:00:22] [INFO] automatically extending ranges for UNION query injection technique tests
[12:00:23] [INFO] ORDER BY technique appears to be usable
[12:00:24] [INFO] target URL appears to have 4 columns in query
[12:00:25] [INFO] GET parameter 'id' is 'Generic UNION query (NULL) - 1 to 20 columns' injectable

GET parameter 'id' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N

sqlmap identified the following injection point(s) with a total of 50 HTTP(s) requests:
---
Parameter: id (GET)
    Type: boolean-based blind
    Title: AND boolean-based blind - WHERE or HAVING clause
    Payload: id=1 AND 5678=5678

    Type: error-based
    Title: MySQL >= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)
    Payload: id=1 AND (SELECT 1234 FROM(SELECT COUNT(*),CONCAT(0x7171,(SELECT database()),0x7171,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)

    Type: time-based blind
    Title: MySQL >= 5.0.12 AND time-based blind (query SLEEP)
    Payload: id=1 AND (SELECT 1234 FROM (SELECT(SLEEP(5)))a)

    Type: UNION query
    Title: Generic UNION query (NULL) - 4 columns
    Payload: id=-1 UNION ALL SELECT NULL,CONCAT(0x7171,database(),0x7171),NULL,NULL-- -
---

[12:00:26] [INFO] the back-end DBMS is MySQL
web application technology: PHP 7.4.3, Apache 2.4.6
back-end DBMS: MySQL >= 5.0
[12:00:27] [INFO] fetched data logged to textfiles

[*] ending @ ${new Date().toLocaleTimeString()}
    `.trim();

    return output;
  }

  /**
   * Simulate XSS testing
   */
  static testXss(payload: string, target: string): string {
    const xssPayloads = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '"><script>alert(String.fromCharCode(88,83,83))</script>',
    ];

    const isXssPayload = xssPayloads.some(p => payload.includes(p.substring(0, 10)));

    if (isXssPayload) {
      return `
[+] Testing for XSS vulnerability at: ${target}
[+] Payload: ${payload}

[!] XSS VULNERABILITY DETECTED!

Details:
--------
Vulnerability Type: Cross-Site Scripting (XSS)
Severity: High
Location: ${target}
Parameter: search
Payload: ${payload}

The application reflects user input without proper sanitization.
This could allow an attacker to execute arbitrary JavaScript code
in the context of other users' browsers.

Proof of Concept:
${target}?search=${encodeURIComponent(payload)}

Recommendation:
- Implement proper input validation
- Use output encoding/escaping
- Implement Content Security Policy (CSP)
- Use HTTPOnly and Secure flags on cookies
      `.trim();
    }

    return `
[+] Testing for XSS vulnerability at: ${target}
[+] Payload: ${payload}

[-] No XSS vulnerability detected with this payload.
    `.trim();
  }

  /**
   * Simulate CSRF testing
   */
  static testCsrf(url: string): string {
    return `
[+] Testing for CSRF vulnerability at: ${url}

[!] CSRF VULNERABILITY DETECTED!

Details:
--------
Vulnerability Type: Cross-Site Request Forgery (CSRF)
Severity: Medium
Location: ${url}
Missing Protection: No CSRF token found

The application does not implement CSRF protection.
This allows an attacker to perform unauthorized actions
on behalf of authenticated users.

Proof of Concept HTML:
<form action="${url}" method="POST">
  <input type="hidden" name="action" value="delete_account">
  <input type="hidden" name="confirm" value="yes">
</form>
<script>document.forms[0].submit();</script>

Recommendation:
- Implement CSRF tokens for all state-changing operations
- Use SameSite cookie attribute
- Verify Referer/Origin headers
- Re-authenticate for sensitive actions
    `.trim();
  }

  /**
   * Simulate directory bruteforce (dirb/dirbuster)
   */
  static dirb(target: string): string {
    const directories = [
      { path: '/admin', status: 200, size: 4567 },
      { path: '/backup', status: 200, size: 0 },
      { path: '/config', status: 403, size: 278 },
      { path: '/login', status: 200, size: 3245 },
      { path: '/uploads', status: 301, size: 185 },
      { path: '/api', status: 200, size: 892 },
      { path: '/.git', status: 200, size: 156 },
      { path: '/phpmyadmin', status: 302, size: 0 },
    ];

    let output = `
-----------------
DIRB v2.22
By The Dark Raver
-----------------

START_TIME: ${new Date().toLocaleString()}
URL_BASE: ${target}
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt

-----------------

GENERATED WORDS: 4612

---- Scanning URL: ${target} ----
`;

    directories.forEach(dir => {
      output += `+ ${target}${dir.path} (CODE:${dir.status}|SIZE:${dir.size})\n`;
    });

    output += `
-----------------
END_TIME: ${new Date().toLocaleString()}
DOWNLOADED: 4612 - FOUND: ${directories.length}
    `;

    return output.trim();
  }

  /**
   * Simulate wfuzz (web fuzzer)
   */
  static wfuzz(target: string, wordlist: string): string {
    return `
********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: ${target}
Total requests: 220

=====================================================================
ID           Response   Lines    Word     Chars       Payload
=====================================================================

000000001:   200        20 L     45 W     356 Ch      "admin"
000000023:   200        15 L     32 W     289 Ch      "login"
000000045:   200        18 L     38 W     412 Ch      "dashboard"
000000067:   403        10 L     15 W     198 Ch      "config"
000000089:   301        0 L      0 W      185 Ch      "uploads"
000000102:   200        25 L     56 W     478 Ch      "api"
000000156:   200        5 L      10 W     89 Ch       ".git"
000000198:   302        0 L      0 W      0 Ch        "logout"

Total time: 2.345678
Processed Requests: 220
Filtered Requests: 212
Requests/sec.: 93.82541
    `.trim();
  }

  /**
   * Simulate LFI (Local File Inclusion) testing
   */
  static testLfi(url: string, file: string): string {
    const sensitiveFiles: Record<string, string> = {
      '/etc/passwd': `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:107:111:MySQL Server,,,:/nonexistent:/bin/false`,
      '/etc/shadow': `root:$6$xyz...:18000:0:99999:7:::
www-data:*:18000:0:99999:7:::`,
      'C:\\Windows\\System32\\drivers\\etc\\hosts': `127.0.0.1  localhost
::1        localhost`,
    };

    const content = sensitiveFiles[file];

    if (content) {
      return `
[+] Testing Local File Inclusion (LFI) at: ${url}
[+] Attempting to read: ${file}

[!] LFI VULNERABILITY DETECTED!

File Contents:
--------------
${content}

The application is vulnerable to Local File Inclusion.
Attacker can read sensitive files from the server filesystem.

Vulnerable URL:
${url}?page=${encodeURIComponent(file)}

Recommendation:
- Implement strict input validation
- Use whitelist of allowed files
- Disable PHP allow_url_include
- Use realpath() to resolve file paths
      `.trim();
    }

    return `
[+] Testing Local File Inclusion (LFI) at: ${url}
[+] Attempting to read: ${file}

[-] File not accessible or LFI protection in place.
    `.trim();
  }
}
