// Helper untuk mengekstrak Topik Pembelajaran dan Keterangan dari deskripsi materi belajar
export function parseMaterialContent(rawDescription?: string | null) {
  if (!rawDescription) return { topic: '', description: '' }
  const match = rawDescription.match(/^\[Topik:\s*([^\]]+)\]\s*([\s\S]*)$/)
  if (match) {
    return {
      topic: match[1].trim(),
      description: match[2].trim(),
    }
  }
  return {
    topic: '',
    description: rawDescription.trim(),
  }
}
