import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1] // Bearer token

  if (!token) {
    return res.status(401).json({ error: 'Access Denied: No token provided' })
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    req.user = verified // { userId, role }
    next()
  } catch (error) {
    res.status(400).json({ error: 'Invalid Token' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next()
  } else {
    res.status(403).json({ error: 'Access Denied: Requires Admin role' })
  }
}
