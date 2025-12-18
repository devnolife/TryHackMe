'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Report {
  id: string;
  title: string;
  reportType: string;
  executiveSummary: string;
  findings: any[];
  vulnerabilities: any[];
  recommendations: any[];
  conclusion: string;
  generatedAt: string;
  student: {
    fullName: string;
    studentId: string;
  };
  session: {
    title: string;
    sessionNumber: number;
    topic: string;
  };
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/reports/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReport(data.report);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Report not found</p>
        <button
          onClick={() => router.push('/reports')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 print:mb-8">
        <button
          onClick={() => router.push('/reports')}
          className="text-blue-600 hover:text-blue-700 mb-4 print:hidden"
        >
          ← Back to Reports
        </button>

        <div className="bg-white rounded-lg shadow p-8 print:shadow-none">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {report.title}
            </h1>
            <p className="text-gray-600">{report.session.title}</p>
            <p className="text-sm text-gray-500 mt-2">
              Generated on {new Date(report.generatedAt).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-t border-b py-4">
            <div>
              <span className="font-semibold">Student:</span> {report.student.fullName}
            </div>
            <div>
              <span className="font-semibold">Student ID:</span> {report.student.studentId}
            </div>
            <div>
              <span className="font-semibold">Session:</span> #{report.session.sessionNumber}
            </div>
            <div>
              <span className="font-semibold">Topic:</span> {report.session.topic}
            </div>
          </div>

          <div className="mt-6 print:hidden flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-lg shadow p-8 mb-6 print:shadow-none print:break-inside-avoid">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
        <div className="text-gray-700 whitespace-pre-line">
          {report.executiveSummary}
        </div>
      </div>

      {/* Findings */}
      {report.findings && report.findings.length > 0 && (
        <div className="bg-white rounded-lg shadow p-8 mb-6 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Findings</h2>
          <div className="space-y-6">
            {report.findings.map((finding: any, index: number) => (
              <div key={finding.id} className="border rounded-lg p-6 print:break-inside-avoid">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    [{finding.id}] {finding.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(finding.severity)}`}>
                    {finding.severity}
                    {finding.cvss && ` (CVSS: ${finding.cvss})`}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Description:</span>
                    <p className="text-gray-600 mt-1">{finding.description}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Evidence:</span>
                    <p className="text-gray-600 mt-1 font-mono text-xs bg-gray-50 p-2 rounded">
                      {finding.evidence}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Impact:</span>
                    <p className="text-gray-600 mt-1">{finding.impact}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Remediation:</span>
                    <p className="text-gray-600 mt-1">{finding.remediation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vulnerabilities */}
      {report.vulnerabilities && report.vulnerabilities.length > 0 && (
        <div className="bg-white rounded-lg shadow p-8 mb-6 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Identified Vulnerabilities</h2>
          <div className="space-y-4">
            {report.vulnerabilities.map((vuln: any) => (
              <div key={vuln.id} className="border-l-4 border-orange-500 pl-4 py-2 print:break-inside-avoid">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{vuln.name}</h3>
                    {vuln.cve && (
                      <p className="text-sm text-gray-600 mt-1">CVE: {vuln.cve}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">{vuln.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Affected:</span> {vuln.affectedSystem}
                    </p>
                    <p className="text-sm text-blue-600 mt-2">
                      <span className="font-medium">Recommendation:</span> {vuln.recommendation}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-8 mb-6 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommendations</h2>
          <div className="space-y-4">
            {report.recommendations.map((rec: any) => (
              <div key={rec.id} className="border rounded-lg p-4 print:break-inside-avoid">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(rec.priority)}`}>
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><span className="font-medium">Implementation:</span> {rec.implementation}</p>
                  <p><span className="font-medium">Timeline:</span> {rec.timeline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conclusion */}
      <div className="bg-white rounded-lg shadow p-8 mb-6 print:shadow-none print:break-inside-avoid">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Conclusion</h2>
        <div className="text-gray-700 whitespace-pre-line">
          {report.conclusion}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-6 text-center text-sm text-gray-500 print:mt-8">
        <p>End of Report</p>
        <p className="mt-2">
          This report was generated by the Ethical Hacking Lab Platform
        </p>
      </div>
    </div>
  );
}
