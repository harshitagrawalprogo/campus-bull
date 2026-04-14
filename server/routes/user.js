import express from 'express'
import { prisma } from '../utils/db.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// All profile routes require auth
router.use(verifyToken)

// GET /api/user/profile — full user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, isPro: true, branch: true, category: true,
        domicile: true, targetYear: true, streak: true,
        testsTaken: true, avgScore: true, bestRank: true,
        createdAt: true
      }
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// PATCH /api/user/profile — update user profile
router.patch('/profile', async (req, res) => {
  try {
    const { name, phone, branch, category, domicile, targetYear } = req.body
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, phone, branch, category, domicile, targetYear: targetYear ? Number(targetYear) : undefined },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, isPro: true, branch: true, category: true,
        domicile: true, targetYear: true, streak: true,
        testsTaken: true, avgScore: true, bestRank: true
      }
    })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// GET /api/user/stats — dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { testsTaken: true, avgScore: true, streak: true, bestRank: true }
    })

    // Count recent attempts (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentAttempts = await prisma.testAttempt.count({
      where: { userId: req.user.userId, createdAt: { gte: weekAgo } }
    })

    res.json({
      testsTaken: user?.testsTaken || 0,
      avgScore: user?.avgScore || 0,
      streak: user?.streak || 0,
      bestRank: user?.bestRank || null,
      weeklyAttempts: recentAttempts
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// GET /api/user/attempts — test history
router.get('/attempts', async (req, res) => {
  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        test: { select: { title: true, type: true, difficulty: true, questions: true } }
      }
    })
    res.json(attempts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch attempts' })
  }
})

export default router
