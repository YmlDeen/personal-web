import { getDb, saveDb } from '../../db/client.js'

function toObj(result) {
  if (!result.length) return []
  const cols = result[0].columns
  return result[0].values.map(r => Object.fromEntries(cols.map((c, i) => [c, r[i]])))
}

function nextDue(due, repeat) {
  const d = due ? new Date(due) : new Date()
  if (repeat === 'daily')   d.setDate(d.getDate() + 1)
  if (repeat === 'weekly')  d.setDate(d.getDate() + 7)
  if (repeat === 'monthly') d.setMonth(d.getMonth() + 1)
  return d.toISOString().split('T')[0]
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

export async function createTask(userId, { title, priority, due_date, repeat }) {
  const db = await getDb()
  db.run(`INSERT INTO tasks (user_id, title, priority, due_date, repeat) VALUES (?, ?, ?, ?, ?)`,
    [userId, title, priority ?? 'medium', due_date ?? null, repeat ?? null])
  saveDb()
  const result = db.exec(`SELECT * FROM tasks WHERE user_id = ${userId} ORDER BY id DESC LIMIT 1`)
  const cols = result[0].columns
  return Object.fromEntries(cols.map((c, i) => [c, result[0].values[0][i]]))
}

export async function updateTask(userId, id, fields) {
  const db = await getDb()
  const task = await getTask(userId, id)
  if (!task) return null
  const title    = fields.title    ?? task.title
  const status   = fields.status   ?? task.status
  const priority = fields.priority ?? task.priority
  const due_date = 'due_date' in fields ? fields.due_date : task.due_date
  const repeat   = 'repeat'   in fields ? fields.repeat   : task.repeat

  db.run(`UPDATE tasks SET title=?, status=?, priority=?, due_date=?, repeat=?, updated_at=datetime('now') WHERE id=? AND user_id=?`,
    [title, status, priority, due_date, repeat, id, userId])

  if (status === 'done' && repeat) {
    db.run(`INSERT INTO tasks (user_id, title, priority, due_date, repeat) VALUES (?, ?, ?, ?, ?)`,
      [userId, title, priority, nextDue(due_date, repeat), repeat])
  }

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
