import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { createLinkSchema } from './links.schema.js'
import { getLinks, createLink, deleteLink } from './links.service.js'

const router = Router()

router.get('/', async (req, res) => {
  res.json(await getLinks(req.user.id))
})

router.post('/', validate(createLinkSchema), async (req, res) => {
  res.status(201).json(await createLink(req.user.id, req.body))
})

router.delete('/:id', async (req, res) => {
  const ok = await deleteLink(req.user.id, req.params.id)
  if (!ok) return res.status(404).json({ error: 'not found' })
  res.json({ deleted: true })
})

export default router
