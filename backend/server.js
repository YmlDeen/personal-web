import app from './src/app.js'
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 3011
app.listen(PORT, () => console.log(`server running on port ${PORT}`))
