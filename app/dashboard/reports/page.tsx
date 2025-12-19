'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Report {
  id: string;
  title: string;
  reportType: string;
  generatedAt: string;
  session: {
    title: string;
    sessionNumber: number;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Laporan Saya
            </h1>
            <p className="text-gray-400 mt-2">
              Lihat dan kelola laporan penetration testing Anda
            </p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Belum ada laporan</h3>
            <p className="text-gray-400 mb-6">
              Selesaikan lab dan buat laporan untuk melihatnya di sini
            </p>
            <Link
              href="/dashboard/labs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Mulai Laboratorium
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-cyan-500/50 transition-all group">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-cyan-400">
                          Sesi #{report.session.sessionNumber}
                        </span>
                        <h2 className="text-lg font-bold text-white">
                          {report.title}
                        </h2>
                      </div>

                      <p className="text-gray-400 mb-4">{report.session.title}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-2 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(report.generatedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.reportType === 'FINAL_REPORT'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                          {report.reportType === 'FINAL_REPORT' ? 'Laporan Akhir' : 'Laporan Sesi'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all text-sm font-medium"
                      >
                        Lihat Laporan
                      </Link>
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-600/50 transition-all text-sm border border-white/10"
                      >
                        Cetak
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tentang Laporan
          </h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start">
              <span className="mr-3 text-cyan-500">•</span>
              <span>Laporan dihasilkan secara otomatis setelah menyelesaikan sesi lab</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-cyan-500">•</span>
              <span>Setiap laporan berisi temuan, langkah-langkah yang diambil, dan rekomendasi</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-cyan-500">•</span>
              <span>Anda dapat mencetak atau mengunduh laporan untuk dokumentasi</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
