import { Client } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  // 1. Add created_at column if not exists
  await client.query('ALTER TABLE payments_tk ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();')
  console.log('Added created_at column successfully.')

  // 2. Populate created_at from proof timestamp
  const { rows } = await client.query('SELECT id, proof FROM payments_tk')
  for (const r of rows) {
    if (r.proof) {
      const m = r.proof.match(/proof_(\d+)/)
      if (m && m[1]) {
        const ts = parseInt(m[1], 10)
        if (!isNaN(ts)) {
          const date = new Date(ts)
          await client.query('UPDATE payments_tk SET created_at = $1 WHERE id = $2', [date, r.id])
          console.log(`Updated ${r.id} -> ${date.toISOString()}`)
        }
      }
    }
  }

  // 3. Consolidate UCUP payments so only the latest record is kept
  const delRes = await client.query(
    "DELETE FROM payments_tk WHERE ppdb_id = 'e6ea8ef0-59df-49b4-a808-77805244c647' AND id != 'ca32f0d1-ee1f-45f6-875a-a343c065d140'"
  )
  console.log(`Removed ${delRes.rowCount} duplicate older payment records for UCUP.`)

  await client.end()
}

main().catch(console.error)
