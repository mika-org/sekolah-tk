export type PPDBFieldType = 'text' | 'date' | 'number' | 'email' | 'tel' | 'time' | 'select' | 'textarea'

export interface PPDBFieldOption {
  value: string
  label: string
}

export interface PPDBFieldDefinition {
  name: string
  label: string
  type?: PPDBFieldType
  placeholder?: string
  hint?: string
  required?: boolean
  uppercase?: boolean
  maxLength?: number
  min?: number
  step?: string
  span?: 1 | 2
  options?: PPDBFieldOption[]
}

export interface PPDBFormSection {
  title: string
  description?: string
  fields: PPDBFieldDefinition[]
}

const option = (value: string, label = value): PPDBFieldOption => ({ value, label })

export const CHILD_FORM_SECTIONS: PPDBFormSection[] = [
  {
    title: 'Identitas Anak',
    description: 'Isi sesuai Akta Kelahiran dan Kartu Keluarga.',
    fields: [
      { name: 'student_name', label: 'Nama Lengkap Anak', required: true, uppercase: true, span: 2, placeholder: 'Sesuai akta kelahiran' },
      { name: 'nama_panggilan', label: 'Nama Panggilan', required: true, uppercase: true },
      { name: 'nik', label: 'NIK Anak', required: true, maxLength: 16, hint: '16 digit' },
      { name: 'no_registrasi_akta', label: 'No. Registrasi Akta Kelahiran', required: true },
      { name: 'no_kartu_keluarga', label: 'No. Kartu Keluarga', required: true, maxLength: 16, hint: '16 digit' },
      {
        name: 'jenis_kelamin',
        label: 'Jenis Kelamin',
        type: 'select',
        required: true,
        options: [option('L', 'Laki-laki'), option('P', 'Perempuan')],
      },
      { name: 'tempat_lahir', label: 'Tempat Lahir', required: true, uppercase: true },
      { name: 'birth_date', label: 'Tanggal Lahir', type: 'date', required: true },
      {
        name: 'agama',
        label: 'Agama',
        type: 'select',
        required: true,
        options: ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map((item) => option(item)),
      },
      {
        name: 'kewarganegaraan',
        label: 'Kewarganegaraan',
        type: 'select',
        required: true,
        options: [option('WNI'), option('WNA')],
      },
      {
        name: 'status_pendaftaran',
        label: 'Jenis Pendaftaran',
        type: 'select',
        required: true,
        options: [option('Murid baru'), option('Siswa pindahan')],
      },
    ],
  },
  {
    title: 'Keluarga dan Data Pribadi',
    fields: [
      { name: 'anak_ke', label: 'Anak Nomor Ke-', type: 'number', min: 1, required: true },
      { name: 'jml_saudara', label: 'Jumlah Saudara Kandung/Tiri', type: 'number', min: 0, required: true },
      { name: 'bahasa_sehari_hari', label: 'Bahasa Sehari-hari', uppercase: true },
      { name: 'golongan_darah', label: 'Golongan Darah', type: 'select', options: ['A', 'B', 'AB', 'O', 'Belum diketahui'].map((item) => option(item)) },
      { name: 'berat_badan_kg', label: 'Berat Badan', type: 'number', min: 0, step: '0.1', hint: 'kg' },
      { name: 'tinggi_badan_cm', label: 'Tinggi Badan', type: 'number', min: 0, step: '0.1', hint: 'cm' },
      { name: 'lingkar_kepala_cm', label: 'Lingkar Kepala', type: 'number', min: 0, step: '0.1', hint: 'cm' },
      { name: 'hobi_anak', label: 'Hobi Anak', uppercase: true },
      { name: 'cita_cita_anak', label: 'Cita-cita Anak', uppercase: true },
      {
        name: 'riwayat_pendidikan',
        label: 'Riwayat Pendidikan Sebelumnya',
        type: 'select',
        options: [
          option('Belum pernah sekolah'),
          option('Daycare'),
          option('Kelompok Bermain (KB)'),
          option('Lainnya'),
        ],
      },
      { name: 'nama_sekolah_sebelumnya', label: 'Nama Daycare/KB/Sekolah Sebelumnya', uppercase: true, span: 2 },
    ],
  },
  {
    title: 'Tempat Tinggal',
    description: 'Alamat utama mengikuti alamat yang tercantum pada Kartu Keluarga.',
    fields: [
      { name: 'jarak_ke_tk', label: 'Jarak Tempat Tinggal ke TK', placeholder: 'Contoh: 2 km' },
      { name: 'waktu_tempuh_ke_tk', label: 'Waktu Tempuh ke TK', placeholder: 'Contoh: 15 menit' },
      { name: 'transportasi_ke_tk', label: 'Alat Transportasi', uppercase: true, span: 2 },
      { name: 'alamat', label: 'Alamat pada Kartu Keluarga', type: 'textarea', required: true, uppercase: true, span: 2 },
    ],
  },
]

