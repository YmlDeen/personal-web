import { Router } from 'express'
import { getLogs, appendLog } from './logs.service.js'

const router = Router()

router.get('/', async (req, res) => {
  res.json(await getLogs(req.user.id))
})

router.post('/', async (req, res) => {
  const { action, detail } = req.body
  if (!action) return res.status(400).json({ error: 'action required' })
  await appendLog(req.user.id, action, detail)
  res.status(201).json({ logged: true })
})

export default router
