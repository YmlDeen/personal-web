import { getDb, saveDb } from '../../db/client.js'

function toObj(result) {
  if (!result.length) return []
  const cols = result[0].columns
  return result[0].values.map(r => Object.fromEntries(cols.map((c, i) => [c, r[i]])))
}

export async function getFinance(userId, year, month) {
  const db = await getDb()
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return toObj(db.exec(`SELECT * FROM finance WHERE user_id = ${userId} AND date LIKE '${prefix}%' ORDER BY date DESC`))
}

export async function createEntry(userId, { type, amount, category, note, date }) {
  const db = await getDb()
  const d = date ?? new Date().toISOString().slice(0, 10)
  db.run(`INSERT INTO finance (user_id, type, amount, category, note, date) VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, type, amount, category, note ?? null, d])
  saveDb()
  return toObj(db.exec(`SELECT * FROM finance WHERE user_id = ${userId} ORDER BY id DESC LIMIT 1`))[0]
}

export async function deleteEntry(userId, id) {
  const db = await getDb()
  db.run(`DELETE FROM finance WHERE id = ${id} AND user_id = ${userId}`)
  saveDb()
  return true
}

export async function getSummary(userId, year, month) {
  const db = await getDb()
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const rows = toObj(db.exec(`SELECT type, SUM(amount) as total FROM finance WHERE user_id = ${userId} AND date LIKE '${prefix}%' GROUP BY type`))
  const income = rows.find(r => r.type === 'income')?.total ?? 0
  const expense = rows.find(r => r.type === 'expense')?.total ?? 0
  return { income, expense, balance: income - expense }
}
