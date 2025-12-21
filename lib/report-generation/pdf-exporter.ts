/**
 * PDF Report Exporter
 * Generates PDF documents from penetration testing reports
 * Uses HTML template approach for PDF generation
 */

import { ReportData, Finding, Vulnerability, Recommendation } from './report-generator';

export interface PDFExportOptions {
  includeAppendices: boolean;
  includeCharts: boolean;
  watermark?: string;
  confidentialityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
}

export class PDFExporter {
  private static readonly SEVERITY_COLORS: Record<string, string> = {
    Critical: '#dc2626',
    High: '#ea580c',
    Medium: '#ca8a04',
    Low: '#16a34a',
    Info: '#2563eb',
  };

  /**
   * Generate HTML content for the report
   */
  static generateHTML(report: ReportData, options: PDFExportOptions): string {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  ${this.generateCoverPage(report, options)}
  ${this.generateTableOfContents(report)}
  ${this.generateExecutiveSummary(report)}
  ${this.generateMethodology(report)}
  ${this.generateScope(report)}
  ${this.generateFindings(report)}
  ${this.generateVulnerabilities(report)}
  ${this.generateRecommendations(report)}
  ${this.generateConclusion(report)}
  ${options.includeAppendices ? this.generateAppendices(report) : ''}
</body>
</html>
    `.trim();

    return html;
  }

  /**
   * Get CSS styles for the PDF
   */
  private static getStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #333;
        background: #fff;
      }
      
      .cover-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        page-break-after: always;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: white;
        padding: 2rem;
      }
      
      .cover-page h1 {
        font-size: 32pt;
        margin-bottom: 1rem;
        color: #00ff88;
      }
      
      .cover-page .subtitle {
        font-size: 18pt;
        margin-bottom: 2rem;
        opacity: 0.9;
      }
      
      .cover-page .meta {
        font-size: 12pt;
        margin-top: 3rem;
      }
      
      .cover-page .confidential {
        margin-top: 2rem;
        padding: 0.5rem 2rem;
        border: 2px solid #ff4757;
        color: #ff4757;
        font-weight: bold;
      }
      
      .section {
        page-break-inside: avoid;
        margin: 2rem 3rem;
      }
      
      .section-title {
        font-size: 18pt;
        color: #1a1a2e;
        border-bottom: 3px solid #00ff88;
        padding-bottom: 0.5rem;
        margin-bottom: 1.5rem;
      }
      
      .subsection-title {
        font-size: 14pt;
        color: #16213e;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
      }
      
      .toc {
        page-break-after: always;
      }
      
      .toc-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px dotted #ccc;
      }
      
      .finding-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        page-break-inside: avoid;
      }
      
      .finding-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .finding-title {
        font-size: 14pt;
        font-weight: bold;
      }
      
      .severity-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        font-size: 10pt;
      }
      
      .severity-critical { background-color: #dc2626; }
      .severity-high { background-color: #ea580c; }
      .severity-medium { background-color: #ca8a04; }
      .severity-low { background-color: #16a34a; }
      .severity-info { background-color: #2563eb; }
      
      .finding-section {
        margin-bottom: 1rem;
      }
      
      .finding-section-title {
        font-weight: bold;
        color: #16213e;
        margin-bottom: 0.25rem;
      }
      
      .evidence-box {
        background: #f8f9fa;
        border-left: 4px solid #00ff88;
        padding: 1rem;
        font-family: 'Courier New', monospace;
        font-size: 10pt;
        overflow-x: auto;
        white-space: pre-wrap;
      }
      
      .vuln-table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
      }
      
      .vuln-table th,
      .vuln-table td {
        border: 1px solid #e5e7eb;
        padding: 0.75rem;
        text-align: left;
      }
      
      .vuln-table th {
        background: #1a1a2e;
        color: white;
      }
      
      .vuln-table tr:nth-child(even) {
        background: #f8f9fa;
      }
      
      .recommendation-card {
        border-left: 4px solid;
        padding: 1rem;
        margin-bottom: 1rem;
        background: #f8f9fa;
      }
      
      .priority-critical { border-color: #dc2626; }
      .priority-high { border-color: #ea580c; }
      .priority-medium { border-color: #ca8a04; }
      .priority-low { border-color: #16a34a; }
      
      .summary-stats {
        display: flex;
        gap: 1rem;
        margin: 1.5rem 0;
      }
      
      .stat-box {
        flex: 1;
        padding: 1rem;
        text-align: center;
        border-radius: 8px;
        color: white;
      }
      
      .stat-number {
        font-size: 24pt;
        font-weight: bold;
      }
      
      .stat-label {
        font-size: 10pt;
        opacity: 0.9;
      }
      
      .appendix {
        page-break-before: always;
      }
      
      .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 0.5rem 2rem;
        font-size: 9pt;
        color: #666;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
      }
      
      @media print {
        .section {
          page-break-inside: avoid;
        }
        .finding-card {
          page-break-inside: avoid;
        }
      }
    `;
  }

