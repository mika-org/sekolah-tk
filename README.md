Berikut adalah **prompt lengkap** yang dapat langsung digunakan di **Cursor AI, Claude Code, GPT-5, Bolt.new, Lovable, atau AI Coding Agent** untuk membangun website seperti desain di atas menggunakan **Next.js + Supabase** dengan fitur PPDB lengkap.

---

# Prompt

Bangun sebuah website **KB & TK Istiqamah** berdasarkan desain yang saya lampirkan.

Gunakan stack berikut:

* Next.js 15 (App Router)
* TypeScript
* TailwindCSS
* Shadcn/UI
* Framer Motion
* Supabase
* React Hook Form
* Zod Validation
* TanStack Query
* UploadThing atau Supabase Storage
* Nodemailer / Resend Email
* Prisma (optional jika memakai PostgreSQL langsung)
* ESLint + Prettier

Website harus responsive (Desktop, Tablet, Mobile).

Gunakan warna utama:

```text
Primary Green : #07A363
Primary Blue  : #07265F
Cream         : #F8F6F2
```

---

# Landing Page

Ikuti layout seperti desain.

## Navbar

* Logo
* Beranda
* Tentang Kami
* Program
* Aktivitas
* Galeri
* Kontak
* Login
* Daftar Sekarang (PPDB)

Navbar sticky.

---

## Hero

* Judul besar
* Subtitle
* Deskripsi
* Tombol:

  * Lihat Program
  * Daftar PPDB

Animasi ketika scroll.

---

## Mengapa Memilih Kami

Card icon

* Guru Profesional
* Kurikulum Islami
* Fasilitas Lengkap

---

## Program

Card:

* KB
* TK A
* TK B
* Tahfidz
* Ekstrakurikuler

---

## Galeri

Gallery slider

* Image
* Video

Semua berasal dari database.

---

## Testimoni

Slider testimonial

---

## Kontak

Alamat

Google Maps

WA

Email

Jam Operasional

---

## Footer

Menu

Social Media

Copyright

---

# Authentication

Gunakan Supabase Auth.

Role:

```
Super Admin
Admin
Guru
Orang Tua
```

Login menggunakan:

* Username
* Password

Bukan email.

---

# Dashboard

Setelah login tampil dashboard sesuai role.

---

# Super Admin

Memiliki akses penuh.

Menu:

Dashboard

Master Data

* Guru
* Murid
* Orang Tua
* Kelas
* Tahun Ajaran
* Program
* Mata Pelajaran

PPDB

Keuangan

Galeri

Pengumuman

Testimoni

Website Setting

Role Permission

Laporan

Audit Log

---

# Admin

Dapat mengelola:

PPDB

Murid

Guru

Galeri

Website

Pengumuman

Pembayaran

---

# Guru

Dashboard berisi:

Jadwal Mengajar

Absensi

Input Nilai

Catatan Perkembangan

Upload Dokumentasi

Materi

Komunikasi Orang Tua

---

# Orang Tua

Dashboard berisi:

Profil Anak

Status PPDB

Absensi

Nilai

Rapor

Tagihan

Pembayaran

Pengumuman

Chat Guru

Download Dokumen

---

# Sistem PPDB

Halaman:

/ppdb

Form sangat lengkap.

Data Anak

* Nama Lengkap
* NIK
* NISN
* Tempat Lahir
* Tanggal Lahir
* Jenis Kelamin
* Agama
* Anak Ke
* Jumlah Saudara
* Alamat

Data Orang Tua

Ayah

Ibu

Wali

Pekerjaan

No HP

Email

Penghasilan

Alamat

Dokumen Upload

* KK
* Akta
* Foto Anak
* KTP Ayah
* KTP Ibu
* Bukti Pembayaran

Semua upload ke Supabase Storage.

---

# Alur PPDB

Status:

```
Draft

Submitted

Verifikasi Berkas

Menunggu Pembayaran

Pembayaran Diverifikasi

Tes

Diterima

Ditolak
```

Admin dapat mengubah status.

---

# Auto Generate User

Ketika Admin menekan tombol:

Terima PPDB

Maka sistem otomatis membuat akun Orang Tua.

Data login:

Username:

gunakan format

```
namaanak
```

Jika sudah ada

```
namaanak01

namaanak02
```

dst.

Password:

gunakan tanggal lahir anak

Format

