# 🏫 Portal Akademik & PPDB Online KB & TK Istiqamah

Aplikasi portal akademik sekolah, manajemen pendaftaran siswa baru (PPDB), dan Content Management System (CMS) untuk **KB & TK Istiqamah**. Dibangun menggunakan **Next.js 15 (App Router)**, **TypeScript**, **TailwindCSS**, **PostgreSQL**, dan **Prisma ORM**.

---

## 🛠️ Stack Teknologi

- **Framework**: Next.js 15.5 (App Router)
- **Bahasa**: TypeScript
- **Styling**: TailwindCSS & PostCSS v4
- **Database**: PostgreSQL 16 melalui Prisma ORM 7
- **Auth**: Password bcrypt dan JWT bertanda tangan dalam cookie `httpOnly`
- **Penyimpanan Berkas (Storage)**: Direktori `STORAGE_PATH`, dilayani melalui `/api/uploads`
- **State Management & Form**: React Hook Form, Zod Validation, TanStack Query
- **Animasi & UI**: Framer Motion, Lucide React, Shadcn/UI (Button, Input, Select, Dialog, Table, Tabs, Badge, sonner)
- **Email Service**: Nodemailer (SMTP/Gmail)

---

## 📋 Status Implementasi Fitur

Berikut adalah tabel audit lengkap seluruh fitur yang diminta di dalam requirement dan status implementasinya di codebase saat ini.

### Legend
- `✅ Done`: Fitur telah diimplementasikan sepenuhnya dan terhubung dengan database / backend.
- `⚠️ Partial`: Fitur diimplementasikan sebagian atau menggunakan data mock/statik.
- `❌ Not Done`: Fitur belum diimplementasikan di codebase.

---

### 1. Landing Page & Publikasi
| Fitur | Status | Deskripsi |
| :--- | :---: | :--- |
| **Navbar Sticky & Responsive** | `✅ Done` | Navbar lengket dengan efek *blur backdrop*, navigasi scroll mulus, *hamburger menu* laci untuk mobile, dan tombol aksi cepat login/PPDB. |
| **Hero Section (Banner Slider)** | `✅ Done` | Slider hero banner otomatis (*autoplay*) dengan animasi Framer Motion. Data banner beserta teks dan tautan tombol diunggah dinamis dari database. |
| **Mengapa Memilih Kami** | `✅ Done` | Tampilan kartu kelebihan sekolah (*Guru Profesional*, *Kurikulum Islami*, *Fasilitas Lengkap*) dengan ikon premium dan warna HSL khusus. |
| **Program Sekolah** | `✅ Done` | Kartu informasi program akademik: Calistung Dasar, Akhlak Islami, Metode Tilawati, Seni & Kreativitas, Eksplorasi Dunia. |
| **Galeri Foto/Video** | `✅ Done` | Slider foto galeri kegiatan, sarana prasarana, dan prestasi sekolah yang diambil dinamis dari database. |
| **Testimoni Orang Tua** | `✅ Done` | Komponen ulasan wali murid dalam slider interaktif yang bersumber dari tabel database. |
| **Kontak & Google Maps** | `✅ Done` | Kontak WhatsApp, Email, Alamat, Jam Operasional, serta embed peta Google Maps interaktif. |
| **Footer** | `✅ Done` | Tautan menu, media sosial resmi, hak cipta, dan logo sekolah. |

---

### 2. Autentikasi & Keamanan (Auth)
| Fitur | Status | Deskripsi |
| :--- | :---: | :--- |
| **Autentikasi Lokal** | `✅ Done` | Menggunakan data `users_tk`, bcrypt, JWT HS256, cookie `httpOnly`, dan pemeriksaan role di server. |
| **Role-Based Access Control** | `✅ Done` | Pembagian akses menu untuk **Super Admin**, **Admin**, **Guru**, dan **Orang Tua** yang diamankan melalui Next.js `middleware.ts`. |
| **Login dengan Username** | `✅ Done` | Login menggunakan *Username* dan *Password* (bukan email). Query pencarian username dipetakan ke email terdaftar di auth. |
| **Password Hashing** | `✅ Done` | Menggunakan `bcryptjs` untuk enkripsi hash kata sandi pengguna sebelum disimpan ke database publik. |
| **Otorisasi Server** | `✅ Done` | Akses baca/tulis dilindungi pada API dan server action berdasarkan sesi serta role pengguna. |

