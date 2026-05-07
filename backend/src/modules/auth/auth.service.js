import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDb, saveDb } from '../../db/client.js'

function issueTokens(userId) {
  const access = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' })
  const refresh = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
  return { access, refresh }
}

export async function register(username, password) {
  const db = await getDb()
  const existing = db.exec(`SELECT id FROM users WHERE username = '${username}'`)
  if (existing.length > 0) throw new Error('username taken')
  const hash = await bcrypt.hash(password, 10)
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash])
  saveDb()
  const row = db.exec(`SELECT id FROM users WHERE username = '${username}'`)
  const userId = row[0].values[0][0]
  return issueTokens(userId)
}

export async function login(username, password) {
  const db = await getDb()
  const result = db.exec(`SELECT id, password FROM users WHERE username = '${username}'`)
  if (result.length === 0) throw new Error('invalid credentials')
  const [userId, hash] = result[0].values[0]
  const ok = await bcrypt.compare(password, hash)
  if (!ok) throw new Error('invalid credentials')
  return issueTokens(userId)
}

export function refresh(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const access = jwt.sign({ id: payload.id }, process.env.JWT_SECRET, { expiresIn: '15m' })
    return { access }
  } catch {
    throw new Error('invalid refresh token')
  }
}

export async function changePassword(userId, currentPassword, newPassword) {
  const db = await getDb()
  const result = db.exec(`SELECT password FROM users WHERE id = ${userId}`)
  if (result.length === 0) throw new Error('user not found')
  const hash = result[0].values[0][0]
  const ok = await bcrypt.compare(currentPassword, hash)
  if (!ok) throw new Error('invalid credentials')
  const newHash = await bcrypt.hash(newPassword, 10)
  db.run(`UPDATE users SET password = ? WHERE id = ${userId}`, [newHash])
  saveDb()
  return { message: 'password changed' }
}
