import app from './src/app.js'
import { getDb } from './src/db/client.js'
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 3011

getDb().then(() => {
  app.listen(PORT, () => console.log(`server running on port ${PORT}`))
}).catch(err => {
  console.error('db init failed:', err)
  process.exit(1)
})
