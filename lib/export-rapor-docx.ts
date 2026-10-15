import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Packer,
  ShadingType,
} from 'docx'
import { parseGradeDescription, CRITERIA_MAP, type TKGradeCriteria } from '@/lib/grades'

export interface StudentReportData {
  nama: string
  nisn?: string | null
  nik?: string | null
  tempat_lahir?: string | null
  tanggal_lahir?: string | null
  jenis_kelamin?: string | null
  agama?: string | null
  alamat?: string | null
  classes_tk?: {
    nama?: string
    tahun_ajaran?: string
    teachers_tk?: { nama?: string } | null
    teachers2_tk?: { nama?: string } | null
  } | null
  parents_tk?: Array<{
    nama_ayah?: string | null
    nama_ibu?: string | null
    hp?: string | null
    alamat?: string | null
  }> | null
}

export interface GradeLogItem {
  id: string
  subject: string
  description?: string | null
  score?: number | null
}

export async function generateRaporDocxBlob(
  student: StudentReportData,
  grades: GradeLogItem[],
  options?: { semester?: string; academicYear?: string }
): Promise<Blob> {
  const semester = options?.semester || 'Semester 1 (Ganjil)'
  const academicYear = options?.academicYear || student.classes_tk?.tahun_ajaran || '2026/2027'
  const parent = student.parents_tk?.[0]
  const parentName = [parent?.nama_ayah ? `Bpk. ${parent.nama_ayah}` : '', parent?.nama_ibu ? `Ibu ${parent.nama_ibu}` : '']
    .filter(Boolean)
    .join(' / ') || '-'

  const birthInfo = [
    student.tempat_lahir || 'Bandung',
    student.tanggal_lahir
      ? new Date(student.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : '-',
  ].filter((s) => s !== '-').join(', ') || '-'

  const wali1Name = student.classes_tk?.teachers_tk?.nama || 'Ustadzah Khadijah'
  const wali2Name = student.classes_tk?.teachers2_tk?.nama

  // Count criteria
  const counts: Record<TKGradeCriteria, number> = { BB: 0, MB: 0, BSH: 0, BSB: 0 }
  grades.forEach((g) => {
    const parsed = parseGradeDescription(g.description)
    if (parsed.criteria && counts[parsed.criteria] !== undefined) {
      counts[parsed.criteria]++
    }
  })

  // Table styling helpers
  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  }

  const borderThin = {
    top: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
  }

  // 1. Data Diri Murid Table
  const metaRows: TableRow[] = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: borderNone,
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Nama Lengkap Murid  : ', bold: true, size: 20 }),
                new TextRun({ text: student.nama || '-', size: 20, bold: true, color: '07265F' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'NISN / NIK                    : ', bold: true, size: 20 }),
                new TextRun({ text: `${student.nisn || '-'} / ${student.nik || '-'}`, size: 20 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Tempat, Tanggal Lahir: ', bold: true, size: 20 }),
                new TextRun({ text: birthInfo, size: 20 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Jenis Kelamin / Agama: ', bold: true, size: 20 }),
                new TextRun({ text: `${student.jenis_kelamin || '-'} / ${student.agama || 'Islam'}`, size: 20 }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: 50, type: WidthType.PERCENTAGE },
          borders: borderNone,
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Kelompok / Kelas   : ', bold: true, size: 20 }),
                new TextRun({ text: student.classes_tk?.nama || 'TK A', size: 20, bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Tahun Ajaran / Smt : ', bold: true, size: 20 }),
                new TextRun({ text: `${academicYear} • ${semester}`, size: 20 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Nama Orang Tua/Wali: ', bold: true, size: 20 }),
                new TextRun({ text: parentName, size: 20 }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'No. Kontak / Alamat : ', bold: true, size: 20 }),
                new TextRun({ text: `${parent?.hp || '-'} • ${student.alamat || parent?.alamat || 'Kota Bandung'}`, size: 20 }),
              ],
            }),
          ],
        }),
      ],
    }),
  ]

  const identityTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: metaRows,
  })

  // 2. Grades Table
  const gradeHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 6, type: WidthType.PERCENTAGE },
        borders: borderThin,
        shading: { fill: 'EAEFEA', type: ShadingType.CLEAR },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No', bold: true, size: 19 })] })],
      }),
      new TableCell({
        width: { size: 40, type: WidthType.PERCENTAGE },
        borders: borderThin,
        shading: { fill: 'EAEFEA', type: ShadingType.CLEAR },
        children: [new Paragraph({ children: [new TextRun({ text: 'Tujuan Pembelajaran (TP) & Elemen', bold: true, size: 19 })] })],
      }),
      new TableCell({
        width: { size: 14, type: WidthType.PERCENTAGE },
        borders: borderThin,
        shading: { fill: 'EAEFEA', type: ShadingType.CLEAR },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Bulan', bold: true, size: 19 })] })],
      }),
      new TableCell({
        width: { size: 14, type: WidthType.PERCENTAGE },
        borders: borderThin,
        shading: { fill: 'EAEFEA', type: ShadingType.CLEAR },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Capaian', bold: true, size: 19 })] })],
      }),
      new TableCell({
        width: { size: 26, type: WidthType.PERCENTAGE },
        borders: borderThin,
        shading: { fill: 'EAEFEA', type: ShadingType.CLEAR },
        children: [new Paragraph({ children: [new TextRun({ text: 'Deskripsi & Catatan Guru', bold: true, size: 19 })] })],
      }),
    ],
  })

  const gradeRows: TableRow[] = [gradeHeaderRow]

  if (grades.length === 0) {
    gradeRows.push(
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 5,
            borders: borderThin,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Belum ada catatan capaian pembelajaran untuk periode ini.', italics: true, size: 20 })],
              }),
            ],
          }),
        ],
      })
    )
  } else {
    grades.forEach((g, idx) => {
      const parsed = parseGradeDescription(g.description)
      const criteriaInfo = CRITERIA_MAP[parsed.criteria] || { label: 'BSH' }

      gradeRows.push(
        new TableRow({
          children: [
            new TableCell({
              borders: borderThin,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${idx + 1}`, size: 19 })] })],
            }),
            new TableCell({
              borders: borderThin,
              children: [
                new Paragraph({ children: [new TextRun({ text: g.subject || 'Capaian Pembelajaran', bold: true, size: 19 })] }),
                ...(parsed.tpObj?.category
                  ? [new Paragraph({ children: [new TextRun({ text: `Elemen: ${parsed.tpObj.category}`, italics: true, size: 16, color: '555555' })] })]
                  : []),
              ],
            }),
            new TableCell({
              borders: borderThin,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: parsed.month || '-', size: 19, bold: true })] })],
            }),
            new TableCell({
              borders: borderThin,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `${parsed.criteria} (${criteriaInfo.label})`, bold: true, size: 19, color: '07265F' })],
                }),
              ],
            }),
            new TableCell({
              borders: borderThin,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: parsed.notes || 'Ananda berkembang sesuai harapan dalam aspek pembelajaran ini.', size: 18 })],
                }),
              ],
            }),
          ],
        })
      )
    })
  }

  const gradesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: gradeRows,
  })

  // 3. Signature Table (Orang Tua, Kepala Sekolah, Wali Kelas 1 & 2)
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Orang Tua / Wali Murid,', size: 19 })] }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `( ${parentName !== '-' ? parentName : '____________________'} )`, bold: true, size: 19 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Mengetahui,', size: 19 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Kepala KB & TK Istiqamah,', size: 19 })] }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Ustadzah Hj. Nurul Hidayah, S.Pd.I', bold: true, underline: {}, size: 19 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            borders: borderNone,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Bandung, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                    size: 19,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: wali2Name ? 'Dewan Guru / Wali Kelas,' : 'Guru / Wali Kelas,', size: 19 })],
              }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: wali1Name, bold: true, size: 19 }),
                  ...(wali2Name ? [new TextRun({ text: ` & ${wali2Name}`, bold: true, size: 19 })] : []),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })

  // Assemble full Word Document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 in
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: [
          // Kop Surat
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'YAYASAN KARYA PEMBINA DAKWAH / PENDIDIKAN ISLAM ISTIQAMAH',
                bold: true,
                size: 20,
                color: '333333',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'KB & TK ISTIQAMAH BANDUNG',
                bold: true,
                size: 28,
                color: '07265F',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'NPSN: 20255241 • Terakreditasi "A" • Kurikulum Merdeka PAUD',
                italics: true,
                size: 18,
                color: '07A363',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Alamat: Jl. Taman Citarum No. 1, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40115',
                size: 17,
                color: '555555',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Telp: (022) 4241799 / 0811 2198 853 • Email: info@tkistiqamah.sch.id • Website: tkistiqamah.sch.id',
                size: 16,
                color: '666666',
              }),
            ],
          }),
          // Divider Line
          new Paragraph({
            children: [
              new TextRun({
                text: '_________________________________________________________________________________',
                color: '07265F',
                bold: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // Report Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({
                text: 'LAPORAN CAPAIAN PEMBELAJARAN PESERTA DIDIK (RAPOR PAUD)',
                bold: true,
                size: 24,
                color: '07265F',
                underline: {},
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `KURIKULUM MERDEKA • TAHUN AJARAN ${academicYear.toUpperCase()} • ${semester.toUpperCase()}`,
                bold: true,
                size: 19,
                color: '555555',
              }),
            ],
          }),

          // Section A: Data Diri Murid
          new Paragraph({
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({
                text: 'A. DATA DIRI PESERTA DIDIK',
                bold: true,
                size: 21,
                color: '07265F',
              }),
            ],
          }),
          identityTable,

          // Section B: Capaian Pembelajaran
          new Paragraph({
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: 'B. LAPORAN OBSERVASI & CAPAIAN TUJUAN PEMBELAJARAN (TP)',
                bold: true,
                size: 21,
                color: '07265F',
              }),
            ],
          }),
          gradesTable,

          // Section C: Rekapitulasi Capaian
          new Paragraph({
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: 'C. REKAPITULASI CAPAIAN & KRITERIA PENILAIAN',
                bold: true,
                size: 21,
                color: '07265F',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Ringkasan: ${grades.length} TP Dinilai  |  BB: ${counts.BB}  |  MB: ${counts.MB}  |  BSH: ${counts.BSH}  |  BSB: ${counts.BSB}`,
                bold: true,
                size: 19,
                color: '07265F',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• BB (Belum Berkembang)   : ', bold: true, size: 17, color: 'C0392B' }),
              new TextRun({ text: 'Anak melakukannya dengan bimbingan penuh guru.', size: 17 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• MB (Mulai Berkembang)   : ', bold: true, size: 17, color: 'D35400' }),
              new TextRun({ text: 'Sudah mulai mampu namun masih perlu diingatkan berkala.', size: 17 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• BSH (Berkembang Sesuai Harapan): ', bold: true, size: 17, color: '2980B9' }),
              new TextRun({ text: 'Sudah mampu mandiri dan konsisten sesuai tahap perkembangan.', size: 17 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• BSB (Berkembang Sangat Baik)   : ', bold: true, size: 17, color: '27AE60' }),
              new TextRun({ text: 'Sudah mandiri dan mampu menjadi contoh/teladan bagi teman.', size: 17 }),
            ],
            spacing: { after: 280 },
          }),

          // Section D: Pengesahan
          new Paragraph({
            spacing: { before: 100, after: 120 },
            children: [
              new TextRun({
                text: 'D. PENGESAHAN LAPORAN',
                bold: true,
                size: 21,
                color: '07265F',
              }),
            ],
          }),
          signatureTable,
        ],
      },
    ],
  })

  return await Packer.toBlob(doc)
}

export function downloadBlobAsFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