---

### 3. Dashboard Super Admin
| Fitur | Status | Deskripsi |
| :--- | :---: | :--- |
| **Ringkasan Statistik** | `✅ Done` | Metrik jumlah total guru, murid aktif, kelas aktif, dan tahun ajaran berjalan. |
| **Master Data Guru (CRUD)** | `✅ Done` | Kelola data guru (`teachers_tk`) lengkap dengan NIP, kontak, alamat, serta penautan akun portal guru. |
| **Master Data Murid (CRUD)** | `✅ Done` | Kelola data siswa (`students_tk`) lengkap dengan filter pencarian nama/NISN/NIK, jenis kelamin, kelas, dan status keaktifan. |
| **Master Data Kelas (CRUD)** | `✅ Done` | Kelola rombongan belajar (`classes_tk`) beserta penentuan wali kelas (guru) dan tahun ajaran aktif. |
| **Master Tahun Ajaran** | `✅ Done` | Pengaturan tahun ajaran baru terintegrasi langsung di menu master kelas dan form pengaturan umum. |
| **Audit Log & Log Aktivitas** | `✅ Done` | Pencatatan riwayat aksi penting di sistem secara *real-time* yang disimpan di tabel `activity_logs_tk`. |
| **Laporan & Analytics** | `✅ Done` | Laporan visual pendaftar PPDB, statistik tingkat penerimaan, keuangan biaya masuk, dan riwayat log transaksi terintegrasi di `/super-admin/reports`. |
| **Pengaturan Website** | `✅ Done` | Form modifikasi profil sekolah: nama sekolah, slogan, kontak, alamat, tautan sosial media, dan tarif biaya registrasi PPDB. |
| **Master Orang Tua (CRUD)** | `❌ Not Done` | Manajemen database profil orang tua secara independen belum tersedia (data saat ini ditambahkan otomatis melalui alur verifikasi PPDB). |
| **Role & Permission Custom** | `❌ Not Done` | Hak akses diatur statis melalui middleware Next.js, belum ada GUI untuk kustomisasi izin role dinamis. |

---

### 4. Dashboard Admin
| Fitur | Status | Deskripsi |
| :--- | :---: | :--- |
| **Manajemen PPDB** | `✅ Done` | Tinjau aplikasi pendaftar baru, verifikasi berkas/pembayaran, terima pendaftaran, tolak pendaftaran, atau hapus data secara permanen. |
| **Verifikasi Pembayaran** | `✅ Done` | Verifikasi berkas bukti transfer biaya pendaftaran Rp 250.000, menyinkronkan status tagihan pendaftar menjadi Verified. |
| **Pembuatan Akun Otomatis** | `✅ Done` | Menekan tombol "Terima PPDB" membuat akun Orang Tua di `users_tk`, mengaktifkan profil murid, dan mengaitkan ID orang tua. |
| **Format Kredensial Otomatis** | `✅ Done` | *Username*: nama anak huruf kecil tanpa spasi (ditambah angka jika duplikat). *Password*: tanggal lahir anak format `DDMMYYYY`. |
| **Notifikasi Email Otomatis** | `✅ Done` | Mengirim email HTML berisi kredensial akun portal orang tua setelah admin menyetujui pendaftaran. Berfungsi secara dinamis menggunakan SMTP Gmail atau mode simulasi log jika belum dikonfigurasi. |
| **Hero Banner CMS** | `✅ Done` | Dashboard khusus untuk mengunggah gambar banner baru, kustomisasi teks tombol aksi, kustomisasi tautan redirect tombol, dan hapus banner. |
| **Galeri CMS** | `✅ Done` | Panel unggah foto galeri, kategori (Kegiatan, Sarana, Prestasi), judul foto, preview sebelum unggah, dan aksi hapus foto dari penyimpanan cloud. |
| **Pengumuman CMS (CRUD)** | `✅ Done` | Kelola pengumuman sekolah dengan target penerima spesifik (Semua/Guru/Orang Tua), opsi draf, dan publikasi langsung. |
| **Testimoni CMS (CRUD)** | `✅ Done` | Kelola testimoni publik lengkap dengan unggah foto pemberi testimoni, keterangan pekerjaan, dan saklar publikasi halaman utama. |

