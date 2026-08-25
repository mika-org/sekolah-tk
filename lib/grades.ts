export type TKGradeCriteria = 'BB' | 'MB' | 'BSH' | 'BSB'

export const CRITERIA_MAP: Record<TKGradeCriteria, { label: string; score: number; color: string; bg: string; badge: string; desc: string }> = {
  BB: {
    label: 'BB (Belum Berkembang)',
    score: 1,
    color: '#E11D48',
    bg: '#FFF1F2',
    badge: 'bg-rose-50 text-rose-800 border-rose-200/70 shadow-2xs font-bold rounded-full',
    desc: 'Anak melakukannya harus dengan bimbingan penuh atau dicontohkan oleh guru.',
  },
  MB: {
    label: 'MB (Mulai Berkembang)',
    score: 2,
    color: '#D97706',
    bg: '#FFFBEB',
    badge: 'bg-amber-50 text-amber-800 border-amber-200/70 shadow-2xs font-bold rounded-full',
    desc: 'Anak melakukannya masih harus diingatkan atau dibantu secara berkala oleh guru.',
  },
  BSH: {
    label: 'BSH (Berkembang Sesuai Harapan)',
    score: 3,
    color: '#2563EB',
    bg: '#EFF6FF',
    badge: 'bg-blue-50 text-blue-800 border-blue-200/70 shadow-2xs font-bold rounded-full',
    desc: 'Anak sudah dapat melakukannya secara mandiri dan konsisten tanpa diingatkan.',
  },
  BSB: {
    label: 'BSB (Berkembang Sangat Baik)',
    score: 4,
    color: '#059669',
    bg: '#ECFDF5',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/70 shadow-2xs font-bold rounded-full',
    desc: 'Anak sudah dapat melakukannya secara mandiri dan dapat membantu/menjadi teladan bagi teman.',
  },
}

export const PAUD_SUBJECTS = [
  'Nilai Agama dan Moral (NAM)',
  'Fisik & Motorik (Kasar & Halus)',
  'Kognitif & Logika',
  'Bahasa & Komunikasi',
  'Sosial Emosional & Kemandirian',
  'Seni & Kreativitas',
] as const

export interface SaveGradePayload {
  studentId: string
  subject: string
  criteria: TKGradeCriteria
  week: number
  trimester: 1 | 2
  semester: 'Ganjil' | 'Genap'
  academicYear?: string
  notes?: string
}

export function parseGradeDescription(rawDescription?: string | null) {
  if (!rawDescription) {
    return { week: 1, trimester: 1 as 1 | 2, semester: 'Ganjil' as 'Ganjil' | 'Genap', year: '2026/2027', criteria: 'BSH' as TKGradeCriteria, notes: '' }
  }

  const match = rawDescription.match(/^\[M(\d+)-TW(\d+)-([^-]+)-([^\]]+)\]\[([A-Z]+)\]\s*(.*)$/)
  if (match) {
    const week = parseInt(match[1], 10) || 1
    const trimester = (parseInt(match[2], 10) === 2 ? 2 : 1) as 1 | 2
    const semester = (match[3] === 'Genap' ? 'Genap' : 'Ganjil') as 'Ganjil' | 'Genap'
    const year = match[4]
    const criteria = (['BB', 'MB', 'BSH', 'BSB'].includes(match[5]) ? match[5] : 'BSH') as TKGradeCriteria
    const notes = match[6] || ''
    return { week, trimester, semester, year, criteria, notes }
  }

  // Fallback for simple criteria tag or text
  const criteriaMatch = rawDescription.match(/\[(BB|MB|BSH|BSB)\]/)
  const criteria = (criteriaMatch ? criteriaMatch[1] : 'BSH') as TKGradeCriteria
  return { week: 1, trimester: 1 as 1 | 2, semester: 'Ganjil' as 'Ganjil' | 'Genap', year: '2026/2027', criteria, notes: rawDescription }
}
