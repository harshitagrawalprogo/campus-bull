import express from 'express'

const router = express.Router()

// NEET rank bracket table (score → rank range)
// Based on official NEET 2024 statistics
const RANK_BRACKETS = [
  { minScore: 700, maxScore: 720, minRank: 1,     maxRank: 100   },
  { minScore: 680, maxScore: 699, minRank: 101,   maxRank: 500   },
  { minScore: 660, maxScore: 679, minRank: 501,   maxRank: 1500  },
  { minScore: 640, maxScore: 659, minRank: 1501,  maxRank: 3000  },
  { minScore: 620, maxScore: 639, minRank: 3001,  maxRank: 5000  },
  { minScore: 600, maxScore: 619, minRank: 5001,  maxRank: 8000  },
  { minScore: 580, maxScore: 599, minRank: 8001,  maxRank: 12000 },
  { minScore: 560, maxScore: 579, minRank: 12001, maxRank: 18000 },
  { minScore: 540, maxScore: 559, minRank: 18001, maxRank: 25000 },
  { minScore: 520, maxScore: 539, minRank: 25001, maxRank: 35000 },
  { minScore: 500, maxScore: 519, minRank: 35001, maxRank: 50000 },
  { minScore: 480, maxScore: 499, minRank: 50001, maxRank: 70000 },
  { minScore: 460, maxScore: 479, minRank: 70001, maxRank: 95000 },
  { minScore: 440, maxScore: 459, minRank: 95001, maxRank: 130000},
  { minScore: 420, maxScore: 439, minRank: 130001,maxRank: 170000},
  { minScore: 400, maxScore: 419, minRank: 170001,maxRank: 220000},
  { minScore: 360, maxScore: 399, minRank: 220001,maxRank: 350000},
  { minScore: 300, maxScore: 359, minRank: 350001,maxRank: 550000},
  { minScore: 0,   maxScore: 299, minRank: 550001,maxRank: 900000},
]

// College eligibility brackets
import { prisma } from '../utils/db.js'

// POST /api/predict/rank — predict rank and matching colleges
router.post('/rank', async (req, res) => {
  try {
    const { score, category = 'General' } = req.body

    if (score === undefined || score < 0 || score > 720) {
      return res.status(400).json({ error: 'Score must be between 0 and 720' })
    }

    // Find rank bracket
    const bracket = RANK_BRACKETS.find(b => score >= b.minScore && score <= b.maxScore)
      || RANK_BRACKETS[RANK_BRACKETS.length - 1]

    // Estimate rank midpoint
    const estimatedRank = Math.round((bracket.minRank + bracket.maxRank) / 2)

    // Apply category adjustment (OBC -5%, SC/ST -15% rank improvement)
    let adjustedRank = estimatedRank
    if (category === 'OBC') adjustedRank = Math.round(estimatedRank * 0.85)
    if (category === 'SC' || category === 'ST') adjustedRank = Math.round(estimatedRank * 0.60)

    // Find eligible colleges directly from Neon PostgreSQL!
    // We look for allotments where the closing rank (aiRank) is greater than or equal to the student's adjustedRank
    const dbAllotments = await prisma.collegeAllotment.findMany({
      where: {
        aiRank: { gte: adjustedRank },
        category: category !== 'General' ? { contains: category } : undefined
      },
      include: { college: true },
      orderBy: { aiRank: 'asc' },
      take: 8
    })

    const eligibleColleges = dbAllotments.map(a => ({
      name: a.college.name,
      state: a.college.state || 'All India',
      type: a.college.type || 'Government',
      minRank: Math.max(1, a.aiRank - 1500),
      maxRank: a.aiRank
    }))

    // Approximate total eligibility based on a count query
    const totalEligibleCount = await prisma.collegeAllotment.count({
      where: { aiRank: { gte: adjustedRank } }
    })

    // Percentile (approximate with 200 total marks)
    const percentile = Math.max(0, Math.min(100, Math.round((1 - adjustedRank / 1000000) * 100 * 10) / 10))

    res.json({
      score,
      category,
      estimatedRank: adjustedRank,
      rankRange: { min: bracket.minRank, max: bracket.maxRank },
      percentile,
      eligibleColleges: eligibleColleges,
      totalEligible: Math.max(eligibleColleges.length, totalEligibleCount)
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Prediction failed' })
  }
})

// POST /api/predict/college — detailed college search
router.post('/college', async (req, res) => {
  try {
    const { rank, state, type } = req.body

    if (!rank || rank < 0) {
      return res.status(400).json({ error: 'Valid rank is required' })
    }

    const whereClause = {
      aiRank: { gte: parseInt(rank) }
    }

    if (state && state !== 'All') {
      whereClause.college = { state: { equals: state, mode: 'insensitive' } }
    }
    if (type && type !== 'All') {
      whereClause.college = { ...whereClause.college, type: { equals: type, mode: 'insensitive' } }
    }

    const dbAllotments = await prisma.collegeAllotment.findMany({
      where: whereClause,
      include: { college: true },
      orderBy: { aiRank: 'asc' },
      take: 20
    })

    const colleges = dbAllotments.map(a => ({
      name: a.college.name,
      state: a.college.state || 'All India',
      type: a.college.type || 'Government',
      minRank: Math.max(1, a.aiRank - 1500),
      maxRank: a.aiRank
    }))

    const total = await prisma.collegeAllotment.count({ where: whereClause })

    res.json({ rank, colleges, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'College prediction failed' })
  }
})

export default router
