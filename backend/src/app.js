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
app.use(cors({ origin: ['https://ymldeen.duckdns.org:8443', 'http://localhost:5173'] }))
app.use(express.json())

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, message: { error: 'too many attempts' } })

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', loginLimiter, authRouter)
app.use('/api/notes', verifyToken, notesRouter)
app.use('/api/tasks', verifyToken, tasksRouter)
app.use('/api/links', verifyToken, linksRouter)
app.use('/api/logs', verifyToken, logsRouter)
app.use('/api/habits', verifyToken, habitsRouter)
app.use('/api/finance', verifyToken, financeRouter)

const dist = join(__dirname, '../../dist')
app.use(express.static(dist))
app.get('/{*path}', (req, res) => res.sendFile(join(dist, 'index.html')))

export default app