```
DDMMYYYY
```

contoh

```
17052021
```

Password harus langsung di-hash menggunakan bcrypt.

Role:

```
orang_tua
```

Status:

```
active
```

---

# Email Otomatis

Setelah akun berhasil dibuat.

Kirim email ke Orang Tua.

Isi email:

---

Selamat.

Ananda telah diterima di KB & TK Istiqamah.

Berikut akun untuk login.

Username:

xxxxxxxx

Password:

xxxxxxxx

Silakan login melalui:

[https://domainanda.com/login](https://domainanda.com/login)

Terima kasih.

---

Gunakan template HTML modern.

---

# Dashboard PPDB

Admin melihat statistik.

Jumlah:

Pendaftar

Menunggu

Diterima

Ditolak

Grafik Bulanan

---

# Pembayaran

Metode:

Transfer

QRIS

Cash

Upload Bukti Transfer

Status:

Pending

Verified

Rejected

---

# Galeri CMS

Admin dapat:

Tambah Album

Tambah Foto

Tambah Video

Drag and Drop Upload

---

# Pengumuman

CRUD

Target:

Semua

Guru

Orang Tua

---

# Testimoni

CRUD

Foto

Nama

Pekerjaan

Isi

Status Publish

---

# SEO

Dynamic Metadata

OpenGraph

robots.txt

sitemap.xml

JSON-LD

---

# Performance

Gunakan:

Server Component

Image Optimization

Lazy Loading

Caching

ISR

---

# Keamanan

Gunakan:

Middleware Authentication

Role Based Access

CSRF Protection

Rate Limiter

Zod Validation

Sanitize Input

bcrypt Password

Supabase RLS

---

# Struktur Folder

```
app/

components/

features/

lib/

hooks/

actions/

types/

services/

utils/

schemas/

emails/

supabase/

middleware.ts
```

Gunakan feature-based architecture.

---

# Database Supabase

Buat migration SQL lengkap.

## Tables

### users

```
id

username

email

password_hash

role

status

created_at
```

---

### students

```
id

user_id

nama

nik

nisn

tempat_lahir

tanggal_lahir

jenis_kelamin

agama

alamat

kelas_id

status
```

---

### parents

```
id

user_id

student_id

nama_ayah

nama_ibu

hp

email

alamat

pekerjaan
```

---

### teachers

```
id

user_id

nama

nip

hp

alamat
```

---

### classes

```
id

nama

guru_id

tahun_ajaran
```

---

### ppdb

```
id

student_name

birth_date

status

payment_status

created_at
```

---

### ppdb_documents

```
id

ppdb_id

type

file_url
```

---

### galleries

```
id

title

image

category

created_at
```

---

### testimonials

```
id

name

photo

job

content

published
```

---

### announcements

```
id

title

content

target

published
```

---

### payments

```
id

ppdb_id

method

amount

proof

status
```

---

### attendance

```
id

student_id

date

status
```

---

### grades

```
id

student_id

teacher_id

subject

score

description
```

---

### activity_logs

```
id

user_id

activity

created_at
```

---

# Supabase Storage Bucket

```
ppdb-documents

gallery

teacher

student

profile

payment-proof

report

announcement
```

---

# Fitur Tambahan

* Dark Mode
* Export PDF
* Export Excel
* Dashboard Analytics
* Full Calendar
* Notification Center
* Email Queue
* Pagination
* Search
* Filter
* Realtime Notification Supabase
* Audit Log
* Multi Tahun Ajaran
* Backup Database
* Settings Website
* Banner Management
* FAQ CMS
* Contact CMS

---

# Hasil Akhir yang Diharapkan

AI harus menghasilkan proyek yang siap production dengan:

* Struktur kode yang bersih dan modular.
* Komponen reusable.
* Database Supabase lengkap beserta migration SQL dan Row Level Security (RLS).
* Integrasi autentikasi berbasis username/password dengan role **Super Admin, Admin, Guru, dan Orang Tua**.
* Sistem PPDB end-to-end, termasuk upload dokumen, verifikasi admin, pembayaran, dan pembuatan akun otomatis saat peserta dinyatakan diterima.
* Pengiriman email otomatis berisi username dan password kepada orang tua setelah akun dibuat.
* Dashboard terpisah sesuai role, lengkap dengan middleware, validasi, keamanan, logging, dan dokumentasi instalasi serta deployment.
