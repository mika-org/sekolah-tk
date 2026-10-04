export interface FacilityItem {
  id: string
  title: string
  category: 'kelas' | 'bermain' | 'literasi' | 'ibadah' | 'lingkungan'
  categoryLabel: string
  desc: string
  fullDesc: string
  image: string
  features: string[]
  badge?: string
}

export const FACILITIES: FacilityItem[] = [
  {
    id: 'ruang-belajar-tematik',
    title: 'Ruang Belajar Tematik',
    category: 'kelas',
    categoryLabel: 'Ruang Belajar & Sentra',
    desc: 'Ruang kelas ber-AC yang ceria, nyaman, dan mendukung aktivitas belajar aktif serta menyenangkan.',
    fullDesc: 'Setiap ruang kelas didesain dengan warna-warna ceria dan pencahayaan alami yang optimal. Dilengkapi pendingin ruangan (AC), karpet bersih, meja kursi ergonomis ramah anak, serta sudut-sudut sentra tematik (Sentra Bahan Alam, Sentra Balok, Sentra Imtaq, dan Sentra Seni).',
    image: '/images/fasilitas/1.webp',
    features: ['Ruang Ber-AC & Bersirkulasi Sehat', 'Meja & Kursi Ergonomis Anak', 'Sentra Belajar Tematik Terpadu', 'Peralatan Edukatif Berstandar SNI'],
    badge: 'Unggulan'
  },
  {
    id: 'ruang-bermain-indoor',
    title: 'Ruang Bermain Indoor',
    category: 'bermain',
    categoryLabel: 'Bermain & Motorik',
    desc: 'Area bermain indoor dengan mandi bola, perosotan, dan aneka rintangan aman untuk motorik anak.',
    fullDesc: 'Fasilitas bermain dalam ruangan yang aman dari cuaca luar. Dilengkapi wahana perosotan lembut, kolam bola higienis, terowongan merayap, serta matras busa tebal untuk menstimulasi perkembangan motorik kasar anak secara aman dan menyenangkan.',
    image: '/images/fasilitas/6.webp',
    features: ['Kolam Mandi Bola Higienis', 'Perosotan & Rintangan Lembut', 'Lantai Matras Busa Aman', 'Pengawasan Guru Pendamping'],
    badge: 'Favorit Anak'
  },
  {
    id: 'perpustakaan-reading-corner',
    title: 'Perpustakaan & Reading Corner',
    category: 'literasi',
    categoryLabel: 'Literasi & Edukasi',
    desc: 'Ruang literasi yang nyaman untuk menumbuhkan kecintaan anak terhadap buku dan kegiatan membaca.',
    fullDesc: 'Sudut literasi ramah anak dengan koleksi ratusan buku cerita bergambar Islami, ensiklopedia cilik, dongeng fabel edukatif, dan buku pop-up menarik. Dirancang dengan bantal duduk empuk untuk sesi membaca nyaring (read aloud) bersama guru.',
    image: '/images/fasilitas/7.webp',
    features: ['Ratusan Buku Bergambar Islami', 'Area Duduk Karpet & Bantal Empuk', 'Program Rutin Read-Aloud', 'Suasana Tenang & Menyenangkan'],
  },
  {
    id: 'ruang-multimedia-aktivitas',
    title: 'Ruang Multimedia & Aktivitas',
    category: 'literasi',
    categoryLabel: 'Literasi & Edukasi',
    desc: 'Fasilitas pembelajaran interaktif dengan smart screen digital untuk memperkaya wawasan anak.',
    fullDesc: 'Fasilitas audio-visual modern untuk mendukung kegiatan belajar interaktif, pemutaran video kisah para Nabi, murottal Al-Qur\'an, senam irama ceria, serta pengenalan teknologi dasar yang ramah anak dan terawasi.',
    image: '/images/fasilitas/8.webp',
    features: ['Smart Screen & Proyektor Digital', 'Sound System Berkualitas Ramah Anak', 'Konten Animasi Islami & Edukatif', 'Pengawasan Screen-Time Ketat'],
  },
  {
    id: 'playground-semi-outdoor',
    title: 'Playground Semi-Outdoor',
    category: 'bermain',
    categoryLabel: 'Bermain & Motorik',
    desc: 'Area bermain berkanopi pelindung dengan wahana rumah bermain dan seluncuran ramah anak.',
    fullDesc: 'Area bermain luas terlindung dari terik matahari dan hujan berkat kanopi pelindung. Menyediakan aneka wahana perosotan, jembatan gantung mini, tangga ketangkasan, dan ayunan yang kokoh serta terawat berkala.',
    image: '/images/fasilitas/4.webp',
    features: ['Atap Kanopi Pelindung Cuaca', 'Rumah Bermain & Seluncuran', 'Melatih Keseimbangan & Keberanian', 'Pemeriksaan Keselamatan Rutin'],
    badge: 'Populer'
  },
  {
    id: 'taman-bermain-outdoor',
    title: 'Taman Bermain Outdoor',
    category: 'bermain',
    categoryLabel: 'Bermain & Motorik',
    desc: 'Area bermain terbuka yang luas dan asri untuk melatih motorik kasar, ketangkasan, dan keberanian.',
    fullDesc: 'Halaman terbuka berudara segar dikelilingi pepohonan rindang. Wahana bermain luar ruang ini dirancang khusus untuk melatih motorik kasar, kelincahan, sportivitas, dan interaksi sosial dengan teman sebaya.',
    image: '/images/fasilitas/5.webp',
    features: ['Udara Segar & Sinar Matahari Pagi', 'Wahana Ketangkasan Fisik', 'Area Luas & Rindang Pepohonan', 'Pelindung Sudut Tumpul Aman'],
  },
  {
    id: 'area-wudhu-selasar-bersih',
    title: 'Area Wudhu & Selasar Bersih',
    category: 'ibadah',
    categoryLabel: 'Ibadah & Karakter',
    desc: 'Fasilitas tempat wudhu khusus anak yang aman dan higienis untuk pembiasaan ibadah sejak dini.',
    fullDesc: 'Tempat wudhu yang didesain khusus setinggi anak-anak usia dini dengan kran air mudah dijangkau, lantai anti-slip, dan drainase cepat kering. Tempat ini menjadi sarana pembiasaan adab berwudhu dan persiapan shalat dhuha berjamaah.',
    image: '/images/fasilitas/2.webp',
    features: ['Tinggi Kran Khusus Anak Usia Dini', 'Lantai Anti-Selip & Higienis', 'Pembiasaan Adab Bersuci Sejak Dini', 'Dekat Ruang Praktik Shalat'],
    badge: 'Islami'
  },
  {
    id: 'playground-rumput-sintetis',
    title: 'Playground Rumput Sintetis',
    category: 'lingkungan',
    categoryLabel: 'Lingkungan & Outdoor',
    desc: 'Area bermain mini outdoor berlapis rumput sintetis higienis yang aman untuk anak beraktivitas.',
    fullDesc: 'Lantai rumput sintetis lembut dan tebal yang bebas dari debu tanah dan genangan air. Sangat nyaman untuk aktivitas senam pagi, permainan lingkaran (circle time luar ruang), serta stimulasi sensori berjalan tanpa alas kaki.',
    image: '/images/fasilitas/3.webp',
    features: ['Rumput Sintetis Premium & Lembut', 'Bebas Debu & Mudah Dibersihkan', 'Aman Untuk Merangkak & Berguling', 'Cocok Untuk Senam Pagi & Circle Time'],
  },
  {
    id: 'lingkungan-sekolah-asri-aman',
    title: 'Lingkungan Sekolah Asri & Aman',
    category: 'lingkungan',
    categoryLabel: 'Lingkungan & Outdoor',
    desc: 'Halaman sekolah terbuka yang teduh, tertata asri, berpagar aman, dan nyaman bagi anak.',
    fullDesc: 'Berada di kawasan Jl. Taman Citarum Bandung yang tenang, sejuk, dan strategis. Dilengkapi gerbang keamanan satu pintu (*one-gate system*), pos satpam siaga, serta pengawasan CCTV untuk menjamin keselamatan putra-putri tercinta selama bersekolah.',
    image: '/images/fasilitas/10.webp',
    features: ['Sistem Satu Pintu (One Gate System)', 'Petugas Keamanan Siaga Penuh', 'Kawasan Tenang & Udara Bersih', 'Akses Penjemputan Tertib'],
    badge: 'Keamanan 24/7'
  }
]
