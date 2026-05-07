import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { createFinanceSchema } from './finance.schema.js'
import { getFinance, createEntry, deleteEntry, getSummary } from './finance.service.js'

const router = Router()

router.get('/', async (req, res) => {
  const { year, month } = req.query
  const now = new Date()
  res.json(await getFinance(req.user.id, year ?? now.getFullYear(), month ?? now.getMonth() + 1))
})

router.get('/summary', async (req, res) => {
  const { year, month } = req.query
  const now = new Date()
  res.json(await getSummary(req.user.id, year ?? now.getFullYear(), month ?? now.getMonth() + 1))
})

router.post('/', validate(createFinanceSchema), async (req, res) => {
  res.status(201).json(await createEntry(req.user.id, req.body))
})

router.delete('/:id', async (req, res) => {
  await deleteEntry(req.user.id, req.params.id)
  res.json({ deleted: true })
})

export default router
