import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import userRoutes from './routes/user.js'
import testRoutes from './routes/tests.js'
import predictRoutes from './routes/predict.js'
import qaRoutes from './routes/qa.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/user', userRoutes)
app.use('/api/tests', testRoutes)
app.use('/api/predict', predictRoutes)
app.use('/api/qa', qaRoutes)

// Default root response
app.get('/api', (req, res) => {
  res.json({ message: 'Campus Bull API is running' })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
})