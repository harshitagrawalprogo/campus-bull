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

export default router
