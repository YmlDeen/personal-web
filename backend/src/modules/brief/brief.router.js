import { Router } from 'express'
import { getDb } from '../../db/client.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const db = await getDb()
    const userId = req.user.id
    const today = new Date().toISOString().split('T')[0]
    const yearMonth = today.slice(0, 7)

    const q = (sql) => {
      const result = db.exec(sql)
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
    const finance = q(`SELECT type, amount FROM finance WHERE user_id = ${userId} AND substr(date,1,7) = '${yearMonth}'`)
    const income = finance.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0)
    const expense = finance.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0)
    const notes = q(`SELECT title FROM notes WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 5`).map(n => n.title)

    const snapshot = {
      date: today,
      tasks: { overdue: overdue.map(t => t.title), dueToday: dueToday.map(t => t.title), totalPending: tasks.length },
      habits: { missed: missedHabits, doneCount: habitLogs.length, totalCount: habits.length },
      finance: { income, expense, balance: income - expense },
      recentNotes: notes
    }

    const prompt = `คุณคือ personal intelligence assistant เขียน daily brief เป็นภาษาไทย

ใช้ format นี้เป๊ะๆ:

✦ DAILY BRIEF · {DATE}
─────────────────────────────

TASKS
{แต่ละ task ขึ้นบรรทัดใหม่ format: ├─ ⚠ title [OVERDUE] หรือ └─ ○ title [PENDING]}

FINANCE · {เดือน ปี}
  └─ Balance ฿{balance}  ·  Today ฿{today_expense}



─────────────────────────────
▸ {2-3 ประโยค วิเคราะห์ตรงๆ บอกสิ่งที่ต้องทำ NOW และให้กำลังใจ 1 อย่าง ห้ามใช้ bullet}

ข้อมูล: ${JSON.stringify(snapshot)}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 250,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const aiData = await response.json()
    const rawBrief = aiData.choices?.[0]?.message?.content ?? 'ไม่สามารถสร้าง brief ได้'

    res.json({ brief: rawBrief, snapshot, generated_at: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
