export interface ProgramItem {
  id: string
  title: string
  category?: string
  desc: string
  longDesc?: string
  image: string
  layout?: 'text-top' | 'image-top'
  badge?: string
  published?: boolean
}

export const DEFAULT_PROGRAMS: ProgramItem[] = [
  {
    id: 'tilawati',
    title: "Al-Qur'an Metode Tilawati",
    category: 'Al-Qur\'an & Karakter',
    desc: "Mengenalkan dan menumbuhkan kecintaan anak terhadap Al-Qur'an melalui pembelajaran yang menyenangkan dan sesuai tahap perkembangan.",
    longDesc: "Program Al-Qur'an dengan metode Tilawati bernada Rost yang ceria, melatih makharijul huruf, hafalan surat-surat pendek Juz 30, serta doa harian sejak usia dini secara berkesinambungan.",
    image: "/images/program_unggulan/Al-Qur'an Metode Tilawati.webp",
    layout: 'text-top',
    badge: 'Unggulan',
    published: true,
  },
  {
    id: 'quran-camp',
    title: "Qur'an Camp",
    category: 'Kemandirian & Ibadah',
    desc: "Pengalaman belajar Islami yang memadukan kegiatan Al-Qur'an, ibadah, kemandirian, kebersamaan, dan aktivitas menyenangkan.",
    longDesc: "Agenda tahunan perkemahan santri cilik untuk melatih kemandirian tanpa orang tua, pembiasaan shalat berjamaah, tahsin Al-Qur'an di alam terbuka, dan kebersamaan ukhuwah.",
    image: "/images/program_unggulan/Qur'an Camp.webp",
    layout: 'image-top',
    badge: 'Favorit',
    published: true,
  },
  {
    id: 'outbound',
    title: "Outbound Ceria",
    category: 'Motorik & Ketangkasan',
    desc: "Aktivitas luar ruang yang melatih keberanian, kemandirian, kerja sama, serta kemampuan motorik anak melalui berbagai tantangan yang menyenangkan.",
    longDesc: "Kegiatan motorik kasar di wahana outbound anak yang aman, mencakup flying fox mini, titian tali keseimbangan, jaring laba-laba, dan games kekompakan kelompok.",
    image: "/images/program_unggulan/Outbound.webp",
    layout: 'text-top',
    published: true,
  },
  {
    id: 'outing-class',
    title: "Outing Class",
    category: 'Eksplorasi Edukasi',
    desc: "Menghadirkan pengalaman belajar langsung melalui eksplorasi lingkungan dan kunjungan edukatif yang sesuai dengan tema pembelajaran.",
    longDesc: "Kunjungan edukatif tematik ke berbagai tempat bermakna seperti kebun binatang, balai pemadam kebakaran, museum sains, stasiun kereta, dan sentra pertanian organik.",
    image: "/images/program_unggulan/Outing Class.webp",
    layout: 'image-top',
    published: true,
  },
  {
    id: 'pentas-seni',
    title: "Pentas Seni & Mini Assembly",
    category: 'Kreativitas & Percaya Diri',
    desc: "Wadah bagi anak untuk mengekspresikan diri, mengembangkan kreativitas, kepercayaan diri, serta keberanian tampil di depan publik.",
    longDesc: "Panggung apresiasi kreasi santri cilik mulai dari drama musikal Islami, hafalan surat pendek, tari daerah ramah anak, hingga peragaan busana kreasi daur ulang.",
    image: "/images/program_unggulan/Pentas Seni dan Mini Asembly.webp",
    layout: 'text-top',
    published: true,
  },
  {
    id: 'family-day',
    title: "Family Day",
    category: 'Sinergi Keluarga & Sekolah',
    desc: "Membangun kebersamaan dan kolaborasi sekolah dengan keluarga melalui pengalaman bermain dan belajar yang melibatkan anak bersama orang tua.",
    longDesc: "Agenda spesial 'Family Day: Grow with Love' yang mempertemukan seluruh keluarga besar KB & TK Istiqamah dalam aneka permainan edukatif, lomba kekompakan ayah-bunda-anak, pentas ekspresi keluarga, dan kebersamaan hangat.",
    image: "/images/program_unggulan/family-day.jpg",
    layout: 'image-top',
    badge: 'Program Baru',
    published: true,
  },
  {
    id: 'takhosus-tahfidz',
    title: "Takhosus Tahfidz",
    category: 'Al-Qur\'an Intensif',
    desc: "Program pendampingan khusus hafalan Al-Qur’an untuk mengoptimalkan capaian perkembangan dan kompetensi anak secara terarah.",
    longDesc: "Bimbingan tahfidz intensif bagi santri yang memiliki potensi dan minat khusus dalam menghafal Al-Qur'an, dengan bimbingan asatidz bersanad dan metode mutqin.",
    image: "/images/gallery/8.jpg",
    layout: 'text-top',
    published: true,
  },
  {
    id: 'wisuda-tahfidz',
    title: "Wisuda Tahfidz",
    category: 'Apresiasi Capaian Qur\'an',
    desc: "Momen apresiasi atas perjalanan anak dalam menghafal Al-Qur'an sekaligus menumbuhkan rasa cinta dan bangga terhadap proses belajarnya.",
    longDesc: "Prosesi khidmat wisuda dan pemberian selempang hafizh cilik untuk merayakan keberhasilan santri menyelesaikan target hafalan surat-surat Juz 30.",
    image: "/images/program_unggulan/Wisuda Tahfidz.webp",
    layout: 'image-top',
    badge: 'Prestasi',
    published: true,
  },
  {
    id: 'khotmul-quran',
    title: "Khotmul Qur'an",
    category: 'Tasyakuran Khatam Qur\'an',
    desc: "Perayaan dan tasyakuran kelulusan khatam Al-Qur'an bagi santri cilik sebagai bentuk apresiasi atas ketekunan dalam belajar membaca Al-Qur'an.",
    longDesc: "Uji publik dan tasyakuran kelulusan membaca Al-Qur'an metode Tilawati di hadapan orang tua dan para penguji munaqasyah.",
    image: "/images/program_unggulan/khotmul quran.webp",
    layout: 'text-top',
    published: true,
  },
  {
    id: 'ppmb',
    title: "PPMB (Pengembangan Minat & Bakat)",
    category: 'Bakat & Minat Anak',
    desc: "Wadah eksplorasi dan stimulasi potensi keunikan setiap anak di berbagai bidang minat dan bakat sejak usia dini secara menyenangkan dan terarah.",
    longDesc: "Program stimulasi multi-kecerdasan yang memfasilitasi ragam potensi anak, mulai dari seni lukis, robotic cilik, sains eksperimen, taekwondo cilik, hingga vokal Islami.",
    image: "/images/program_unggulan/PPMB.webp",
    layout: 'image-top',
    published: true,
  },
]
