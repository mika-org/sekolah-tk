export type TKGradeCriteria = 'BB' | 'MB' | 'BSH' | 'BSB'

export const CRITERIA_MAP: Record<TKGradeCriteria, { label: string; score: number; color: string; bg: string; badge: string; desc: string }> = {
  BB: {
    label: 'BB (Belum Berkembang)',
    score: 1,
    color: '#E11D48',
    bg: '#FFF1F2',
    badge: 'bg-rose-50 text-rose-800 border-rose-200 shadow-2xs font-bold rounded-lg',
    desc: 'Anak melakukannya harus dengan bimbingan penuh atau dicontohkan oleh guru.',
  },
  MB: {
    label: 'MB (Mulai Berkembang)',
    score: 2,
    color: '#D97706',
    bg: '#FFFBEB',
    badge: 'bg-amber-50 text-amber-800 border-amber-200 shadow-2xs font-bold rounded-lg',
    desc: 'Anak melakukannya masih harus diingatkan atau dibantu secara berkala oleh guru.',
  },
  BSH: {
    label: 'BSH (Berkembang Sesuai Harapan)',
    score: 3,
    color: '#2563EB',
    bg: '#EFF6FF',
    badge: 'bg-blue-50 text-blue-800 border-blue-200 shadow-2xs font-bold rounded-lg',
    desc: 'Anak sudah dapat melakukannya secara mandiri dan konsisten tanpa diingatkan.',
  },
  BSB: {
    label: 'BSB (Berkembang Sangat Baik)',
    score: 4,
    color: '#059669',
    bg: '#ECFDF5',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs font-bold rounded-lg',
    desc: 'Anak sudah dapat melakukannya secara mandiri dan dapat membantu/menjadi teladan bagi teman.',
  },
}

// Pengelompokan Bulan per Semester 1 & 2 (Point 14)
export const MONTHS_SEMESTER_1 = [
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const

export const MONTHS_SEMESTER_2 = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
] as const

export const ALL_MONTHS = [...MONTHS_SEMESTER_1, ...MONTHS_SEMESTER_2] as const

export type PAUDMonth = (typeof ALL_MONTHS)[number]
export type PAUDSemester = 'Semester 1' | 'Semester 2'

export interface LearningObjectiveTP {
  id: string // e.g. TP-01, TP-JD-01
  code: string
  element: 'Capaian Pembelajaran' | 'Jati Diri'
  category: string
  tp: string
  indicator: string
}

// 10 TP Capaian Pembelajaran & 8 TP Jati Diri (Point 15 & 16)
export const PAUD_CP_GENERAL_10: LearningObjectiveTP[] = [
  {
    id: 'TP-01',
    code: 'TP 1',
    element: 'Capaian Pembelajaran',
    category: 'Nilai Agama dan Moral',
    tp: 'Mengenal dan mengimani Allah SWT serta menyayangi ciptaan-Nya',
    indicator: 'Mampu melafalkan dua kalimat syahadat, kalimat thayyibah (Basmalah & Hamdalah), serta menyebutkan ciptaan Allah (alam, hewan, tanaman, manusia).',
  },
  {
    id: 'TP-02',
    code: 'TP 2',
    element: 'Capaian Pembelajaran',
    category: 'Ibadah Praktis',
    tp: 'Mempraktikkan tata cara bersuci (wudhu) dan gerakan shalat harian',
    indicator: 'Mampu menirukan urutan gerakan wudhu secara berurutan dan tertib mengikuti shalat berjamaah.',
  },
  {
    id: 'TP-03',
    code: 'TP 3',
    element: 'Capaian Pembelajaran',
    category: 'Al-Qur\'an & Doa',
    tp: 'Mengenal huruf hijaiyah berharakat dan melafalkan doa praktis harian',
    indicator: 'Mampu melafalkan huruf hijaiyah metode Tilawati dasar dengan lagu Rost serta hafal minimal 5 doa harian pendek.',
  },
  {
    id: 'TP-04',
    code: 'TP 4',
    element: 'Capaian Pembelajaran',
    category: 'Akhlak & Adab Islami',
    tp: 'Membiasakan adab dan perilaku mulia dalam kehidupan sehari-hari',
    indicator: 'Terbiasa mengucap salam saat datang, berdoa sebelum & sesudah makan, serta bertutur kata sopan kepada guru dan kawan.',
  },
  {
    id: 'TP-05',
    code: 'TP 5',
    element: 'Capaian Pembelajaran',
    category: 'Fisik & Motorik Kasar',
    tp: 'Menunjukkan kemampuan motorik kasar dan koordinasi keseimbangan tubuh',
    indicator: 'Mampu melompat dengan tumpuan seimbang, berlari lincah, menendang serta melempar-menangkap bola dengan terarah.',
  },
  {
    id: 'TP-06',
    code: 'TP 6',
    element: 'Capaian Pembelajaran',
    category: 'Fisik & Motorik Halus',
    tp: 'Menunjukkan kelenturan motorik halus dan koordinasi mata-tangan',
    indicator: 'Mampu memegang alat tulis/krayon dengan benar (tripod grip), menggunting mengikuti garis, dan meronce manik-manik.',
  },
  {
    id: 'TP-07',
    code: 'TP 7',
    element: 'Capaian Pembelajaran',
    category: 'Bahasa & Literasi Dini',
    tp: 'Mampu menyimak, memahami instruksi guru, dan mengekspresikan ide secara lisan',
    indicator: 'Mampu menceritakan kembali kisah/dongeng pendek, menjawab pertanyaan sederhana, dan mengenali simbol abjad.',
  },
  {
    id: 'TP-08',
    code: 'TP 8',
    element: 'Capaian Pembelajaran',
    category: 'Kognitif & Logika Matematika',
    tp: 'Mengenal konsep bilangan, perbandingan kuantitas, bentuk, dan pola logika',
    indicator: 'Mampu membilang benda 1-20 secara koresponden, mengelompokkan bentuk geometri warna, serta membedakan ukuran besar-kecil.',
  },
  {
    id: 'TP-09',
    code: 'TP 9',
    element: 'Capaian Pembelajaran',
    category: 'Sains & Eksplorasi STEAM',
    tp: 'Menunjukkan rasa ingin tahu ilmiah melalui observasi dan eksperimen sederhana',
    indicator: 'Mampu mengamati fenomena sekitar (terapung-tenggelam, mencampur warna dasar, sifat air) dan aktif bertanya secara kritis.',
  },
  {
    id: 'TP-10',
    code: 'TP 10',
    element: 'Capaian Pembelajaran',
    category: 'Seni & Apresiasi Estetika',
    tp: 'Mengekspresikan diri melalui ragam media seni visual, kriya, dan musikalitas',
    indicator: 'Mampu menyanyikan lagu anak bernada teratur, menggambar ekspresi bebas warna-warni, serta menghargai karya teman.',
  },
]

