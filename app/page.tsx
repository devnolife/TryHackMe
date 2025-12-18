import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🛡️</span>
              </div>
              <span className="text-xl font-bold text-white">CyberLab</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 text-sm bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition font-medium"
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <span className="text-cyan-400 text-sm font-medium">🚀 Platform Pembelajaran Cybersecurity #1 di Indonesia</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Kuasai{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Ethical Hacking
            </span>
            <br />
            dengan Praktik Langsung
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Pelajari teknik penetration testing dari dasar hingga mahir melalui
            laboratorium virtual interaktif. Bangun karir di bidang keamanan siber
            dengan kurikulum berbasis industri.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition font-semibold text-lg shadow-lg shadow-purple-500/25"
            >
              Mulai Belajar Sekarang →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition font-semibold text-lg border border-white/20"
            >
              Sudah Punya Akun
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">8+</div>
              <div className="text-gray-400">Modul Lab</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-400">Skenario Praktik</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-gray-400">Hands-On</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Akses Lab</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Mengapa Memilih CyberLab?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Platform pembelajaran yang dirancang khusus untuk menghasilkan
              profesional keamanan siber berkualitas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-cyan-500/50 transition">
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Terminal Interaktif</h3>
              <p className="text-gray-400">
                Praktik langsung dengan terminal berbasis web. Eksekusi perintah
                nyata seperti nmap, whois, dan sqlmap dalam lingkungan aman.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Skenario Realistis</h3>
              <p className="text-gray-400">
                Simulasi serangan dan pertahanan berdasarkan kasus nyata.
                Dari reconnaissance hingga privilege escalation.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-pink-500/50 transition">
              <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Tracking Progress</h3>
              <p className="text-gray-400">
                Pantau kemajuan belajar dengan sistem poin dan leaderboard.
                Dapatkan sertifikat setelah menyelesaikan modul.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Kurikulum Lengkap
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              8 modul pembelajaran dari dasar hingga mahir
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">1</div>
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white">Pemula</span>
              </div>
              <h4 className="text-white font-semibold group-hover:text-cyan-400 transition">Pengantar & OSINT</h4>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">2</div>
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Menengah</span>
              </div>
              <h4 className="text-white font-semibold group-hover:text-cyan-400 transition">Network Scanning</h4>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">3</div>
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Menengah</span>
              </div>
              <h4 className="text-white font-semibold group-hover:text-cyan-400 transition">Vulnerability Assessment</h4>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">4</div>
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Menengah</span>
              </div>
              <h4 className="text-white font-semibold group-hover:text-cyan-400 transition">UTS - Proyek Recon</h4>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-bold">5</div>
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white">Lanjutan</span>
              </div>
              <h4 className="text-white font-semibold group-hover:text-cyan-400 transition">Web Security & SQLi</h4>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-bold">6</div>
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white">Lanjutan</span>
              </div>
              <h4 className="text-white font-semibold group-hover:text-cyan-400 transition">Metasploit & Privesc</h4>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">7</div>
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Menengah</span>
              </div>
              <h4 className="text-white font-semibold group-hover:text-cyan-400 transition">Report & CTF</h4>
            </div>
            <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-bold">8</div>
                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white">Lanjutan</span>
              </div>
              <h4 className="text-white font-semibold group-hover:text-cyan-400 transition">UAS - Pentest Full</h4>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl p-12 text-center border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Siap Menjadi Ethical Hacker?
            </h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Daftar sekarang dan mulai perjalanan Anda di dunia keamanan siber.
              Gratis untuk mahasiswa!
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:opacity-90 transition font-semibold text-lg shadow-lg shadow-purple-500/25"
            >
              Daftar Gratis Sekarang →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🛡️</span>
            </div>
            <span className="text-lg font-bold text-white">CyberLab</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 CyberLab - Platform Pembelajaran Ethical Hacking
          </p>
        </div>
      </footer>
    </div>
  );
}
