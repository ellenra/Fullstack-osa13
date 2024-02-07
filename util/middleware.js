const { ValidationError } = require('sequelize')
const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')

const errorHandler = (error, req, res, next) => {
    console.error(error.message)
    if (error instanceof ValidationError) {
        const message = error.errors.map(i => i.message)
        res.status(400).json({ error: message })
    } else {
        res.status(400).json({ error: 'Error!' })
    }
    next(error)
}

const tokenExtractor = (req, res, next) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      try {
        req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      } catch {
        return res.status(401).json({ error: 'token invalid' })
      }
    }  else {
      return res.status(401).json({ error: 'token missing' })
    }
    next()
  }

module.exports = { errorHandler, tokenExtractor }