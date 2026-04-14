import express from 'express'
import { prisma } from '../utils/db.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// GET /api/tests — list all active tests (public)
router.get('/', async (req, res) => {
  try {
    const { type, search } = req.query
    const where = { isActive: true }
    if (type && type !== 'All') where.type = type
    if (search) where.title = { contains: search, mode: 'insensitive' }

    const tests = await prisma.mockTest.findMany({
      where,
      orderBy: { attempts: 'desc' }
    })
    res.json(tests)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch tests' })
  }
})

// GET /api/tests/:id — single test details (public)
router.get('/:id', async (req, res) => {
  try {
    const test = await prisma.mockTest.findUnique({ where: { id: req.params.id } })
    if (!test) return res.status(404).json({ error: 'Test not found' })
    res.json(test)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test' })
  }
})

// POST /api/tests/:id/attempt — save a test result (requires auth)
router.post('/:id/attempt', verifyToken, async (req, res) => {
  try {
    const { score, totalMarks, timeTaken, answers } = req.body
    const testId = req.params.id
    const userId = req.user.userId

    // Save attempt
    const attempt = await prisma.testAttempt.create({
      data: { userId, testId, score, totalMarks, timeTaken, answers: answers || {} }
    })

    // Recompute user stats
    const allAttempts = await prisma.testAttempt.findMany({
      where: { userId },
      select: { score: true, totalMarks: true }
    })

    const testsTaken = allAttempts.length
    const avgScore = allAttempts.length > 0
      ? allAttempts.reduce((sum, a) => sum + (a.score / a.totalMarks) * 100, 0) / allAttempts.length
      : 0

    // Update test attempt count
    await prisma.mockTest.update({
      where: { id: testId },
      data: { attempts: { increment: 1 } }
    })

    // Update user stats
    await prisma.user.update({
      where: { id: userId },
      data: { testsTaken, avgScore: Math.round(avgScore * 10) / 10 }
    })

    res.status(201).json({ attempt, message: 'Result saved!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save attempt' })
  }
})

export default router
