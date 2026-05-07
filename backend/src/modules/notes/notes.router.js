import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { createNoteSchema, updateNoteSchema } from './notes.schema.js'
import { getNotes, getNote, createNote, updateNote, deleteNote } from './notes.service.js'

const router = Router()

router.get('/', async (req, res) => {
  const notes = await getNotes(req.user.id)
  res.json(notes)
})

router.get('/:id', async (req, res) => {
  const note = await getNote(req.user.id, req.params.id)
  if (!note) return res.status(404).json({ error: 'not found' })
  res.json(note)
})

router.post('/', validate(createNoteSchema), async (req, res) => {
  const note = await createNote(req.user.id, req.body)
  res.status(201).json(note)
})

router.put('/:id', validate(updateNoteSchema), async (req, res) => {
  const note = await updateNote(req.user.id, req.params.id, req.body)
  if (!note) return res.status(404).json({ error: 'not found' })
  res.json(note)
})

router.delete('/:id', async (req, res) => {
  const ok = await deleteNote(req.user.id, req.params.id)
  if (!ok) return res.status(404).json({ error: 'not found' })
  res.json({ deleted: true })
})

export default router
