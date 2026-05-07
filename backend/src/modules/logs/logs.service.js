import { getDb, saveDb } from '../../db/client.js'

export async function getLogs(userId) {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM logs WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 100`)
  if (!result.length) return []
  const cols = result[0].columns
  return result[0].values.map(r => Object.fromEntries(cols.map((c, i) => [c, r[i]])))
}

export async function appendLog(userId, action, detail = '') {
  const db = await getDb()
  db.run(`INSERT INTO logs (user_id, action, detail) VALUES (?, ?, ?)`, [userId, action, detail])
  saveDb()
}
