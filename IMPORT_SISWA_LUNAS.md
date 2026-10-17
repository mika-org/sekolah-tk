# Panduan & Format Import Data Siswa
**KB & TK Istiqamah Balikpapan**

Dokumen ini menjelaskan struktur data, pemetaan kolom, dan aturan otomatisasi sistem sesuai format tabel data sekolah.

---

## 1. Format Tabel Standar Sekolah

Format kolom pada berkas Excel / CSV disesuaikan langsung dengan format tabel yang Anda gunakan:

```
| NAMA ANAK | L/P | KLP | TEMPAT LAHIR | Tanggal Lahir | TANGGAL SEKOLAH | UMUR/JULI | NAMA ORANG TUA | ALAMAT | NO TLP/HP | KETERANGAN |
```

---

## 2. Pemetaan Kolom: Wajib vs Boleh Kosong

Dari 11 kolom tabel di atas, pembagian statusnya adalah sebagai berikut:

### A. Kolom WAJIB (Tidak Boleh Kosong / NOT NULL)
Data pokok minimum yang mutlak diperlukan agar sistem dapat mendaftarkan siswa dan membuat akun portal orang tua:

| No | Nama Kolom Header | Tipe Data | Keterangan & Ketentuan | Contoh Isi |
|:--:|:------------------|:----------|:-----------------------|:-----------|
| 1 | **`NAMA ANAK`** | Teks | Nama lengkap murid sesuai Akta Kelahiran / KK. Minimal 2 karakter. | `Muhammad Althaf Karim` |
| 2 | **`L/P`** | Teks | Jenis kelamin: diisi **`L`** (Laki-laki) atau **`P`** (Perempuan). | `L` atau `P` |
| 3 | **`Tanggal Lahir`** | Tanggal | Format: `YYYY-MM-DD` (contoh: `2020-05-14`) atau `DD/MM/YYYY` (contoh: `14/05/2020`). Digunakan untuk data siswa dan **Password Awal Akun Orang Tua** (`DDMMYYYY`). | `2020-05-14` |
| 4 | **`NAMA ORANG TUA`** | Teks | Nama ayah, ibu, atau wali murid. Minimal salah satu nama orang tua terisi. | `Bambang Haryanto` |

---

### B. Kolom FLEKSIBEL (Boleh Dikosongkan / Boleh NULL)
Kolom berikut **fleksibel** dan boleh dikosongkan jika data belum lengkap:

| No | Nama Kolom Header | Tipe Data | Nilai Bawaan (Default) Jika Kosong | Keterangan | Contoh Isi |
|:--:|:------------------|:----------|:-----------------------------------|:-----------|:-----------|
| 1 | **`KLP`** | Teks | `NULL` | **Otomatis Dipetakan ke Kelas**: Kelompok / Kelas (misal: `TK A`, `TK B`, `KB`, `Abu Bakar`). Sistem otomatis mencocokkan dengan kelas yang ada, dan jika kelas belum tersedia, sistem akan otomatis membuatkan kelas baru di database. | `TK A` |
| 2 | **`TEMPAT LAHIR`** | Teks | `NULL` | Kota/Kabupaten kelahiran anak. | `Balikpapan` |
| 3 | **`TANGGAL SEKOLAH`**| Tanggal | Hari ini (tanggal import) | Tanggal mulai masuk sekolah atau tanggal registrasi/pelunasan. | `2026-07-15` |
| 4 | **`UMUR/JULI`** | Teks | Dihitung otomatis / `NULL` | Usia anak per bulan Juli (tersimpan dalam catatan pendaftaran). | `6 Th 2 Bln` |
| 5 | **`ALAMAT`** | Teks | `NULL` | Alamat domisili tempat tinggal anak / orang tua. | `Jl. MT Haryono No. 45` |
| 6 | **`NO TLP/HP`** | Teks/Angka| `NULL` | Nomor HP/WhatsApp aktif orang tua untuk komunikasi guru. | `081234567890` |
| 7 | **`KETERANGAN`** | Teks | `Lunas` | Status keterangan (misal: `Lunas`, `Pindahan`, `Tahap 1`, dll). | `Lunas` |

---

## 3. Contoh Baris Data (Template Berkas)

