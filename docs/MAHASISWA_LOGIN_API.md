# Mahasiswa Login API Documentation

## Endpoint

```
POST /api/auth/mahasiswa/login
```

## Deskripsi

Endpoint ini memungkinkan mahasiswa untuk login menggunakan NIM dan password mereka. Sistem akan:
1. Memvalidasi kredensial dengan GraphQL API eksternal (`https://sicekcok.if.unismuh.ac.id/graphql`)
2. Membandingkan password yang di-hash dengan MD5
3. Membuat atau memperbarui akun lokal jika validasi berhasil
4. Mengembalikan JWT token untuk autentikasi

## Request Body

```json
{
  "nim": "string",
  "password": "string"
}
```

### Parameters

| Field    | Type   | Required | Description                          |
|----------|--------|----------|--------------------------------------|
| nim      | string | Yes      | Nomor Induk Mahasiswa (NIM)          |
| password | string | Yes      | Password mahasiswa                   |

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "userId": "uuid",
    "email": "mahasiswa@student.unismuh.ac.id",
    "fullName": "Nama Lengkap Mahasiswa",
    "role": "STUDENT",
    "studentId": "NIM",
    "department": "Teknik Informatika",
    "nim": "NIM",
    "prodi": "Teknik Informatika",
    "hp": "08123456789",
    "foto": "url_foto"
  }
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": "NIM dan password wajib diisi"
}
```

#### 401 Unauthorized
```json
{
  "error": "Password salah"
}
```

#### 404 Not Found
```json
{
  "error": "NIM tidak ditemukan di sistem akademik"
}
```

#### 409 Conflict
```json
{
  "error": "Akun sudah terdaftar dengan email atau NIM tersebut"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Terjadi kesalahan pada sistem. Silakan coba lagi."
}
```

## Cara Kerja

### 1. Validasi Input
- Endpoint memeriksa bahwa NIM dan password tidak kosong

### 2. Hash Password dengan MD5
```typescript
const hashedPasswordMD5 = hashMD5(password);
```

### 3. Query GraphQL API Eksternal
```graphql
query GetMahasiswaByNim($nim: String!) {
  MahasiswaUser(nim: $nim) {
    nim
    nama
    hp
    email
    prodi
    foto
    passwd
  }
}
```

### 4. Validasi Password
- Membandingkan MD5 hash password input dengan `passwd` dari API eksternal
- Jika tidak cocok, return error 401

### 5. Buat/Update Akun Lokal
- Jika mahasiswa sudah punya akun (berdasarkan NIM atau email), data akan diperbarui
- Jika belum punya akun, akun baru akan dibuat
- Password disimpan dengan bcrypt hash (lebih aman dari MD5) untuk autentikasi lokal selanjutnya

### 6. Generate JWT Token
- Token valid selama 7 hari
- Token berisi: userId, email, dan role

### 7. Audit Log
- Setiap login dicatat di audit log untuk tracking

## Contoh Penggunaan

### cURL

```bash
curl -X POST http://localhost:3000/api/auth/mahasiswa/login \
  -H "Content-Type: application/json" \
  -d '{
    "nim": "202112345",
    "password": "password123"
  }'
```

### JavaScript (Fetch API)

```javascript
const response = await fetch('/api/auth/mahasiswa/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nim: '202112345',
    password: 'password123',
  }),
});

const data = await response.json();

if (data.success) {
  // Simpan token untuk request selanjutnya
  localStorage.setItem('token', data.token);
  console.log('Login berhasil:', data.user);
} else {
  console.error('Login gagal:', data.error);
}
```

### Axios

```javascript
import axios from 'axios';

try {
  const { data } = await axios.post('/api/auth/mahasiswa/login', {
    nim: '202112345',
    password: 'password123',
  });

  // Simpan token
  localStorage.setItem('token', data.token);
  console.log('Login berhasil:', data.user);
} catch (error) {
  console.error('Login gagal:', error.response?.data?.error);
}
```

## Keamanan

### Password Storage
- **Input**: Password di-hash dengan MD5 untuk validasi dengan API eksternal (sesuai sistem eksternal)
- **Local Storage**: Password disimpan dengan bcrypt (SALT_ROUNDS=10) untuk keamanan lebih baik
- Mahasiswa dapat login berikutnya menggunakan endpoint regular `/api/auth/login` dengan bcrypt verification

### Token Security
- JWT token menggunakan secret key dari environment variable
- Token expires dalam 7 hari
- Token harus disimpan dengan aman (httpOnly cookies recommended untuk production)

### Data Sync
- Field `isExternalSync = true` menandakan user tersinkronisasi dari sistem eksternal
- Data mahasiswa akan diperbarui setiap kali login untuk memastikan data selalu up-to-date

## Database Schema

Field baru yang ditambahkan ke model User:

```prisma
model User {
  // ... existing fields ...

  // Mahasiswa external sync fields
  nim              String?   @unique
  hp               String?   @map("phone_number")
  prodi            String?   @map("study_program")
  foto             String?   @map("photo_url")
  isExternalSync   Boolean   @default(false) @map("is_external_sync")
}
```

## Notes

- Endpoint ini khusus untuk mahasiswa yang datanya ada di sistem akademik eksternal
- Mahasiswa non-eksternal tetap menggunakan endpoint `/api/auth/login` biasa
- MD5 hanya digunakan untuk validasi dengan API eksternal, bukan untuk penyimpanan lokal
- Setiap login akan memperbarui data mahasiswa dari sistem eksternal
