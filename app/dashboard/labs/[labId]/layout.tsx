'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-white font-medium">Memuat Lab</p>
            <p className="text-gray-500 text-sm">Mohon tunggu sebentar...</p>
          </div>
        </div>
      </div>
    );
  }

  // Lab page is fullscreen - no sidebar/header/footer
  return (
    <div className="fixed inset-0 z-50 bg-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
