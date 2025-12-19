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
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'Kritis';
      case 'high': return 'Tinggi';
      case 'medium': return 'Sedang';
      case 'low': return 'Rendah';
      default: return severity;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-300 text-lg">Memuat laporan...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center">
        <p className="text-gray-400 mb-4">Laporan tidak ditemukan</p>
        <button
          onClick={() => router.push('/dashboard/reports')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all"
        >
          Kembali ke Laporan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 print:mb-8">
          <button
            onClick={() => router.push('/dashboard/reports')}
            className="text-cyan-400 hover:text-cyan-300 mb-4 print:hidden flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Laporan
          </button>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 print:shadow-none">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {report.title}
              </h1>
              <p className="text-gray-400">{report.session.title}</p>
              <p className="text-sm text-gray-500 mt-2">
                Dibuat pada {new Date(report.generatedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-t border-b border-white/10 py-4">
              <div className="text-gray-300">
                <span className="font-semibold text-gray-400">Mahasiswa:</span> {report.student.fullName}
              </div>
              <div className="text-gray-300">
                <span className="font-semibold text-gray-400">NIM:</span> {report.student.studentId}
              </div>
              <div className="text-gray-300">
                <span className="font-semibold text-gray-400">Sesi:</span> #{report.session.sessionNumber}
              </div>
              <div className="text-gray-300">
                <span className="font-semibold text-gray-400">Topik:</span> {report.session.topic}
              </div>
            </div>

            <div className="mt-6 print:hidden flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all font-medium"
              >
                Cetak Laporan
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-6 print:shadow-none print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ringkasan Eksekutif
          </h2>
          <div className="text-gray-300 whitespace-pre-line leading-relaxed">
            {report.executiveSummary}
          </div>
        </div>

        {/* Findings */}
        {report.findings && report.findings.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-6 print:shadow-none">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Temuan
            </h2>
            <div className="space-y-6">
              {report.findings.map((finding: any, index: number) => (
                <div key={finding.id} className="bg-slate-700/30 border border-white/5 rounded-lg p-6 print:break-inside-avoid">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      [{finding.id}] {finding.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(finding.severity)}`}>
                      {getSeverityLabel(finding.severity)}
                      {finding.cvss && ` (CVSS: ${finding.cvss})`}
                    </span>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-semibold text-cyan-400">Deskripsi:</span>
                      <p className="text-gray-300 mt-1">{finding.description}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-cyan-400">Bukti:</span>
                      <p className="text-gray-300 mt-1 font-mono text-xs bg-slate-900/50 p-3 rounded-lg border border-white/5">
                        {finding.evidence}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-cyan-400">Dampak:</span>
                      <p className="text-gray-300 mt-1">{finding.impact}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-cyan-400">Remediasi:</span>
                      <p className="text-gray-300 mt-1">{finding.remediation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vulnerabilities */}
        {report.vulnerabilities && report.vulnerabilities.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-6 print:shadow-none">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Kerentanan yang Teridentifikasi
            </h2>
            <div className="space-y-4">
              {report.vulnerabilities.map((vuln: any) => (
                <div key={vuln.id} className="border-l-4 border-orange-500 pl-4 py-3 bg-slate-700/30 rounded-r-lg print:break-inside-avoid">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{vuln.name}</h3>
                      {vuln.cve && (
                        <p className="text-sm text-gray-400 mt-1">CVE: {vuln.cve}</p>
                      )}
                      <p className="text-sm text-gray-300 mt-1">{vuln.description}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        <span className="font-medium">Sistem Terdampak:</span> {vuln.affectedSystem}
                      </p>
                      <p className="text-sm text-cyan-400 mt-2">
                        <span className="font-medium">Rekomendasi:</span> {vuln.recommendation}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(vuln.severity)}`}>
                      {getSeverityLabel(vuln.severity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-6 print:shadow-none">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Rekomendasi
            </h2>
            <div className="space-y-4">
              {report.recommendations.map((rec: any) => (
                <div key={rec.id} className="bg-slate-700/30 border border-white/5 rounded-lg p-4 print:break-inside-avoid">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{rec.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(rec.priority)}`}>
                      Prioritas {getSeverityLabel(rec.priority)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{rec.description}</p>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p><span className="font-medium text-cyan-400">Implementasi:</span> {rec.implementation}</p>
                    <p><span className="font-medium text-cyan-400">Timeline:</span> {rec.timeline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conclusion */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-6 print:shadow-none print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Kesimpulan
          </h2>
          <div className="text-gray-300 whitespace-pre-line leading-relaxed">
            {report.conclusion}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/30 border border-white/5 rounded-xl p-6 text-center text-sm text-gray-500 print:mt-8">
          <p className="text-gray-400">Akhir Laporan</p>
          <p className="mt-2 text-gray-500">
            Laporan ini dihasilkan oleh Platform Laboratorium Ethical Hacking
          </p>
        </div>
      </div>
    </div>
  );
}