  /**
   * Generate cover page
   */
  private static generateCoverPage(report: ReportData, options: PDFExportOptions): string {
    return `
      <div class="cover-page">
        <h1>PENETRATION TEST REPORT</h1>
        <div class="subtitle">${report.title}</div>
        <div class="meta">
          <p><strong>Lab Session:</strong> Session ${report.sessionNumber} - ${report.labTitle}</p>
          <p><strong>Prepared By:</strong> ${report.studentName}</p>
          <p><strong>Student ID:</strong> ${report.studentId}</p>
          <p><strong>Date:</strong> ${report.generatedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
        </div>
        <div class="confidential">${options.confidentialityLevel}</div>
        ${options.watermark ? `<div class="watermark">${options.watermark}</div>` : ''}
      </div>
    `;
  }

  /**
   * Generate table of contents
   */
  private static generateTableOfContents(report: ReportData): string {
    const sections = [
      { title: 'Executive Summary', page: 3 },
      { title: 'Methodology', page: 4 },
      { title: 'Scope', page: 5 },
      { title: 'Findings', page: 6 },
      { title: 'Vulnerabilities', page: 7 + Math.ceil(report.findings.length / 2) },
      { title: 'Recommendations', page: 8 + Math.ceil(report.findings.length / 2) },
      { title: 'Conclusion', page: 9 + Math.ceil(report.findings.length / 2) },
    ];

    if (report.appendices.length > 0) {
      sections.push({ title: 'Appendices', page: 10 + Math.ceil(report.findings.length / 2) });
    }

    return `
      <div class="section toc">
        <h2 class="section-title">Table of Contents</h2>
        ${sections.map(s => `
          <div class="toc-item">
            <span>${s.title}</span>
            <span>${s.page}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Generate executive summary section
   */
  private static generateExecutiveSummary(report: ReportData): string {
    const criticalCount = report.findings.filter(f => f.severity === 'Critical').length;
    const highCount = report.findings.filter(f => f.severity === 'High').length;
    const mediumCount = report.findings.filter(f => f.severity === 'Medium').length;
    const lowCount = report.findings.filter(f => f.severity === 'Low').length;

    return `
      <div class="section">
        <h2 class="section-title">1. Executive Summary</h2>
        <p>${report.executiveSummary}</p>
        
        <h3 class="subsection-title">Findings Overview</h3>
        <div class="summary-stats">
          <div class="stat-box severity-critical">
            <div class="stat-number">${criticalCount}</div>
            <div class="stat-label">Critical</div>
          </div>
          <div class="stat-box severity-high">
            <div class="stat-number">${highCount}</div>
            <div class="stat-label">High</div>
          </div>
          <div class="stat-box severity-medium">
            <div class="stat-number">${mediumCount}</div>
            <div class="stat-label">Medium</div>
          </div>
          <div class="stat-box severity-low">
            <div class="stat-number">${lowCount}</div>
            <div class="stat-label">Low</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate methodology section
   */
  private static generateMethodology(report: ReportData): string {
    return `
      <div class="section">
        <h2 class="section-title">2. Methodology</h2>
        <p>${report.methodology}</p>
        
        <h3 class="subsection-title">Testing Approach</h3>
        <ul>
          <li><strong>Reconnaissance:</strong> Passive and active information gathering</li>
          <li><strong>Scanning:</strong> Network and vulnerability scanning</li>
          <li><strong>Enumeration:</strong> Service and user enumeration</li>
          <li><strong>Exploitation:</strong> Controlled vulnerability exploitation</li>
          <li><strong>Post-Exploitation:</strong> Privilege escalation and lateral movement</li>
          <li><strong>Reporting:</strong> Documentation and remediation guidance</li>
        </ul>
      </div>
    `;
  }

  /**
   * Generate scope section
   */
  private static generateScope(report: ReportData): string {
    return `
      <div class="section">
        <h2 class="section-title">3. Scope</h2>
        <p>${report.scope}</p>
        
        <h3 class="subsection-title">In Scope</h3>
        <ul>
          <li>Target systems and networks as defined in the lab scenario</li>
          <li>Web applications running on target servers</li>
          <li>Network services exposed on target hosts</li>
        </ul>
        
        <h3 class="subsection-title">Out of Scope</h3>
        <ul>
          <li>Denial of Service (DoS) attacks</li>
          <li>Physical security testing</li>
          <li>Social engineering of real individuals</li>
        </ul>
      </div>
    `;
  }

  /**
   * Generate findings section
   */
  private static generateFindings(report: ReportData): string {
    if (report.findings.length === 0) {
      return `
        <div class="section">
          <h2 class="section-title">4. Findings</h2>
          <p>No significant findings were identified during this assessment.</p>
        </div>
      `;
    }

    return `
      <div class="section">
        <h2 class="section-title">4. Findings</h2>
        <p>The following findings were identified during the penetration test:</p>
        
        ${report.findings.map((finding, index) => this.generateFindingCard(finding, index + 1)).join('')}
      </div>
    `;
  }

  /**
   * Generate individual finding card
   */
  private static generateFindingCard(finding: Finding, index: number): string {
    const severityClass = `severity-${finding.severity.toLowerCase()}`;

    return `
      <div class="finding-card">
        <div class="finding-header">
          <span class="finding-title">${index}. ${finding.title}</span>
          <span class="severity-badge ${severityClass}">${finding.severity}</span>
        </div>
        
        <div class="finding-section">
          <div class="finding-section-title">Description</div>
          <p>${finding.description}</p>
        </div>
        
        <div class="finding-section">
          <div class="finding-section-title">Evidence</div>
          <div class="evidence-box">${finding.evidence}</div>
        </div>
        
        <div class="finding-section">
          <div class="finding-section-title">Impact</div>
          <p>${finding.impact}</p>
        </div>
        
        <div class="finding-section">
          <div class="finding-section-title">Remediation</div>
          <p>${finding.remediation}</p>
        </div>
        
        ${finding.cvss ? `
          <div class="finding-section">
            <div class="finding-section-title">CVSS Score</div>
            <p>${finding.cvss}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate vulnerabilities table
   */
  private static generateVulnerabilities(report: ReportData): string {
    if (report.vulnerabilities.length === 0) {
      return `
        <div class="section">
          <h2 class="section-title">5. Vulnerabilities</h2>
          <p>No vulnerabilities were identified that require immediate attention.</p>
        </div>
      `;
    }

    return `
      <div class="section">
        <h2 class="section-title">5. Vulnerabilities</h2>
        <p>The following vulnerabilities were discovered:</p>
        
        <table class="vuln-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vulnerability</th>
              <th>CVE</th>
              <th>Severity</th>
              <th>Affected System</th>
            </tr>
          </thead>
          <tbody>
            ${report.vulnerabilities.map(v => `
              <tr>
                <td>${v.id}</td>
                <td>${v.name}</td>
                <td>${v.cve || 'N/A'}</td>
                <td><span class="severity-badge severity-${v.severity.toLowerCase()}">${v.severity}</span></td>
                <td>${v.affectedSystem}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${report.vulnerabilities.map(v => `
          <div class="finding-card">
            <h4>${v.name}</h4>
            <p><strong>Description:</strong> ${v.description}</p>
            <p><strong>Recommendation:</strong> ${v.recommendation}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Generate recommendations section
   */
  private static generateRecommendations(report: ReportData): string {
    if (report.recommendations.length === 0) {
      return `
        <div class="section">
          <h2 class="section-title">6. Recommendations</h2>
          <p>Continue to maintain current security practices and perform regular assessments.</p>
        </div>
      `;
    }

    // Sort by priority
    const sortedRecs = [...report.recommendations].sort((a, b) => {
      const priority = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return priority[a.priority] - priority[b.priority];
    });

    return `
      <div class="section">
        <h2 class="section-title">6. Recommendations</h2>
        <p>The following recommendations are prioritized based on risk and impact:</p>
        
        ${sortedRecs.map(rec => `
          <div class="recommendation-card priority-${rec.priority.toLowerCase()}">
            <h4>[${rec.priority}] ${rec.title}</h4>
            <p>${rec.description}</p>
            <p><strong>Implementation:</strong> ${rec.implementation}</p>
            <p><strong>Timeline:</strong> ${rec.timeline}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Generate conclusion section
   */
  private static generateConclusion(report: ReportData): string {
    return `
      <div class="section">
        <h2 class="section-title">7. Conclusion</h2>
        <p>${report.conclusion}</p>
        
        <h3 class="subsection-title">Next Steps</h3>
        <ol>
          <li>Review and prioritize remediation efforts based on severity ratings</li>
          <li>Address critical and high-severity findings immediately</li>
          <li>Implement recommended security controls</li>
          <li>Schedule follow-up assessment to verify remediation</li>
          <li>Continue security awareness training</li>
        </ol>
      </div>
    `;
  }

  /**
   * Generate appendices
   */
  private static generateAppendices(report: ReportData): string {
    if (report.appendices.length === 0) {
      return '';
    }

    return `
      <div class="appendix">
        <h2 class="section-title">Appendices</h2>
        ${report.appendices.map((appendix, index) => `
          <div class="section">
            <h3 class="subsection-title">Appendix ${String.fromCharCode(65 + index)}: ${appendix.title}</h3>
            <div class="evidence-box">${appendix.content}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Convert HTML to a downloadable format
   * Returns base64 encoded HTML that can be converted to PDF client-side
   */
  static async exportToDownloadable(report: ReportData, options: PDFExportOptions): Promise<{
    html: string;
    filename: string;
    mimeType: string;
  }> {
    const html = this.generateHTML(report, options);
    const filename = `PenTest_Report_${report.studentId}_Session${report.sessionNumber}_${new Date().toISOString().split('T')[0]
      }.html`;

    return {
      html,
      filename,
      mimeType: 'text/html',
    };
  }

  /**
   * Generate a print-ready HTML page that can be saved as PDF via browser print
   */
  static generatePrintableReport(report: ReportData, options: PDFExportOptions): string {
    const html = this.generateHTML(report, options);

    // Add print-specific styles and scripts
    return html.replace('</head>', `
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .cover-page { background: #1a1a2e !important; }
          .severity-badge { -webkit-print-color-adjust: exact !important; }
          .stat-box { -webkit-print-color-adjust: exact !important; }
        }
      </style>
      <script>
        window.onload = function() {
          // Auto-trigger print dialog if opened with ?print=true
          if (window.location.search.includes('print=true')) {
            setTimeout(() => window.print(), 500);
          }
        };
      </script>
    </head>`);
  }
}

export default PDFExporter;
