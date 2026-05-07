import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { loginSchema, registerSchema, changePasswordSchema } from './auth.schema.js'
import { login, register, refresh, changePassword } from './auth.service.js'
import { verifyToken } from '../../middleware/auth.js'

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

router.put('/password', verifyToken, validate(changePasswordSchema), async (req, res) => {
  try {
    const result = await changePassword(req.user.id, req.body.currentPassword, req.body.newPassword)
    res.json(result)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

export default router
