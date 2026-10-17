/**
 * Class Matching Utility
 * Smart matching for student KLP (Kelompok) to registered classes.
 */

export function findMatchingClass(
  rawKlp: string,
  classes: { id: string; nama: string }[]
): { id: string; nama: string } | null {
  if (!rawKlp || !rawKlp.trim()) return null
  const clean = rawKlp.trim()
  const lower = clean.toLowerCase()
  const norm = lower.replace(/[\s_\-/.]/g, '')

  // 1. Exact match (case-insensitive)
  const exact = classes.find((c) => c.nama.trim().toLowerCase() === lower)
  if (exact) return exact

  // 2. Normalized match (e.g. 'tka' === 'tka', 'tk-a' === 'tka')
  const normMatch = classes.find(
    (c) => c.nama.toLowerCase().replace(/[\s_\-/.]/g, '') === norm
  )
  if (normMatch) return normMatch

  // 3. Partial match (case-insensitive substring)
  const partial = classes.find((c) => {
    const cLower = c.nama.trim().toLowerCase()
    return cLower.includes(lower) || lower.includes(cLower)
  })
  if (partial) return partial

  return null
}
