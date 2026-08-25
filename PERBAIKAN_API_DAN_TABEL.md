# Laporan Perbaikan Data API (Error 500) & Daftar Tabel Sistem KB-TK

Dokumen ini memuat rangkuman analisis teknis perbaikan **Data API (/api/admin/data)** yang mengalami **Error 500 (Internal Server Error)**, daftar hal yang telah dan perlu diperbaiki/ditambahkan, serta struktur tabel database Supabase yang dibutuhkan oleh aplikasi **KB & TK Istiqamah**.

---

## 1. Analisis & Perbaikan API Error 500

### 🔴 **Penyebab Utama Error 500:**
1. **Pengurutan Default (`orderBy`) Tidak Sesuai Skema Tabel**:
   Pada API endpoint `/api/admin/data/route.ts`, pengurutan query dipaksa default ke kolom `'created_at'`. Namun, sebagian besar tabel utama (`teachers_tk`, `classes_tk`, `students_tk`, `parents_tk`, `testimonials_tk`, `schedules_tk`, dll) **tidak memiliki kolom `created_at`** di skema PostgreSQL. Hal ini membuat PostgreSQL melempar exception:
   `ERROR: column <table>.created_at does not exist` yang menghasilkan respon HTTP 500.

2. **Whitelist Tabel Tidak Lengkap**:
   Beberapa tabel sistem (seperti `schedules_tk`, `materials_tk`, `chats_tk`, `settings_tk`, `attendance_tk`, `grades_tk`) belum didaftarkan di dalam whitelist `validTables`, sehingga panggilan ke tabel tersebut mengembalikan `400 Invalid table`.

3. **Inkonsistensi Pembuatan User di Supabase Auth**:
   Pembuatan akun portal via `/api/admin/users/create` mencoba melakukan perbaikan langsung ke tabel `users_tk` tanpa membuat akun di `auth.users` terlebih dahulu, padahal `users_tk.id` memiliki *foreign key constraint* ke `auth.users(id)`.

---

### 🟢 **Perbaikan yang Telah Diterapkan:**
* **Smart Default Sort Column**:
  Mengubah logika pengurutan pada `app/api/admin/data/route.ts` agar memilih kolom pengurutan default secara dinamis sesuai ketersediaan kolom pada tabel tersebut:
  - Tabel berkategori **Nama**: `teachers_tk`, `classes_tk`, `students_tk` -> default sort by `nama`.
  - Tabel berkategori **Waktu**: `users_tk`, `ppdb_tk`, `galleries_tk`, `activity_logs_tk`, `chats_tk`, `materials_tk` -> default sort by `created_at`.
  - Tabel berkategori **Tanggal**: `attendance_tk` -> default sort by `date`.
  - Tabel berkategori **Pengaturan**: `settings_tk` -> default sort by `updated_at`.
  - Tabel Lainnya: `parents_tk`, `announcements_tk`, `payments_tk`, `grades_tk`, `schedules_tk`, `ppdb_documents_tk` -> default sort by `id`.

* **Dukungan Join Relation Query**:
  Mendukung alias query khusus dengan relasi Foreign Key:
  - `teachers_tk_with_users` (`teachers_tk` + `users_tk`)
  - `classes_tk_with_teachers` (`classes_tk` + `teachers_tk`)
  - `students_tk_with_classes` (`students_tk` + `classes_tk`)
  - `materials_tk_with_classes` (`materials_tk` + `classes_tk` + `teachers_tk`)
  - `schedules_tk_with_classes` (`schedules_tk` + `classes_tk`)
  - `payments_tk` (`payments_tk` + `ppdb_tk`)

* **Penanganan UI Error Handling**:
  Memperbarui halaman dashboard frontend (seperti Master Guru, Rapor, dll) untuk menampilkan komponen Alert Error & tombol **Coba Lagi (Retry)** apabila terjadi gangguan koneksi atau kegagalan API.

---

## 2. Checklist Perbaikan & Pengembangan Lanjutan

### 🛠️ **Perbaikan (Fixes):**
- [x] Perbaikan default sorting kolom pada generic Data API endpoint.
- [x] Penambahan seluruh 18 tabel sistem ke dalam whitelist Data API.
- [x] Sinkronisasi pembuatan & penghapusan user antara Supabase Auth & DB `users_tk`.
- [x] Tampilan error UI & tombol retry pada antarmuka dashboard admin.
- [ ] Penambahan RLS (Row Level Security) granular untuk akun peran Guru & Orang Tua.