function createParentSections(role: 'ayah' | 'ibu'): PPDBFormSection[] {
  const title = role === 'ayah' ? 'Ayah' : 'Ibu'
  return [
    {
      title: `Identitas ${title}`,
      description: `Isi data ${title.toLowerCase()} kandung, tiri, atau angkat. Kosongkan bagian ini bila tidak ada.`,
      fields: [
        {
          name: `status_${role}`,
          label: `Status ${title}`,
          type: 'select',
          options: ['Kandung', 'Tiri', 'Angkat'].map((item) => option(item)),
        },
        { name: `nama_${role}`, label: `Nama Lengkap ${title}`, uppercase: true },
        { name: `nik_${role}`, label: `NIK ${title}`, maxLength: 16, hint: '16 digit' },
        { name: `tempat_lahir_${role}`, label: 'Tempat Lahir', uppercase: true },
        { name: `tanggal_lahir_${role}`, label: 'Tanggal Lahir', type: 'date' },
        {
          name: `agama_${role}`,
          label: 'Agama',
          type: 'select',
          options: ['Islam', 'Kristen Protestan', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map((item) => option(item)),
        },
        { name: `kewarganegaraan_${role}`, label: 'Kewarganegaraan', type: 'select', options: [option('WNI'), option('WNA')] },
        { name: `pendidikan_${role}`, label: 'Pendidikan Terakhir', uppercase: true },
        { name: `pekerjaan_${role}`, label: 'Pekerjaan', uppercase: true },
        { name: `penghasilan_${role}`, label: 'Penghasilan per Bulan', placeholder: 'Contoh: Rp 5.000.000' },
      ],
    },
    {
      title: `Alamat dan Kontak ${title}`,
      fields: [
        { name: `alamat_${role}`, label: 'Alamat Rumah', type: 'textarea', uppercase: true, span: 2 },
        { name: `rt_rw_${role}`, label: 'RT/RW', placeholder: 'Contoh: 003/008' },
        { name: `kelurahan_${role}`, label: 'Dusun/Kelurahan', uppercase: true },
        { name: `kecamatan_${role}`, label: 'Kecamatan', uppercase: true },
        { name: `kode_pos_${role}`, label: 'Kode Pos', maxLength: 5 },
        { name: `email_${role}`, label: 'Email', type: 'email', placeholder: `${role}@email.com` },
        {
          name: `jenis_tinggal_${role}`,
          label: 'Jenis Tinggal',
          type: 'select',
          options: ['Pribadi', 'Sewa', 'Dinas', 'Bersama orang tua'].map((item) => option(item)),
        },
        { name: `hp_${role}`, label: 'No. Telepon/HP/WhatsApp', type: 'tel', placeholder: '08xx xxxx xxxx' },
        { name: `kantor_${role}`, label: 'Alamat Kantor', type: 'textarea', uppercase: true, span: 2 },
        { name: `telepon_kantor_${role}`, label: 'Telepon/HP Kantor', type: 'tel' },
      ],
    },
  ]
}

export const FATHER_FORM_SECTIONS = createParentSections('ayah')
export const MOTHER_FORM_SECTIONS = createParentSections('ibu')

export const HEALTH_FORM_SECTIONS: PPDBFormSection[] = [
  {
    title: 'Riwayat Kehamilan',
    fields: [
      { name: 'pernah_keguguran', label: 'Pernah Mengalami Keguguran Sebelumnya?', type: 'select', options: [option('Tidak'), option('Ya')] },
      {
        name: 'kesulitan_kehamilan',
        label: 'Kesulitan pada Masa Kehamilan',
        type: 'select',
        options: ['Tidak ada', 'Triwulan I', 'Triwulan II', 'Triwulan III', 'Lebih dari satu triwulan'].map((item) => option(item)),
      },
      { name: 'penjelasan_kesulitan_kehamilan', label: 'Penjelasan Kesulitan Kehamilan', type: 'textarea', span: 2 },
      { name: 'usia_ibu_saat_hamil', label: 'Usia Ibu Saat Hamil', type: 'number', min: 0, hint: 'tahun' },
    ],
  },
  {
    title: 'Riwayat Kelahiran dan ASI',
    fields: [
      { name: 'usia_kandungan_status', label: 'Umur Kandungan', type: 'select', options: [option('Cukup'), option('Kurang')] },
      { name: 'usia_kandungan_minggu', label: 'Usia Kandungan', type: 'number', min: 0, hint: 'minggu' },
      { name: 'proses_kelahiran', label: 'Saat Kelahiran', type: 'select', options: ['Lancar/biasa', 'Lama', 'Sukar'].map((item) => option(item)) },
      { name: 'cara_persalinan', label: 'Cara Persalinan/Keterangan', uppercase: true },
      { name: 'tempat_kelahiran', label: 'Tempat Kelahiran', type: 'select', options: ['Rumah sendiri', 'Rumah sakit', 'Lainnya'].map((item) => option(item)) },
      { name: 'penolong_kelahiran', label: 'Ditolong Oleh', uppercase: true },
      { name: 'berat_lahir_kg', label: 'Berat Lahir', type: 'number', min: 0, step: '0.1', hint: 'kg' },
      { name: 'panjang_lahir_cm', label: 'Panjang Lahir', type: 'number', min: 0, step: '0.1', hint: 'cm' },
      { name: 'lingkar_kepala_lahir_cm', label: 'Lingkar Kepala Saat Lahir', type: 'number', min: 0, step: '0.1', hint: 'cm' },
      { name: 'menangis_spontan', label: 'Menangis Spontan Saat Lahir?', type: 'select', options: [option('Ya'), option('Tidak, dengan rangsangan')] },
      { name: 'kondisi_tangisan', label: 'Kondisi Tangisan', type: 'select', options: ['Kuat', 'Lemah', 'Merintih'].map((item) => option(item)) },
      { name: 'pernah_kuning', label: 'Pernah Kuning/Bilirubin Tinggi?', type: 'select', options: [option('Tidak'), option('Ya')] },
      { name: 'durasi_kuning', label: 'Durasi Kuning', placeholder: 'Contoh: 5 hari' },
      { name: 'perawatan_kuning', label: 'Perawatan/Treatment Kuning', type: 'textarea', span: 2 },
      { name: 'dapat_mengisap_asi', label: 'Dapat Mengisap ASI dengan Kuat?', type: 'select', options: [option('Ya'), option('Tidak')] },
      { name: 'lama_pemberian_asi_bulan', label: 'Lama Pemberian ASI', type: 'number', min: 0, hint: 'bulan' },
      { name: 'keterangan_pemberian_asi', label: 'Keterangan Pemberian ASI', type: 'textarea', span: 2 },
      { name: 'usia_mulai_pengganti_asi_bulan', label: 'Mulai Pengganti ASI', type: 'number', min: 0, hint: 'bulan' },
      { name: 'jenis_pengganti_asi', label: 'Jenis Pengganti ASI' },
      { name: 'makanan_padat_bayi', label: 'Makanan Padat Bayi', type: 'textarea', span: 2 },
    ],
  },
  {
    title: 'Pengasuhan dan Toilet Training',
    fields: [
      { name: 'pengasuh_utama', label: 'Pengasuh Utama Saat Bayi-Balita', type: 'select', options: ['Orang tua (ibu)', 'Saudara', 'Orang lain'].map((item) => option(item)) },
      { name: 'nama_pengasuh', label: 'Nama/Hubungan Pengasuh', uppercase: true },
      { name: 'usia_kontrol_bak', label: 'Dapat Mengatur BAK pada Usia', placeholder: 'Contoh: 2 tahun' },
      { name: 'cara_latihan_bak', label: 'Cara Melatih BAK', type: 'textarea' },
      { name: 'usia_kontrol_bab', label: 'Dapat Mengatur BAB pada Usia', placeholder: 'Contoh: 2 tahun' },
      { name: 'cara_latihan_bab', label: 'Cara Melatih BAB', type: 'textarea' },
      { name: 'bantuan_toilet', label: 'Masih Harus Ditolong Saat Buang Air?', type: 'select', options: ['Ya', 'Tidak', 'Kadang-kadang'].map((item) => option(item)) },
    ],
  },
  {
    title: 'Pola Makan, Kegiatan, dan Tidur',
    fields: [
      { name: 'menu_pagi', label: 'Menu Pagi', type: 'textarea' },
      { name: 'menu_siang', label: 'Menu Siang', type: 'textarea' },
      { name: 'menu_malam', label: 'Menu Malam', type: 'textarea' },
      { name: 'makanan_disukai', label: 'Makanan yang Disukai', type: 'textarea' },
      { name: 'makanan_tidak_disukai', label: 'Makanan yang Tidak Disukai', type: 'textarea' },
      { name: 'alergi_makanan', label: 'Alergi pada Makanan', type: 'textarea' },
      { name: 'kegiatan_sehari_hari', label: 'Jadwal/Kegiatan Sehari-hari Anak', type: 'textarea', span: 2 },
      { name: 'tidur_malam_pukul', label: 'Tidur Malam Pukul', type: 'time' },
      { name: 'bangun_pagi_pukul', label: 'Bangun Pagi Pukul', type: 'time' },
      { name: 'tidur_siang_pukul', label: 'Tidur Siang Pukul', type: 'time' },
      { name: 'bangun_tidur_siang_pukul', label: 'Bangun Tidur Siang Pukul', type: 'time' },
      { name: 'frekuensi_mengompol', label: 'Mengompol Saat Tidur', type: 'select', options: ['Sering', 'Jarang', 'Tidak'].map((item) => option(item)) },
      { name: 'keterangan_tidur', label: 'Hal Lain pada Waktu Tidur', type: 'textarea', span: 2 },
    ],
  },
  {
    title: 'Riwayat Kesehatan dan Psikologi',
    fields: [
      { name: 'riwayat_penyakit', label: 'Penyakit yang Pernah Diderita', type: 'textarea', span: 2 },
      { name: 'riwayat_imunisasi', label: 'Imunisasi yang Pernah Diterima', type: 'textarea', span: 2, placeholder: 'Tuliskan jenis imunisasi, dipisahkan dengan koma' },
      { name: 'ciri_fisik_khusus', label: 'Ciri-ciri Fisik Khusus', type: 'textarea', span: 2 },
      { name: 'pernah_pemeriksaan_psikologi', label: 'Pernah Mengikuti Pemeriksaan Psikologi?', type: 'select', options: [option('Tidak'), option('Ya')] },
      { name: 'tujuan_pemeriksaan_psikologi', label: 'Tujuan Pemeriksaan Psikologi', type: 'textarea' },
      { name: 'lembaga_psikolog', label: 'Lembaga/Psikolog', uppercase: true },
      { name: 'frekuensi_pemeriksaan_psikologi', label: 'Waktu dan Frekuensi Pemeriksaan' },
      { name: 'hasil_saran_psikolog', label: 'Hasil/Saran Psikolog', type: 'textarea', span: 2 },
    ],
  },
]

export const allFields = (sections: PPDBFormSection[]) => sections.flatMap((section) => section.fields)