export const PAUD_CP_JATI_DIRI_8: LearningObjectiveTP[] = [
  {
    id: 'TP-JD-01',
    code: 'TP JD 1',
    element: 'Jati Diri',
    category: 'Pengelolaan Emosi Diri',
    tp: 'Mengenal, mengekspresikan, dan mengelola emosi diri secara wajar',
    indicator: 'Mampu mengutarakan perasaan senang/sedih/takut secara verbal dan mampu menenangkan diri tanpa tantrum berlebih.',
  },
  {
    id: 'TP-JD-02',
    code: 'TP JD 2',
    element: 'Jati Diri',
    category: 'Kemandirian & Tanggung Jawab',
    tp: 'Menunjukkan sikap percaya diri dan kemandirian dalam merawat diri sendiri',
    indicator: 'Mampu memakai dan melepas sepatu/kaos kaki mandiri, tuntas toilet training, serta berani tampil memimpin doa di kelas.',
  },
  {
    id: 'TP-JD-03',
    code: 'TP JD 3',
    element: 'Jati Diri',
    category: 'Konsep Diri Positif',
    tp: 'Mengenal identitas diri, anggota keluarga, dan memiliki citra diri positif',
    indicator: 'Mampu menyebutkan nama lengkap, usia, jenis kelamin, serta bangga terhadap identitas diri dan keluarganya.',
  },
  {
    id: 'TP-JD-04',
    code: 'TP JD 4',
    element: 'Jati Diri',
    category: 'Sosial & Empati Kawan',
    tp: 'Menunjukkan rasa empati, peduli, dan kesediaan berbagi dengan teman sebaya',
    indicator: 'Mau berbagi mainan/bekal makan secara sukarela, menghibur teman yang bersedih, serta terbiasa berucap tolong dan terima kasih.',
  },
  {
    id: 'TP-JD-05',
    code: 'TP JD 5',
    element: 'Jati Diri',
    category: 'Disiplin & Kesepakatan Kelas',
    tp: 'Mematuhi aturan bersama, disiplin mengantre, dan menghargai hak orang lain',
    indicator: 'Mampu antre mencuci tangan dengan tertib, sabar menunggu giliran bermain, dan merapikan mainan ke tempat semula.',
  },
  {
    id: 'TP-JD-06',
    code: 'TP JD 6',
    element: 'Jati Diri',
    category: 'Kesehatan & Kebersihan Diri (PHBS)',
    tp: 'Membiasakan perilaku hidup bersih, sehat, dan menjaga keselamatan diri',
    indicator: 'Mampu mencuci tangan pakai sabun dengan 6 langkah benar, menyukai makanan sehat, serta menjauhi benda berbahaya.',
  },
  {
    id: 'TP-JD-07',
    code: 'TP JD 7',
    element: 'Jati Diri',
    category: 'Adaptasi & Kerjasama Kelompok',
    tp: 'Mampu beradaptasi dengan lingkungan sekolah dan bekerjasama dalam tim',
    indicator: 'Mudah bergaul dengan teman baru, aktif berpartisipasi dalam aktivitas kelompok, dan tidak bergantung penuh pada orang tua.',
  },
  {
    id: 'TP-JD-08',
    code: 'TP JD 8',
    element: 'Jati Diri',
    category: 'Identitas Budaya & Kebangsaan',
    tp: 'Mengenal simbol kebangsaan Indonesia dan menghormati keragaman budaya',
    indicator: 'Mengenal warna bendera Merah Putih, menyanyikan lagu Indonesia Raya sederhana, dan menghormati perbedaan teman.',
  },
]