### ✨ **Pengembangan Tambahan (Features to Add):**
- [ ] **Paginasi & Pencarian pada Data API**: Mendukung parameter `search`, `page`, dan `pageSize`.
- [ ] **Fitur Ekspor Laporan (Excel/CSV)**: Tombol unduh laporan pendaftaran PPDB dan rekap pembayaran.
- [ ] **Notifikasi WhatsApp**: Pengiriman pesan otomatis pengumuman dan akun login via WA Gateway.
- [ ] **Pengisian Rapor Bulanan & Presensi Harian**: Antarmuka bagi guru untuk input nilai dan absensi siswa.

---

## 3. Daftar & Struktur Tabel Database (Supabase PostgreSQL)

Berikut adalah daftar 18 tabel database yang digunakan di aplikasi **KB & TK Istiqamah**:

| No | Nama Tabel | Peruntukan / Fungsi | Kolom Utama & Constraint |
|---|---|---|---|
| 1 | `users_tk` | Akun login portal (Super Admin, Admin, Guru, Orang Tua) | `id` (FK `auth.users`), `username` (unique), `email`, `password_hash`, `role`, `status`, `created_at` |
| 2 | `teachers_tk` | Master data guru & staf pengajar | `id` (PK), `user_id` (FK `users_tk`), `nama`, `nip`, `hp`, `alamat` |
| 3 | `classes_tk` | Master rombongan belajar / kelas | `id` (PK), `nama`, `guru_id` (FK `teachers_tk`), `tahun_ajaran` |
| 4 | `students_tk` | Master data murid KB & TK | `id` (PK), `user_id` (FK `users_tk`), `nama`, `nik`, `nisn`, `tempat_lahir`, `tanggal_lahir`, `jenis_kelamin`, `agama`, `alamat`, `kelas_id` (FK `classes_tk`), `status` |
| 5 | `parents_tk` | Data wali / orang tua siswa | `id` (PK), `user_id` (FK `users_tk`), `student_id` (FK `students_tk`), `nama_ayah`, `nama_ibu`, `hp`, `email`, `alamat`, `pekerjaan` |
| 6 | `ppdb_tk` | Form pendaftaran calon siswa baru | `id` (PK), `student_name`, `birth_date`, `status`, `payment_status`, `created_at` |
| 7 | `ppdb_documents_tk` | Lampiran berkas pendaftaran PPDB | `id` (PK), `ppdb_id` (FK `ppdb_tk`), `type`, `file_url` |
| 8 | `payments_tk` | Transaksi pembayaran pendaftaran & SPP | `id` (PK), `ppdb_id` (FK `ppdb_tk`), `method`, `amount`, `proof`, `status` |
| 9 | `galleries_tk` | Galeri foto kegiatan & banner website | `id` (PK), `title`, `image`, `category`, `created_at` |
| 10 | `announcements_tk` | Pengumuman internal & publik | `id` (PK), `title`, `content`, `target`, `published` |
| 11 | `testimonials_tk` | Testimoni wali murid di landing page | `id` (PK), `name`, `photo`, `job`, `content`, `published` |
| 12 | `schedules_tk` | Jadwal mata pelajaran kelas | `id` (PK), `class_id` (FK `classes_tk`), `day`, `subject`, `start_time`, `end_time` |
| 13 | `materials_tk` | Materi pembelajaran & tugas siswa | `id` (PK), `title`, `description`, `file_url`, `class_id` (FK `classes_tk`), `teacher_id` (FK `teachers_tk`), `created_at` |
| 14 | `attendance_tk` | Presensi harian siswa | `id` (PK), `student_id` (FK `students_tk`), `date`, `status` |
| 15 | `grades_tk` | Nilai & rapor aspek perkembangan anak | `id` (PK), `student_id` (FK `students_tk`), `teacher_id` (FK `teachers_tk`), `subject`, `score`, `description` |
| 16 | `chats_tk` | Pesan komunikasi guru & orang tua | `id` (PK), `sender_id` (FK `users_tk`), `receiver_id` (FK `users_tk`), `message`, `created_at` |
| 17 | `activity_logs_tk` | Log audit aktivitas sistem | `id` (PK), `user_id` (FK `users_tk`), `activity`, `created_at` |
| 18 | `settings_tk` | Konfigurasi global website | `key` (PK), `value`, `updated_at` |

---
*Dokumen ini dibuat otomatis sebagai bagian dari sistem dokumentasi pemeliharaan KB & TK Istiqamah.*
