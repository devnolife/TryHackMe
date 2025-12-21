'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SessionReview {
  id: string;
  reflectionText: string;
  totalPoints: number;
  submittedAt: string;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedAt: string | null;
  reviewerFeedback: string | null;
  student: {
    id: string;
    fullName: string;
    email: string;
    studentId: string;
  };
  session: {
    id: string;
    sessionNumber: number;
    title: string;
    topic: string;
  };
  reviewer: {
    id: string;
    fullName: string;
  } | null;
}

export default function SessionReviewsPage() {
  const [reviews, setReviews] = useState<SessionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [selectedReview, setSelectedReview] = useState<SessionReview | null>(null);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/session-reviews?status=${activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setReviews(data.completions);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reviewId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && feedback.trim().length < 10) {
      alert('Feedback minimal 10 karakter untuk penolakan');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/session-reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action, feedback }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedReview(null);
        setFeedback('');
        fetchReviews();
      } else {
        alert(data.error || 'Gagal memproses review');
      }
    } catch (error) {
      console.error('Error processing review:', error);
      alert('Gagal memproses review');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4 text-sm"
        >
          <span>←</span> Kembali ke Admin
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <span>📝</span> Review Refleksi Pembelajaran
        </h1>
        <p className="text-gray-400">
          Review dan setujui refleksi pembelajaran mahasiswa sebelum mereka dapat melanjutkan ke sesi berikutnya
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'PENDING'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
        >
          <span>⏳</span> Menunggu
          {counts.pending > 0 && (
            <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
              {counts.pending}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'APPROVED'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
        >
          <span>✅</span> Disetujui
          <span className="text-xs text-gray-500">({counts.approved})</span>
        </button>
        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'REJECTED'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-slate-800 text-gray-400 hover:text-white'
            }`}
        >
          <span>❌</span> Ditolak
          <span className="text-xs text-gray-500">({counts.rejected})</span>
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-white/10">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">
              {activeTab === 'PENDING' ? '📭' : activeTab === 'APPROVED' ? '✅' : '❌'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {activeTab === 'PENDING' ? 'Tidak Ada Review Menunggu' : `Tidak Ada Review ${activeTab === 'APPROVED' ? 'Disetujui' : 'Ditolak'}`}
          </h3>
          <p className="text-gray-400">
            {activeTab === 'PENDING' ? 'Semua refleksi mahasiswa sudah direview' : 'Belum ada review dengan status ini'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-800/50 rounded-xl border border-white/10 p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Student & Session Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {review.student.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{review.student.fullName}</h3>
                      <p className="text-sm text-gray-400">{review.student.studentId} • {review.student.email}</p>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-cyan-400">
                        Sesi {review.session.sessionNumber}: {review.session.title}
                      </span>
                      <span className="text-xs text-gray-500">• {review.session.topic}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">⭐ {review.totalPoints} poin</span>
                      <span className="text-gray-400">📅 {formatDate(review.submittedAt)}</span>
                    </div>
                  </div>

                  {/* Reflection Text */}
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-white/5">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Refleksi Pembelajaran:</h4>
                    <p className="text-white whitespace-pre-wrap">{review.reflectionText}</p>
                  </div>

                  {/* Reviewer Feedback (for approved/rejected) */}
                  {review.reviewerFeedback && (
                    <div className={`mt-3 p-3 rounded-lg ${review.reviewStatus === 'APPROVED' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
                      }`}>
                      <p className="text-sm">
                        <span className={review.reviewStatus === 'APPROVED' ? 'text-green-400' : 'text-red-400'}>
                          Feedback:
                        </span>
                        <span className="text-gray-300 ml-1">{review.reviewerFeedback}</span>
                      </p>
                      {review.reviewer && (
                        <p className="text-xs text-gray-500 mt-1">
                          Oleh: {review.reviewer.fullName} • {review.reviewedAt && formatDate(review.reviewedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {activeTab === 'PENDING' && (
                  <div className="lg:w-48 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setFeedback('');
                        handleAction(review.id, 'approve');
                      }}
                      disabled={processing}
                      className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                      ✅ Setujui
                    </button>
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition border border-red-500/30"
                    >
                      ❌ Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {selectedReview && activeTab === 'PENDING' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-white/10 p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>❌</span> Tolak Refleksi
            </h3>
            <p className="text-gray-400 mb-4">
              Berikan feedback untuk mahasiswa <span className="text-cyan-400">{selectedReview.student.fullName}</span> agar mereka dapat memperbaiki refleksinya.
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tuliskan feedback untuk mahasiswa... (minimal 10 karakter)"
              className="w-full h-32 bg-slate-700/50 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setFeedback('');
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleAction(selectedReview.id, 'reject')}
                disabled={processing || feedback.trim().length < 10}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {processing ? 'Memproses...' : 'Tolak Refleksi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
