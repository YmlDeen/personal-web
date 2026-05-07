import { getDb, saveDb } from '../../db/client.js'

export async function getLinks(userId) {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM links WHERE user_id = ${userId} ORDER BY created_at DESC`)
  if (!result.length) return []
  const cols = result[0].columns
  return result[0].values.map(r => Object.fromEntries(cols.map((c, i) => [c, r[i]])))
}

export async function createLink(userId, { title, url, tags }) {
  const db = await getDb()
  db.run(`INSERT INTO links (user_id, title, url, tags) VALUES (?, ?, ?, ?)`,
    [userId, title, url, JSON.stringify(tags)])
  saveDb()
  const result = db.exec(`SELECT * FROM links WHERE user_id = ${userId} ORDER BY id DESC LIMIT 1`)
  const cols = result[0].columns
  return Object.fromEntries(cols.map((c, i) => [c, result[0].values[0][i]]))
}

export async function deleteLink(userId, id) {
  const db = await getDb()
  const result = db.exec(`SELECT id FROM links WHERE id = ${id} AND user_id = ${userId}`)
  if (!result.length) return false
  db.run(`DELETE FROM links WHERE id=? AND user_id=?`, [id, userId])
  saveDb()
  return true
}
