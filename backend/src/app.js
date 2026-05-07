import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
dotenv.config()

import authRouter from './modules/auth/auth.router.js'
import notesRouter from './modules/notes/notes.router.js'
import tasksRouter from './modules/tasks/tasks.router.js'
import linksRouter from './modules/links/links.router.js'
import logsRouter from './modules/logs/logs.router.js'
import habitsRouter from './modules/habits/habits.router.js'
import financeRouter from './modules/finance/finance.router.js'
import { verifyToken } from './middleware/auth.js'

const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: ['http://54.179.174.46:3011'] }))
app.use(express.json())

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { error: 'too many attempts' } })

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/auth', loginLimiter, authRouter)
app.use('/notes', verifyToken, notesRouter)
app.use('/tasks', verifyToken, tasksRouter)
app.use('/links', verifyToken, linksRouter)
app.use('/logs', verifyToken, logsRouter)
app.use('/habits', verifyToken, habitsRouter)
app.use('/finance', verifyToken, financeRouter)

const dist = join(__dirname, '../../dist')
app.use(express.static(dist))
app.get('/{*path}', (req, res) => res.sendFile(join(dist, 'index.html')))

export default app
