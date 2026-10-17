/**
 * Robust date parser supporting:
 * - Standard ISO: 2020-05-14, 2020/05/14
 * - Indonesian / Day-first: 14/05/2020, 14-05-2020, 14.05.2020
 * - 2-digit years: 14/05/20 -> 2020
 * - Indonesian & English month names: "14 Mei 2020", "14-Mei-2020", "14 Agustus 2020", "14 May 2020"
 * - Excel numeric serial dates: 43965 -> May 2020
 */
export function parseDate(dateStr: string | number | Date | undefined | null): Date | null {
  if (!dateStr) return null
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr
  }

  const clean = dateStr.toString().trim()
  if (!clean) return null

  // 1. If standard ISO or YYYY-MM-DD
  if (/^\d{4}[/\-.]\d{1,2}[/\-.]\d{1,2}/.test(clean)) {
    const parts = clean.split(/[/\-.\sT]/)
    const y = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10) - 1
    const d = parseInt(parts[2], 10)
    const dt = new Date(y, m, d)
    if (!isNaN(dt.getTime())) return dt
  }

  // 2. If DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/)
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10)
    const month = parseInt(dmyMatch[2], 10) - 1
    let year = parseInt(dmyMatch[3], 10)
    if (year < 100) year += 2000
    const dt = new Date(year, month, day)
    if (!isNaN(dt.getTime())) return dt
  }

  // 3. Indonesian / English month names e.g. "14 Mei 2020", "14-Mei-2020", "14 Agustus 2020"
  const monthMap: Record<string, number> = {
    jan: 0, januari: 0, january: 0,
    feb: 1, februari: 1, february: 1,
    mar: 2, maret: 2, march: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5, june: 5,
    jul: 6, juli: 6, july: 6,
    agu: 7, agt: 7, agustus: 7, aug: 7, august: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9, oct: 9, october: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, dec: 11, december: 11,
  }

  const textMatch = clean.match(/^(\d{1,2})[\s\-_]+([A-Za-z]+)[\s\-_]+(\d{2,4})/)
  if (textMatch) {
    const day = parseInt(textMatch[1], 10)
    const mKey = textMatch[2].toLowerCase()
    let year = parseInt(textMatch[3], 10)
    if (year < 100) year += 2000
    if (mKey in monthMap) {
      const dt = new Date(year, monthMap[mKey], day)
      if (!isNaN(dt.getTime())) return dt
    }
  }

  // 4. Excel serial date if numeric (e.g. 43965 -> May 2020)
  const num = Number(clean)
  if (!isNaN(num) && num > 25000 && num < 70000) {
    // Excel base date Dec 30 1899
    const dt = new Date(Math.round((num - 25569) * 86400 * 1000))
    if (!isNaN(dt.getTime())) return dt
  }

  // 5. Native JS Date parse fallback
  const fallback = new Date(clean)
  return isNaN(fallback.getTime()) ? null : fallback
}
