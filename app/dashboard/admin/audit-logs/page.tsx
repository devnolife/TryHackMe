'use client';

import { useEffect, useState } from 'react';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  ipAddress: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    studentId: string | null;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [actionFilter, setActionFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, currentPage, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        action: actionFilter,
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to load audit logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('DELETE')) return 'bg-red-500/20 text-red-400 border border-red-500/30';
    if (action.includes('CREATE')) return 'bg-green-500/20 text-green-400 border border-green-500/30';
    if (action.includes('UPDATE')) return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
    if (action.includes('LOGIN')) return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    if (action.includes('RESET')) return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID');
  };

  const formatDetails = (details: any) => {
    if (!details) return 'Tidak ada detail';
    return JSON.stringify(details, null, 2);
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-300 text-lg">Memuat log audit...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Log Audit
          </h1>
          <p className="text-gray-400 mt-2">
            Lihat aktivitas sistem dan log keamanan
          </p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter Aksi
              </label>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="ALL">Semua Aksi</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE_USER">Buat Pengguna</option>
                <option value="UPDATE_USER">Update Pengguna</option>
                <option value="DELETE_USER">Hapus Pengguna</option>
                <option value="RESET_ALL_PROGRESS">Reset Semua Progres</option>
                <option value="RESET_SESSION_PROGRESS">Reset Progres Sesi</option>
                <option value="EXECUTE_COMMAND">Eksekusi Perintah</option>
                <option value="SUBMIT_LAB">Kirim Lab</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setActionFilter('ALL');
                  setStartDate('');
                  setEndDate('');
                  setCurrentPage(1);
                }}
                className="px-4 py-3 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-600/50 border border-white/10 transition-all"
              >
                Hapus Filter
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Audit Logs Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Alamat IP
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{log.user?.fullName || 'Unknown User'}</div>
                        <div className="text-xs text-gray-400">{log.user?.email || '-'}</div>
                        {log.user?.studentId && (
                          <div className="text-xs text-gray-500">{log.user.studentId}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <details className="cursor-pointer">
                        <summary className="text-cyan-400 hover:text-cyan-300 transition-colors">Lihat Detail</summary>
                        <pre className="mt-2 text-xs bg-slate-900/50 text-gray-300 p-3 rounded-lg overflow-x-auto max-w-md border border-white/5">
                          {formatDetails(log.details)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-slate-700/30 px-4 py-3 flex items-center justify-between border-t border-white/10">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-white/10 text-sm font-medium rounded-md text-gray-300 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-white/10 text-sm font-medium rounded-md text-gray-300 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50"
                >
                  Berikutnya
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Menampilkan <span className="font-medium text-white">{(currentPage - 1) * pagination.limit + 1}</span> sampai{' '}
                    <span className="font-medium text-white">{Math.min(currentPage * pagination.limit, pagination.total)}</span> dari{' '}
                    <span className="font-medium text-white">{pagination.total}</span> hasil
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                          ? 'z-10 bg-cyan-500/20 border-cyan-500 text-cyan-400'
                          : 'bg-slate-700/50 border-white/10 text-gray-400 hover:bg-slate-600/50'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {logs.length === 0 && !loading && (
          <div className="text-center py-12 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">Tidak ada log audit ditemukan</h3>
            <p className="text-gray-400">
              Coba sesuaikan filter atau periksa kembali nanti
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
