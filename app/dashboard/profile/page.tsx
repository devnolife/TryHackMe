'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  fullName: string;
  studentId: string | null;
  department: string | null;
  role: string;
  enrollmentDate: string;
  createdAt: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    studentId: '',
    department: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'activity'>('profile');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setProfileForm({
          fullName: data.user.fullName || '',
          studentId: data.user.studentId || '',
          department: data.user.department || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal memperbarui profil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Kata sandi baru tidak cocok!' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Kata sandi minimal 6 karakter!' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Kata sandi berhasil diubah!' });
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal mengubah kata sandi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrator', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
      case 'ADMIN':
        return { label: 'Instruktur', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
      case 'STUDENT':
        return { label: 'Mahasiswa', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      default:
        return { label: role, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Gagal memuat data profil</p>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl p-8 border border-white/10">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <span className="text-4xl text-white font-bold">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{user.fullName}</h1>
            <p className="text-gray-400 mb-2">{user.email}</p>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
              {user.studentId && (
                <span className="text-sm text-gray-400">
                  NIM: {user.studentId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => { setActiveTab('profile'); setMessage(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'profile'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-800/50 text-gray-400 hover:text-white border border-white/10'
            }`}
        >
          <span>👤</span> Profil
        </button>
        <button
          onClick={() => { setActiveTab('password'); setMessage(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'password'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-800/50 text-gray-400 hover:text-white border border-white/10'
            }`}
        >
          <span>🔐</span> Kata Sandi
        </button>
        <button
          onClick={() => { setActiveTab('activity'); setMessage(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'activity'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-800/50 text-gray-400 hover:text-white border border-white/10'
            }`}
        >
          <span>📊</span> Aktivitas
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl ${message.type === 'success'
            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
          {message.type === 'success' ? '✓' : '⚠️'} {message.text}
        </div>
      )}

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6">Informasi Profil</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-900/30 border border-white/5 rounded-xl text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  NIM (Nomor Induk Mahasiswa)
                </label>
                <input
                  type="text"
                  value={profileForm.studentId}
                  onChange={(e) => setProfileForm({ ...profileForm, studentId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Contoh: 2024001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Jurusan/Departemen
                </label>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Contoh: Teknik Informatika"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-purple-600 transition disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6">Ubah Kata Sandi</h2>
          <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kata Sandi Saat Ini
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kata Sandi Baru
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-purple-600 transition disabled:opacity-50"
            >
              {saving ? 'Mengubah...' : 'Ubah Kata Sandi'}
            </button>
          </form>
        </div>
      )}

      {/* Activity */}
      {activeTab === 'activity' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6">Informasi Akun</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Tanggal Daftar</div>
              <div className="text-white font-medium">
                {new Date(user.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Tanggal Enrollment</div>
              <div className="text-white font-medium">
                {new Date(user.enrollmentDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Role</div>
              <div className="text-white font-medium">{user.role}</div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">User ID</div>
              <div className="text-white font-mono text-sm">{user.id}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
