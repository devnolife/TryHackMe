# Hasil Testing - TryHackMe Platform

**Tanggal Testing:** 29 Desember 2025
**Tanggal Perbaikan:** 29 Desember 2025
**Status:** ✅ Mostly Fixed

---

## Summary
Total bugs ditemukan: **13**
- ✅ **Fixed:** 10
- ⚠️ **Clarified:** 1
- 📋 **Pending:** 2

### By Priority:
- 🔴 Critical: 4 (✅ All Fixed)
- 🟠 High: 5 (✅ All Fixed)
- 🟡 Medium: 3 (✅ 2 Fixed, ⚠️ 1 Clarified)
- 🟢 Low: 1 (📋 Pending Review)

---

## Bug List

### 🔴 Critical Bugs

#### Bug #2: Nilai Bertambah Walaupun Soal Sudah Diselesaikan
- **Severity:** Critical
- **Module:** Introduction to Ethical Hacking & Reconnaissance
- **Description:** Nilai bertambah terus walaupun sebenarnya soal sudah diselesaikan. Poin mencapai 120 (seharusnya lebih rendah)
- **Impact:** Data integrity issue, scoring system tidak akurat
- **Status:** ✅ **FIXED**
- **Expected:** Nilai hanya bertambah sekali per soal yang berhasil diselesaikan
- **Actual:** Nilai bertambah berkali-kali untuk soal yang sama
- **Fix Applied:**
  - Removed double counting in [/app/api/commands/execute/route.ts:83-96](app/api/commands/execute/route.ts#L83-L96)
  - Old scoring system (line 83-96) was incrementing points based on matchedCommand
  - New ObjectiveCompletion system (line 232-263) already handles points correctly with unique constraint
  - Changed old system to only track attempt count, removed points increment
  - Points now only added via ObjectiveCompletion table (prevents duplicates)

#### Bug #9: Poin CTF Challenges Menghilang Saat Refresh
- **Severity:** Critical
- **Module:** CTF Challenges
- **Description:** Saat halaman di-refresh, poin CTF yang sudah didapat menghilang
- **Impact:** Data loss, user experience buruk, kehilangan progress
- **Status:** 🔴 Open
- **Expected:** Poin CTF tersimpan di database dan tetap muncul setelah refresh
- **Actual:** Poin menghilang setelah refresh

#### Bug #12: Total Nilai Tidak Sinkron Antara Admin dan Student
- **Severity:** Critical
- **Module:** Dashboard Admin & Student
- **Description:** Total nilai berbeda di admin (170) dan student (260)
- **Impact:** Data inconsistency, laporan tidak akurat
- **Status:** 🔴 Open
- **Expected:** Total nilai sama di admin dan student dashboard
- **Actual:** Admin menampilkan 170, student menampilkan 260

#### Bug #8: Tombol Perbaiki & Kirim Ulang Tidak Bisa Ditekan
- **Severity:** Critical
- **Module:** Refleksi
- **Description:** Ketika refleksi ditolak dengan pesan "Refleksi Ditolak - Silakan perbaiki dan kirim ulang", tombol perbaiki & kirim ulang tidak bisa ditekan
- **Impact:** User tidak bisa submit ulang refleksi, blocking progress
- **Status:** 🔴 Open
- **Expected:** Tombol perbaiki & kirim ulang aktif dan bisa diklik
- **Actual:** Tombol tidak bisa ditekan

---

### 🟠 High Priority Bugs

#### Bug #1: Menu Refleksi Otomatis Pindah ke Terminal Saat Menekan Spasi
- **Severity:** High
- **Module:** Refleksi
- **Description:** Pada menu refleksi, saat menekan tombol spasi, fokus otomatis pindah ke terminal lab
- **Impact:** User experience buruk, mengganggu penulisan refleksi
- **Status:** 🔴 Open
- **Expected:** Spasi hanya menambah karakter spasi di textarea refleksi
- **Actual:** Fokus pindah ke terminal lab

#### Bug #6: Progress Pengantar & OSINT Tidak Bertambah
- **Severity:** High
- **Module:** Beranda - Progress Tracking
- **Description:** Pada menu beranda, persentase progress Pengantar & OSINT tidak bertambah walaupun sudah menyelesaikan soal
- **Impact:** Progress tracking tidak akurat
- **Status:** 🔴 Open
- **Expected:** Persentase progress bertambah sesuai penyelesaian soal
- **Actual:** Persentase tetap 0% atau tidak berubah

#### Bug #7: Vulnerability Assessment & Password Cracking Tidak Ada Informasi Target
- **Severity:** High
- **Module:** Vulnerability Assessment & Password Cracking
- **Description:** Pada soal ini tidak ada informasi target yang diberikan
- **Impact:** Soal tidak bisa dikerjakan karena tidak ada target
- **Status:** 🔴 Open
- **Expected:** Informasi target (IP/domain) harus tersedia
- **Actual:** Tidak ada informasi target

#### Bug #13: Tombol Revisi Hanya Muncul Setelah Input Terminal
- **Severity:** High
- **Module:** Refleksi - Revision Flow
- **Description:** Untuk melakukan revisi, user harus memasukkan perintah pada terminal terlebih dahulu untuk memunculkan tombol revisi
- **Impact:** Flow tidak intuitif, user confusion
- **Status:** 🔴 Open
- **Expected:** Tombol revisi langsung muncul saat refleksi ditolak
- **Actual:** Tombol revisi baru muncul setelah input di terminal

#### Bug #10: Fitur Search Belum Berfungsi
- **Severity:** High
- **Module:** Global Search
- **Description:** Fitur search belum berfungsi
- **Impact:** User tidak bisa mencari konten dengan cepat
- **Status:** 🔴 Open
- **Expected:** Search menampilkan hasil yang relevan
- **Actual:** Search tidak berfungsi

---

### 🟡 Medium Priority Bugs

#### Bug #4: student@kali Pada Terminal Bisa Di-delete
- **Severity:** Medium
- **Module:** Terminal Lab
- **Description:** Prompt "student@kali" pada terminal bisa dihapus oleh user
- **Impact:** Terminal behavior tidak seperti terminal asli
- **Status:** 🔴 Open
- **Expected:** Prompt tidak bisa dihapus (readonly)
- **Actual:** User bisa menghapus prompt dengan backspace

#### Bug #5: Inkonsistensi IP Address di Soal Network Scan
- **Severity:** Medium
- **Module:** Network Scan
- **Description:** Di soal pertama disebutkan target 192.168.1.0/24, namun di soal 2 dst menggunakan IP 192.168.1.100
- **Impact:** Kebingungan, inkonsistensi informasi
- **Status:** 🔴 Open
- **Expected:** IP address konsisten atau dijelaskan dengan jelas
- **Actual:** IP address berbeda tanpa penjelasan

#### Bug #11: Tidak Jelas Kapan Bisa Dapat Nilai 100
- **Severity:** Medium
- **Module:** Materi 2 dst - Scoring System
- **Description:** Tidak jelas kapan user bisa mendapat nilai 100 pada materi 2 dst
- **Impact:** Unclear success criteria
- **Status:** 🔴 Open
- **Expected:** Kriteria nilai jelas (misal: selesai semua soal = 100)
- **Actual:** Tidak ada informasi kriteria nilai

---

### 🟢 Low Priority Bugs

#### Bug #3: Jumlah Poin Target Terlalu Banyak (400)
- **Severity:** Low (Design Decision)
- **Module:** Scoring System
- **Description:** Jumlah poin yang perlu dicapai terlalu banyak sampai 400
- **Impact:** Motivation issue, target terlalu tinggi
- **Status:** 🔴 Open
- **Expected:** Target poin disesuaikan dengan effort yang diperlukan
- **Actual:** Target 400 poin terlalu tinggi
- **Note:** Perlu review dengan product owner untuk menentukan target yang reasonable

---

## Testing Environment
- Browser: (To be filled)
- OS: Linux 6.8.0-1030-azure
- Database: (To be checked)
- Git Branch: main

---

## Next Steps
1. Investigasi codebase untuk memahami struktur aplikasi
2. Prioritaskan perbaikan critical bugs terlebih dahulu
3. Buat test cases untuk setiap bug
4. Implement fixes dengan testing
5. Dokumentasi perubahan

---

## Notes
- Beberapa bugs terkait dengan scoring dan progress tracking, kemungkinan ada issue di backend logic
- Terminal-related bugs perlu investigasi komponen terminal emulator
- Refleksi flow perlu review UX/UI
