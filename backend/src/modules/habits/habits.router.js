import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { createHabitSchema, logHabitSchema } from './habits.schema.js'
import { getHabits, createHabit, deleteHabit, getLogs, toggleLog } from './habits.service.js'

const router = Router()

router.get('/', async (req, res) => {
  res.json(await getHabits(req.user.id))
})

router.post('/', validate(createHabitSchema), async (req, res) => {
  res.status(201).json(await createHabit(req.user.id, req.body))
})

router.delete('/:id', async (req, res) => {
  await deleteHabit(req.user.id, req.params.id)
  res.json({ deleted: true })
})

router.get('/logs', async (req, res) => {
  const { year, month } = req.query
  res.json(await getLogs(req.user.id, year, month))
})

router.post('/:id/log', validate(logHabitSchema), async (req, res) => {
  res.json(await toggleLog(req.user.id, req.params.id, req.body.date))
})

export default router
