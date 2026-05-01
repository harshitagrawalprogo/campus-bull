import express from 'express'
import { prisma } from '../utils/db.js'
import { verifyToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// All routes in this file require both authentication and ADMIN role
router.use(verifyToken)
router.use(requireAdmin)

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isPro: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Update user details (e.g., promote to Admin, make Pro)
router.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { role, isPro } = req.body

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role, isPro },
      select: { id: true, name: true, email: true, role: true, isPro: true }
    })
    res.json(updatedUser)
  } catch (err) {
    if (err.code === 'P2025') {
       return res.status(404).json({ error: 'User not found' })
    }
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Prevent admin from deleting themselves (basic safety)
    if (id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' })
    }

    await prisma.user.delete({ where: { id } })
    res.json({ message: 'User deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// Get Overview Stats
router.get('/overview-stats', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'STUDENT' } })
    
    // Calculate active users (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const activeUsers = await prisma.user.count({
      where: { lastActiveAt: { gte: oneDayAgo } }
    })

    const totalTestsTaken = await prisma.testAttempt.count()
    
    const attempts = await prisma.testAttempt.findMany({ select: { score: true, totalMarks: true } })
    let avgScore = 0
    if (attempts.length > 0) {
      const sum = attempts.reduce((acc, att) => acc + (att.totalMarks > 0 ? (att.score / att.totalMarks) * 100 : 0), 0)
      avgScore = Math.round(sum / attempts.length)
    }

    const pendingQs = await prisma.question.count({ where: { status: 'PENDING' } })

    // Simulate growth data based on total users for the UI graph (12 data points)
    // In production, this would be grouped by date from the database
    const growthData = [
      Math.max(10, Math.floor(totalUsers * 0.1)),
      Math.max(15, Math.floor(totalUsers * 0.2)),
      Math.max(20, Math.floor(totalUsers * 0.3)),
      Math.max(25, Math.floor(totalUsers * 0.4)),
      Math.max(40, Math.floor(totalUsers * 0.5)),
      Math.max(50, Math.floor(totalUsers * 0.6)),
      Math.max(60, Math.floor(totalUsers * 0.7)),
      Math.max(75, Math.floor(totalUsers * 0.8)),
      Math.max(85, Math.floor(totalUsers * 0.9)),
      Math.max(90, Math.floor(totalUsers * 0.95)),
      Math.max(95, Math.floor(totalUsers * 0.98)),
      Math.max(100, Math.floor(totalUsers))
    ].map(v => Math.min(100, Math.max(10, v % 100 + 10))); // Normalize to 10-100% for bar heights

    const todaySessions = []; // Empty array for production

    res.json({ totalUsers, activeUsers, totalTestsTaken, avgScore, pendingQs, growthData, todaySessions })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch overview stats' })
  }
})

// ─── Announcements ────────────────────────────────────────────────────────────

// GET all announcements (admin)
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(announcements)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcements' })
  }
})

// POST create new announcement
router.post('/announcements', async (req, res) => {
  try {
    const { title, content, imageUrl, scheduledAt, expiresAt } = req.body
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Title and content are required' })
    }
    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl?.trim() || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    })
    res.status(201).json(announcement)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create announcement' })
  }
})

// PATCH toggle active status
router.patch('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body
    const updated = await prisma.announcement.update({
      where: { id },
      data: { isActive }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update announcement' })
  }
})

// DELETE announcement
router.delete('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.announcement.delete({ where: { id } })
    res.json({ message: 'Announcement deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete announcement' })
  }
})

export default router