---

### 5. Dashboard Guru
| Fitur | Status | Deskripsi |
| :--- | :---: | :--- |
| **Presensi Kelas Harian** | `✅ Done` | Input kehadiran seluruh murid pada tanggal berjalan dengan opsi: *Hadir*, *Sakit*, *Izin*, *Alfa*. Data disimpan/diperbarui di tabel `attendance_tk`. |
| **Input Nilai Harian** | `✅ Done` | Form pemberian nilai angka (1-100) dan deskripsi kualitatif per kategori bidang (Calistung, Hafalan & Doa, Seni, Karakter) ke tabel `grades_tk`. |
| **Jadwal Mengajar** | `✅ Done` | Tampilan jadwal mengajar guru mingguan dan fallback KBM. |
| **Upload Materi & Silabus** | `✅ Done` | Mengunggah bahan ajar, tugas, dan RPP ke storage aplikasi. |
| **Komunikasi Orang Tua / Chat** | `✅ Done` | Chat dua arah dengan Orang Tua murid menggunakan PostgreSQL melalui Prisma. |

---

### 6. Dashboard Orang Tua
| Fitur | Status | Deskripsi |
| :--- | :---: | :--- |
| **Status PPDB** | `✅ Done` | Lacak status pendaftaran anak, status verifikasi berkas, program studi, dan detail verifikasi pembayaran registrasi. |
| **Absensi Kehadiran Anak** | `✅ Done` | Grafik rasio persentase kehadiran harian ananda beserta tabel histori absen lengkap (*Hadir/Izin/Sakit/Alfa*). |
| **Nilai & Catatan Belajar** | `✅ Done` | Melihat daftar nilai kompetensi harian beserta catatan deskriptif/kualitatif yang diberikan oleh guru pengajar. |
| **Tagihan & Pembayaran SPP** | `✅ Done` | Pantau status tagihan SPP bulanan sekolah dan formulir unggah bukti transfer SPP ke bucket penyimpanan cloud. |
| **Pengumuman Sekolah** | `✅ Done` | Membaca pengumuman terbaru yang diterbitkan oleh admin dengan filter target untuk Orang Tua / Semua. |
| **Download Rapor / Dokumen** | `✅ Done` | Tampilan cetak rapor resmi A4 khusus print preview browser untuk disimpan/diunduh. |
| **Chat dengan Wali Kelas** | `✅ Done` | Komunikasi chat langsung dengan Wali Kelas anak dari portal orang tua. |

---

### 7. Sistem PPDB (Pendaftaran Online)
| Fitur | Status | Deskripsi |
| :--- | :---: | :--- |
| **Form Pendaftaran Lengkap** | `✅ Done` | Formulir interaktif 3 tahap pendaftaran calon murid baru: `Data Anak` -> `Data Orang Tua` -> `Berkas & Pembayaran`. |
| **Upload Dokumen Pendukung** | `✅ Done` | Pengunggahan file KK, Akta Kelahiran, Foto Anak, KTP Ayah, dan KTP Ibu ke storage aplikasi. |
| **Informasi Pembayaran Awal** | `✅ Done` | Informasi petunjuk transfer biaya administrasi PPDB dan formulir unggah gambar bukti transfer bank / QRIS. |