export const ALL_PAUD_TPS = [...PAUD_CP_GENERAL_10, ...PAUD_CP_JATI_DIRI_8]

// Fallback subjects for backward compatibility
export const PAUD_SUBJECTS = [
  'Nilai Agama dan Moral (NAM)',
  'Fisik & Motorik (Kasar & Halus)',
  'Kognitif & Logika',
  'Bahasa & Komunikasi',
  'Sosial Emosional & Kemandirian',
  'Seni & Kreativitas',
] as const

export interface SaveMonthlyGradePayload {
  studentId: string
  tpId: string // e.g. TP-01 or TP-JD-01
  criteria: TKGradeCriteria
  month: PAUDMonth
  semester: PAUDSemester
  academicYear?: string
  notes?: string
}

export interface ParsedGrade {
  month: string
  semester: string
  year: string
  criteria: TKGradeCriteria
  tpId?: string
  tpObj?: LearningObjectiveTP
  notes: string
  isMonthly: boolean
  week?: number
  trimester?: number
}

export function parseGradeDescription(rawDescription?: string | null): ParsedGrade {
  if (!rawDescription) {
    return {
      month: 'Juli',
      semester: 'Semester 1',
      year: '2026/2027',
      criteria: 'BSH',
      notes: '',
      isMonthly: true,
    }
  }

  // Monthly format: [Bulan-Semester-Tahun][TP_ID][KRITERIA] Notes
  // Example: [Agustus-Semester 1-2026/2027][TP-01][BSH] Catatan guru
  const monthlyMatch = rawDescription.match(/^\[([^-]+)-([^-]+)-([^\]]+)\]\[([A-Z0-9_-]+)\]\[([A-Z]+)\]\s*(.*)$/)
  if (monthlyMatch) {
    const month = monthlyMatch[1]
    const semester = monthlyMatch[2]
    const year = monthlyMatch[3]
    const tpId = monthlyMatch[4]
    const criteria = (['BB', 'MB', 'BSH', 'BSB'].includes(monthlyMatch[5]) ? monthlyMatch[5] : 'BSH') as TKGradeCriteria
    const notes = monthlyMatch[6] || ''
    const tpObj = ALL_PAUD_TPS.find(t => t.id === tpId)
    return {
      month,
      semester,
      year,
      criteria,
      tpId,
      tpObj,
      notes,
      isMonthly: true,
    }
  }

  // Old weekly format: [M1-TW1-Ganjil-2026/2027][BSH] Notes
  const weeklyMatch = rawDescription.match(/^\[M(\d+)-TW(\d+)-([^-]+)-([^\]]+)\]\[([A-Z]+)\]\s*(.*)$/)
  if (weeklyMatch) {
    const week = parseInt(weeklyMatch[1], 10) || 1
    const trimester = (parseInt(weeklyMatch[2], 10) === 2 ? 2 : 1) as 1 | 2
    const semester = weeklyMatch[3] === 'Genap' ? 'Semester 2' : 'Semester 1'
    const year = weeklyMatch[4]
    const criteria = (['BB', 'MB', 'BSH', 'BSB'].includes(weeklyMatch[5]) ? weeklyMatch[5] : 'BSH') as TKGradeCriteria
    const notes = weeklyMatch[6] || ''
    // Map week to a month
    const month = semester === 'Semester 2' ? 'Januari' : 'Juli'
    return {
      month,
      semester,
      year,
      criteria,
      notes,
      isMonthly: false,
      week,
      trimester,
    }
  }

  // Fallback for simple criteria tag
  const criteriaMatch = rawDescription.match(/\[(BB|MB|BSH|BSB)\]/)
  const criteria = (criteriaMatch ? criteriaMatch[1] : 'BSH') as TKGradeCriteria
  return {
    month: 'Juli',
    semester: 'Semester 1',
    year: '2026/2027',
    criteria,
    notes: rawDescription,
    isMonthly: true,
  }
}
