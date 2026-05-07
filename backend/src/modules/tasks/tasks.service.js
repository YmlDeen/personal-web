import { getDb, saveDb } from '../../db/client.js'

function toObj(result) {
  if (!result.length) return []
  const cols = result[0].columns
  return result[0].values.map(r => Object.fromEntries(cols.map((c, i) => [c, r[i]])))
}

export async function getTasks(userId) {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM tasks WHERE user_id = ${userId} ORDER BY updated_at DESC`)
  return toObj(result)
}

export async function getTask(userId, id) {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM tasks WHERE id = ${id} AND user_id = ${userId}`)
  if (!result.length) return null
  const cols = result[0].columns
  return Object.fromEntries(cols.map((c, i) => [c, result[0].values[0][i]]))
}

export async function createTask(userId, { title, priority, due_date }) {
  const db = await getDb()
  db.run(`INSERT INTO tasks (user_id, title, priority, due_date) VALUES (?, ?, ?, ?)`,
    [userId, title, priority, due_date ?? null])
  saveDb()
  const result = db.exec(`SELECT * FROM tasks WHERE user_id = ${userId} ORDER BY id DESC LIMIT 1`)
  const cols = result[0].columns
  return Object.fromEntries(cols.map((c, i) => [c, result[0].values[0][i]]))
}

export async function updateTask(userId, id, fields) {
  const db = await getDb()
  const task = await getTask(userId, id)
  if (!task) return null
  const title = fields.title ?? task.title
  const status = fields.status ?? task.status
  const priority = fields.priority ?? task.priority
  const due_date = fields.due_date ?? task.due_date
  db.run(`UPDATE tasks SET title=?, status=?, priority=?, due_date=?, updated_at=datetime('now') WHERE id=? AND user_id=?`,
    [title, status, priority, due_date, id, userId])
  saveDb()
  return getTask(userId, id)
}

export async function deleteTask(userId, id) {
  const db = await getDb()
  const task = await getTask(userId, id)
  if (!task) return false
  db.run(`DELETE FROM tasks WHERE id=? AND user_id=?`, [id, userId])
  saveDb()
  return true
}