---

## 📂 Struktur Database PostgreSQL + Prisma

Seluruh tabel database di skema `public` menggunakan akhiran `_tk`. Model berada di `prisma/schema.prisma` dan migrasi SQL berada di `prisma/migrations`.

1. **`users_tk`**: Menyimpan akun lokal (id, username, email, password_hash, role, status).
2. **`teachers_tk`**: Database profil guru pengajar (id, nama, nip, hp, alamat, user_id).
3. **`classes_tk`**: Database rombongan belajar (id, nama, guru_id, tahun_ajaran).
4. **`students_tk`**: Database siswa (id, nama, nik, nisn, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, alamat, kelas_id, status).
5. **`parents_tk`**: Database orang tua/wali siswa (id, user_id, student_id, nama_ayah, nama_ibu, hp, email, alamat, pekerjaan).
6. **`ppdb_tk`**: Data registrasi PPDB (id, student_name, birth_date, status, payment_status, created_at).
7. **`ppdb_documents_tk`**: Penyimpanan referensi file dokumen PPDB (id, ppdb_id, type, file_url).
8. **`payments_tk`**: Riwayat transaksi biaya registrasi PPDB atau SPP (id, ppdb_id, method, amount, proof, status).
9. **`attendance_tk`**: Log presensi harian siswa (id, student_id, date, status).
10. **`grades_tk`**: Evaluasi nilai mata pelajaran dan catatan perkembangan anak (id, student_id, teacher_id, subject, score, description).
11. **`activity_logs_tk`**: Log audit aktivitas sistem (id, user_id, activity, created_at).
12. **`announcements_tk`**: Penyimpanan siaran pengumuman sekolah (id, title, content, target, published).
13. **`testimonials_tk`**: Ulasan orang tua murid di landing page (id, name, photo, job, content, published).
14. **`galleries_tk`**: Galeri foto dan slider hero banner (id, title, image, category, created_at).

---

## 🚀 Petunjuk Menjalankan Aplikasi

### 1. Prasyarat Lingkungan (.env)
Salin `.env.example` menjadi `.env`, lalu isi PostgreSQL target, secret JWT, storage, dan SMTP bila digunakan:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="secret-acak-minimal-32-karakter"
STORAGE_PATH="./storage"
NEXT_PUBLIC_STORAGE_URL="/api/uploads"

# SMTP Configuration (Contoh: Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=<email-anda>@gmail.com
SMTP_PASS=<sandi-aplikasi-16-karakter>
SMTP_FROM="KB & TK Istiqamah Bandung" <tkistiqomahbandung@gmail.com>

NEXT_PUBLIC_APP_URL=http://localhost:3200
```

### 2. Instalasi dan Migrasi Prisma

```bash
# 1. Pasang dependensi
npm install

npm run db:generate
npm run db:migrate
npm run db:verify
```

### 3. Impor Data Supabase Lama

Isi `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` sumber, jalankan dry-run, kemudian impor tabel dan objek Storage:

```bash
npm run migrate:supabase:dry
npm run migrate:supabase
```

Importer melakukan upsert menurut primary key dan memeriksa jumlah baris sumber/target. Bila sumber tidak tersedia, dry-run berhenti sebelum target diubah.

### 4. Seed Super Admin Opsional

Isi `SEED_ADMIN_USERNAME`, `SEED_ADMIN_EMAIL`, dan `SEED_ADMIN_PASSWORD` di environment, kemudian jalankan `npm run db:seed`. Tidak ada password default yang ditanam di source code.

### 5. Jalankan Server Pengembangan
Jalankan server Next.js lokal pada port 3200 (sesuai target redirect):

```bash
npm run dev:3200
```
Buka peramban Anda di alamat [http://localhost:3200](http://localhost:3200).