### Header CSV:
```csv
NAMA ANAK,L/P,KLP,TEMPAT LAHIR,Tanggal Lahir,TANGGAL SEKOLAH,UMUR/JULI,NAMA ORANG TUA,ALAMAT,NO TLP/HP,KETERANGAN
```

### Contoh 1 (Data Lengkap Terisi):
```csv
Muhammad Althaf Karim,L,TK A,Balikpapan,2020-05-14,2026-07-15,6 Th 2 Bln,Bambang Haryanto,Jl. MT Haryono No. 45 Balikpapan,081234567890,Lunas
```

### Contoh 2 (Data Minimalis - Kolom Opsional Dikosongkan):
```csv
Aisyah Nur Salsabila,P,TK A,Balikpapan,18/02/2021,,,Nurul Hasanah,,085298765432,Lunas
```
*(Pada Contoh 2: TANGGAL SEKOLAH, UMUR/JULI, dan ALAMAT dikosongkan. Data tetap valid dan sukses diimport).*

---

## 4. Mekanisme Otomatisasi Saat Berkas Diunggah

Ketika tombol **"Proses Import"** ditekan di menu Admin:

1. **Akun Portal Orang Tua (`users_tk`)**:
   - **Username**: Dibuat otomatis dari nama depan anak: `ortu_<nama_depan>` (contoh: `ortu_althaf`). Jika sudah ada, sistem otomatis menambahkan angka pembeda (`ortu_althaf01`).
   - **Password Awal**: Tanggal lahir format `DDMMYYYY` (contoh: lahir `14/05/2020` maka passwordnya `14052020`).
   - Role langsung aktif sebagai `orang_tua`.

2. **Status Pendaftaran & Pembayaran**:
   - Record dibuat di tabel pendaftaran (`ppdb_tk`) dengan status **`Diterima`** dan pembayaran **`Verified`** (Lunas).
   - Record pembayaran dibuat di tabel transaksi (`payments_tk`) berstatus **`Verified`**.

3. **Data Pokok Murid & Wali**:
   - Siswa dicatat di tabel murid aktif (`students_tk`) dengan `status: "active"` dan terhubung ke akun portal.
   - Nama orang tua dan kontak dicatat di tabel wali murid (`parents_tk`).
   - Kolom `KLP` (Kelompok), `UMUR/JULI`, `TEMPAT LAHIR`, `TANGGAL SEKOLAH`, dan `KETERANGAN` tersimpan rapi dalam detail biodata siswa.

4. **Rekap Kredensial Instan**:
   - Admin dapat langsung menyalin (Copy) atau mendownload daftar username & password seluruh orang tua dalam format Excel untuk dibagikan kepada wali murid.

---

## 5. Fitur Download Data Bermasalah & Penanganan Error (Error Recovery)

Jika terdapat baris data yang tidak lengkap atau bermasalah, sistem menyediakan fitur unduh data bermasalah agar Admin tidak perlu mencari satu per satu secara manual:

1. **Unduh Data Bermasalah Saat Pratinjau (Sebelum Import)**:
   - Jika saat berkas diunggah sistem menemukan baris yang tidak memenuhi syarat (muncul indikator merah *Ada Masalah*), langsung tersedia tombol:  
     👉 **`Download Data Bermasalah ([Jumlah])`**
   - Berkas yang diunduh adalah format Excel (`.xlsx`) yang **hanya berisi baris-baris bermasalah** lengkap dengan kolom khusus: **`PENYEBAB MASALAH / ERROR`**.
   - **Cara kerja praktis:**
     1. Klik tombol **Download Data Bermasalah**.
     2. Buka berkas Excel tersebut, periksa kolom `PENYEBAB MASALAH / ERROR` (misal: *"NAMA ANAK wajib diisi"* atau *"Tanggal Lahir tidak valid"*).
     3. Lengkapi data yang kurang pada berkas tersebut lalu simpan (*Save*).
     4. Unggah kembali berkas yang sudah diperbaiki ke sistem.

2. **Unduh Data Gagal di Modal Hasil (Setelah Import)**:
   - Jika ada data yang gagal disimpan saat proses database dijalankan, pada jendela hasil akhir import akan muncul tombol:  
     👉 **`Download Data Gagal ([Jumlah])`**
   - Admin dapat mengunduh daftar murid yang gagal diproses beserta alasan kegagalannya untuk diperiksa dan diimport ulang tanpa mempengaruhi murid yang sudah berhasil.

