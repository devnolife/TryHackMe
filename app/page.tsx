import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b bg-slate-900/80 backdrop-blur-md border-white/10">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
                <span className="text-xl font-bold text-white">🛡️</span>
              </div>
              <span className="text-xl font-bold text-white">CyberLab</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-gray-300 transition hover:text-white"
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
      <section className="px-4 pt-32 pb-20">
        <div className="mx-auto text-center max-w-7xl">
          <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm">
            <span className="text-sm font-medium text-cyan-400">🚀 Platform Pembelajaran Cybersecurity #1 di Indonesia</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl">
            Kuasai{' '}
            <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
              Ethical Hacking
            </span>
            <br />
            dengan Praktik Langsung
          </h1>

          <p className="max-w-3xl mx-auto mb-10 text-xl leading-relaxed text-gray-400">
            Pelajari teknik penetration testing dari dasar hingga mahir melalui
            laboratorium virtual interaktif. Bangun karir di bidang keamanan siber
            dengan kurikulum berbasis industri.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="px-8 py-4 text-lg font-semibold text-white transition shadow-lg bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl hover:opacity-90 shadow-purple-500/25"
            >
              Mulai Belajar Sekarang →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 text-lg font-semibold text-white transition border bg-white/10 rounded-xl hover:bg-white/20 border-white/20"
            >
              Sudah Punya Akun
            </Link>
          </div>

          {/* Stats */}
          <div className="grid max-w-4xl grid-cols-2 gap-8 mx-auto mt-20 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-white">8+</div>
              <div className="text-gray-400">Modul Lab</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-white">50+</div>
              <div className="text-gray-400">Skenario Praktik</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-white">100%</div>
              <div className="text-gray-400">Hands-On</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-white">24/7</div>
              <div className="text-gray-400">Akses Lab</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-slate-900/50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Mengapa Memilih CyberLab?
            </h2>
            <p className="max-w-2xl mx-auto text-gray-400">
              Platform pembelajaran yang dirancang khusus untuk menghasilkan
              profesional keamanan siber berkualitas
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-8 transition border bg-white/5 rounded-2xl border-white/10 hover:border-cyan-500/50">
              <div className="flex items-center justify-center mb-6 w-14 h-14 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Terminal Interaktif</h3>
              <p className="text-gray-400">
                Praktik langsung dengan terminal berbasis web. Eksekusi perintah
                nyata seperti nmap, whois, dan sqlmap dalam lingkungan aman.
              </p>
            </div>

            <div className="p-8 transition border bg-white/5 rounded-2xl border-white/10 hover:border-purple-500/50">
              <div className="flex items-center justify-center mb-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Skenario Realistis</h3>
              <p className="text-gray-400">
                Simulasi serangan dan pertahanan berdasarkan kasus nyata.
                Dari reconnaissance hingga privilege escalation.
              </p>
            </div>

            <div className="p-8 transition border bg-white/5 rounded-2xl border-white/10 hover:border-pink-500/50">
              <div className="flex items-center justify-center mb-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">Tracking Progress</h3>
              <p className="text-gray-400">
                Pantau kemajuan belajar dengan sistem poin dan leaderboard.
                Dapatkan sertifikat setelah menyelesaikan modul.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Kurikulum Lengkap
            </h2>
            <p className="max-w-2xl mx-auto text-gray-400">
              8 modul pembelajaran dari dasar hingga mahir
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-5 transition border bg-white/5 rounded-xl border-white/10 hover:bg-white/10 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">1</div>
                <span className="px-2 py-1 text-xs text-white rounded-full bg-gradient-to-r from-green-500 to-emerald-500">Pemula</span>
              </div>
              <h4 className="font-semibold text-white transition group-hover:text-cyan-400">Pengantar & OSINT</h4>
            </div>
            <div className="p-5 transition border bg-white/5 rounded-xl border-white/10 hover:bg-white/10 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">2</div>
                <span className="px-2 py-1 text-xs text-white rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">Menengah</span>
              </div>
              <h4 className="font-semibold text-white transition group-hover:text-cyan-400">Network Scanning</h4>
            </div>
            <div className="p-5 transition border bg-white/5 rounded-xl border-white/10 hover:bg-white/10 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">3</div>
                <span className="px-2 py-1 text-xs text-white rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">Menengah</span>
              </div>
              <h4 className="font-semibold text-white transition group-hover:text-cyan-400">Vulnerability Assessment</h4>
            </div>
            <div className="p-5 transition border bg-white/5 rounded-xl border-white/10 hover:bg-white/10 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">4</div>
                <span className="px-2 py-1 text-xs text-white rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">Menengah</span>
              </div>
              <h4 className="font-semibold text-white transition group-hover:text-cyan-400">UTS - Proyek Recon</h4>
            </div>
            <div className="p-5 transition border bg-white/5 rounded-xl border-white/10 hover:bg-white/10 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-gradient-to-r from-red-500 to-rose-500">5</div>
                <span className="px-2 py-1 text-xs text-white rounded-full bg-gradient-to-r from-red-500 to-rose-500">Lanjutan</span>
              </div>
              <h4 className="font-semibold text-white transition group-hover:text-cyan-400">Web Security & SQLi</h4>
            </div>
            <div className="p-5 transition border bg-white/5 rounded-xl border-white/10 hover:bg-white/10 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-gradient-to-r from-red-500 to-rose-500">6</div>
                <span className="px-2 py-1 text-xs text-white rounded-full bg-gradient-to-r from-red-500 to-rose-500">Lanjutan</span>
              </div>
              <h4 className="font-semibold text-white transition group-hover:text-cyan-400">Metasploit & Privesc</h4>
            </div>
            <div className="p-5 transition border bg-white/5 rounded-xl border-white/10 hover:bg-white/10 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">7</div>
                <span className="px-2 py-1 text-xs text-white rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">Menengah</span>
              </div>
              <h4 className="font-semibold text-white transition group-hover:text-cyan-400">Report & CTF</h4>
            </div>
            <div className="p-5 transition border bg-white/5 rounded-xl border-white/10 hover:bg-white/10 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-gradient-to-r from-red-500 to-rose-500">8</div>
                <span className="px-2 py-1 text-xs text-white rounded-full bg-gradient-to-r from-red-500 to-rose-500">Lanjutan</span>
              </div>
              <h4 className="font-semibold text-white transition group-hover:text-cyan-400">UAS - Pentest Full</h4>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="p-12 text-center border bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl border-white/10">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Siap Menjadi Ethical Hacker?
            </h2>
            <p className="max-w-xl mx-auto mb-8 text-gray-300">
              Daftar sekarang dan mulai perjalanan Anda di dunia keamanan siber.
              Gratis untuk mahasiswa!
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 text-lg font-semibold text-white transition shadow-lg bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl hover:opacity-90 shadow-purple-500/25"
            >
              Daftar Gratis Sekarang →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t border-white/10">
        <div className="mx-auto text-center max-w-7xl">
          <div className="flex items-center justify-center mb-4 space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
              <span className="text-sm text-white">🛡️</span>
            </div>
            <span className="text-lg font-bold text-white">CyberLab</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 CyberLab - Platform Pembelajaran Ethical Hacking
          </p>
        </div>
      </footer>
    </div>
  );
}
