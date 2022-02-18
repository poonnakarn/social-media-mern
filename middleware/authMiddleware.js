const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const token = req.header('Authorization')

  if (!token) {
    return res.status(401).send('Access denied. No token provided.')
  }

  try {
    // decode and return payload
    const { userId } = jwt.verify(token, process.env.jwtSecret)

    req.userId = userId
    next()
  } catch (error) {
    // console.error(error)
    return res.status(400).send('Invalid token.')
  }
}
