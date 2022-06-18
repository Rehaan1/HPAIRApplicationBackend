const jwt = require('jsonwebtoken')

function auth (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Access Denied')
  }
  const token = req.headers.authorization.split(' ')[1]
  if (!token) {
    return res.status(401).send('Access Denied')
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET)// returns payload
    req.user = verified
    next()
  } catch (err) {
    res.status(400).send('Invalid Token')
  }
}

module.exports = auth
