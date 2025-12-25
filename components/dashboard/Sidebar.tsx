'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function Sidebar({ user, isOpen, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';

  const isActive = (path: string) => {
    // Untuk admin, beranda adalah /dashboard/admin
    if (path === '/dashboard/admin' && isAdmin) {
      return pathname === '/dashboard/admin';
    }
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const studentNavItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Beranda',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/dashboard/labs',
      label: 'Laboratorium',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/ctf',
      label: 'CTF Challenges',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
    },
    {
      href: '/dashboard/progress',
      label: 'Progres Saya',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/reports',
      label: 'Laporan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/leaderboard',
      label: 'Papan Peringkat',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      href: '/dashboard/admin',
      label: 'Beranda',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/dashboard/admin/students',
      label: 'Daftar Mahasiswa',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/admin/session-reviews',
      label: 'Review Refleksi',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      href: '/dashboard/admin/users',
      label: 'Manajemen User',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/admin/audit-logs',
      label: 'Log Audit',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/admin/answers',
      label: 'Jawaban User',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  const commonNavItems: NavItem[] = [
    {
      href: '/dashboard/profile',
      label: 'Profil Saya',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const navItems = user?.role === 'STUDENT'
    ? [...studentNavItems, ...commonNavItems]
    : [...adminNavItems, ...commonNavItems];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'STUDENT': return 'Mahasiswa';
      case 'INSTRUCTOR': return 'Instruktur';
      case 'ADMIN': return 'Administrator';
      default: return role;
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border-r border-white/5 transform transition-all duration-300 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="relative px-6 py-6">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent" />
            <Link href="/dashboard" className="relative flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  CyberLab
                </h1>
                <p className="text-xs text-gray-500">Security Training Platform</p>
              </div>
            </Link>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="absolute top-6 right-4 p-2 text-gray-400 hover:text-white lg:hidden transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Menu Utama
            </p>
            {navItems.slice(0, -1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive(item.href)
                    ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {/* Active indicator */}
                {isActive(item.href) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r-full" />
                )}

                <span className={`transition-colors ${isActive(item.href) ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>

                {item.badge && item.badge > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Divider */}
            <div className="my-4 border-t border-white/5" />

            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Akun
            </p>
            {navItems.slice(-1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive(item.href)
                    ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {isActive(item.href) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r-full" />
                )}
                <span className={`transition-colors ${isActive(item.href) ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/5">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-white/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user?.fullName?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{getRoleLabel(user?.role)}</p>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium text-sm">Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
