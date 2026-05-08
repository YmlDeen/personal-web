import { Router } from 'express'
import { getDb } from '../../db/client.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const db = await getDb()
    const userId = req.user.id
    const today = new Date().toISOString().split('T')[0]
    const yearMonth = today.slice(0, 7)

    const q = (sql, params = []) => {
      const result = db.exec(sql.replace(/\?/g, () => {
        const p = params.shift()
        return typeof p === 'string' ? `'${p}'` : p
      }))
      if (!result.length) return []
      const { columns, values } = result[0]
      return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])))
    }

    const tasks = q(`SELECT title, priority, due_date FROM tasks WHERE user_id = ${userId} AND status != 'done'`)
    const overdue = tasks.filter(t => t.due_date && t.due_date < today)
    const dueToday = tasks.filter(t => t.due_date === today)

    const habits = q(`SELECT id, name FROM habits WHERE user_id = ${userId}`)
    const habitLogs = q(`SELECT habit_id FROM habit_logs WHERE user_id = ${userId} AND date = '${today}'`)
    const doneIds = new Set(habitLogs.map(l => l.habit_id))
    const missedHabits = habits.filter(h => !doneIds.has(h.id)).map(h => h.name)
    const doneCount = habitLogs.length

    const finance = q(`SELECT type, amount, category FROM finance WHERE user_id = ${userId} AND substr(date,1,7) = '${yearMonth}'`)
    const income = finance.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0)
    const expense = finance.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0)

    const notes = q(`SELECT title FROM notes WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 5`).map(n => n.title)

    const snapshot = {
      date: today,
      tasks: {
        overdue: overdue.map(t => t.title),
        dueToday: dueToday.map(t => t.title),
        totalPending: tasks.length
      },
      habits: { missed: missedHabits, doneCount, totalCount: habits.length },
      finance: { income, expense, balance: income - expense },
      recentNotes: notes
    }

    const prompt = `คุณคือ personal intelligence assistant ของผู้ใช้คนนี้ วิเคราะห์ข้อมูลชีวิตด้านล่างแล้วเขียน daily brief เป็นภาษาไทย

กฎ: ไม่เกิน 3 ประโยค ไม่ใช้ bullet point พูดตรงๆ เหมือนเพื่อนฉลาดที่รู้จักเราดี สังเกตุ pattern ที่น่าสนใจ บอกสิ่งที่ต้องทำ NOW และให้กำลังใจ 1 อย่าง

ข้อมูล: ${JSON.stringify(snapshot)}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const aiData = await response.json()
    const brief = aiData.content?.[0]?.text ?? 'ไม่สามารถสร้าง brief ได้'

    res.json({ brief, snapshot, generated_at: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
