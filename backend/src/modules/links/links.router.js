import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { createLinkSchema } from './links.schema.js'
import { getLinks, createLink, updateLink, deleteLink, scrapeMeta } from './links.service.js'

const router = Router()

router.get('/', async (req, res) => {
  res.json(await getLinks(req.user.id))
})

router.post('/scrape', async (req, res) => {
  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'url required' })
  try {
    const meta = await scrapeMeta(url)
    res.json(meta)
  } catch (err) {
    res.status(500).json({ error: 'scrape failed', detail: err.message })
  }
})

router.post('/', validate(createLinkSchema), async (req, res) => {
  res.status(201).json(await createLink(req.user.id, req.body))
})

router.put('/:id', async (req, res) => {
  const updated = await updateLink(req.user.id, req.params.id, req.body)
  if (!updated) return res.status(404).json({ error: 'not found' })
  res.json(updated)
})

router.delete('/:id', async (req, res) => {
  const ok = await deleteLink(req.user.id, req.params.id)
  if (!ok) return res.status(404).json({ error: 'not found' })
  res.json({ deleted: true })
})

export default router
