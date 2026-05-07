import { getDb, saveDb } from '../../db/client.js'

export async function getNotes(userId) {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM notes WHERE user_id = ${userId} ORDER BY updated_at DESC`)
  if (!result.length) return []
  const [cols, ...rows] = [result[0].columns, ...result[0].values]
  return rows.map(r => Object.fromEntries(cols.map((c, i) => [c, r[i]])))
}

export async function getNote(userId, id) {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM notes WHERE id = ${id} AND user_id = ${userId}`)
  if (!result.length) return null
  const cols = result[0].columns
  const row = result[0].values[0]
  return Object.fromEntries(cols.map((c, i) => [c, row[i]]))
}

export async function createNote(userId, { title, content, tags }) {
  const db = await getDb()
  db.run(`INSERT INTO notes (user_id, title, content, tags) VALUES (?, ?, ?, ?)`,
    [userId, title, content, JSON.stringify(tags)])
  saveDb()
  const result = db.exec(`SELECT * FROM notes WHERE user_id = ${userId} ORDER BY id DESC LIMIT 1`)
  const cols = result[0].columns
  return Object.fromEntries(cols.map((c, i) => [c, result[0].values[0][i]]))
}

export async function updateNote(userId, id, fields) {
  const db = await getDb()
  const note = await getNote(userId, id)
  if (!note) return null
  const title = fields.title ?? note.title
  const content = fields.content ?? note.content
  const tags = fields.tags ? JSON.stringify(fields.tags) : note.tags
  db.run(`UPDATE notes SET title=?, content=?, tags=?, updated_at=datetime('now') WHERE id=? AND user_id=?`,
    [title, content, tags, id, userId])
  saveDb()
  return getNote(userId, id)
}

export async function deleteNote(userId, id) {
  const db = await getDb()
  const note = await getNote(userId, id)
  if (!note) return false
  db.run(`DELETE FROM notes WHERE id=? AND user_id=?`, [id, userId])
  saveDb()
  return true
}
