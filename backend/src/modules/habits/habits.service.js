import { getDb, saveDb } from '../../db/client.js'

function toObj(result) {
  if (!result.length) return []
  const cols = result[0].columns
  return result[0].values.map(r => Object.fromEntries(cols.map((c, i) => [c, r[i]])))
}

export async function getHabits(userId) {
  const db = await getDb()
  return toObj(db.exec(`SELECT * FROM habits WHERE user_id = ${userId} ORDER BY id ASC`))
}

export async function createHabit(userId, { name, color }) {
  const db = await getDb()
  db.run(`INSERT INTO habits (user_id, name, color) VALUES (?, ?, ?)`, [userId, name, color])
  saveDb()
  return toObj(db.exec(`SELECT * FROM habits WHERE user_id = ${userId} ORDER BY id DESC LIMIT 1`))[0]
}

export async function deleteHabit(userId, id) {
  const db = await getDb()
  db.run(`DELETE FROM habit_logs WHERE habit_id = ${id} AND user_id = ${userId}`)
  db.run(`DELETE FROM habits WHERE id = ${id} AND user_id = ${userId}`)
  saveDb()
  return true
}

export async function getLogs(userId, year, month) {
  const db = await getDb()
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return toObj(db.exec(`SELECT * FROM habit_logs WHERE user_id = ${userId} AND date LIKE '${prefix}%'`))
}

export async function toggleLog(userId, habitId, date) {
  const db = await getDb()
  const existing = db.exec(`SELECT id FROM habit_logs WHERE habit_id = ${habitId} AND user_id = ${userId} AND date = '${date}'`)
  if (existing.length) {
    db.run(`DELETE FROM habit_logs WHERE habit_id = ${habitId} AND user_id = ${userId} AND date = '${date}'`)
    saveDb()
    return { checked: false }
  } else {
    db.run(`INSERT INTO habit_logs (habit_id, user_id, date) VALUES (?, ?, ?)`, [habitId, userId, date])
    saveDb()
    return { checked: true }
  }
}
