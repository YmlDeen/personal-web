import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { createTaskSchema, updateTaskSchema } from './tasks.schema.js'
import { getTasks, createTask, updateTask, deleteTask } from './tasks.service.js'

const router = Router()

router.get('/', async (req, res) => {
  res.json(await getTasks(req.user.id))
})

router.post('/', validate(createTaskSchema), async (req, res) => {
  res.status(201).json(await createTask(req.user.id, req.body))
})

router.put('/:id', validate(updateTaskSchema), async (req, res) => {
  const task = await updateTask(req.user.id, req.params.id, req.body)
  if (!task) return res.status(404).json({ error: 'not found' })
  res.json(task)
})

router.delete('/:id', async (req, res) => {
  const ok = await deleteTask(req.user.id, req.params.id)
  if (!ok) return res.status(404).json({ error: 'not found' })
  res.json({ deleted: true })
})

export default router
