import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { loginSchema, registerSchema } from './auth.schema.js'
import { login, register, refresh } from './auth.service.js'

const router = Router()

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const tokens = await register(req.body.username, req.body.password)
    res.json(tokens)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const tokens = await login(req.body.username, req.body.password)
    res.json(tokens)
  } catch (e) {
    res.status(401).json({ error: e.message })
  }
})

router.post('/refresh', (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'token required' })
    const result = refresh(token)
    res.json(result)
  } catch (e) {
    res.status(401).json({ error: e.message })
  }
})

export default router
