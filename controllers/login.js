const jwt = require('jsonwebtoken')
const router = require('express').Router()
const { errorHandler } = require('../util/middleware')
const { tokenExtractor } = require('../util/middleware')
const { SECRET } = require('../util/config')
const User = require('../models/user')
const { ActiveSessions } = require('../models')

router.post('/', async (request, response) => {
    const { username, password } = request.body
    const user = await User.findOne({ where: { username } })

    if ((!user || password !== 'secret')) {
        return response.status(401).json({
        error: 'invalid username or password'
        })
    }

    if (user.disabled) {
        return response.status(401).json({
            error: 'account disabled'
        })
    }

    const userForToken = {
        username: user.username,
        id: user.id,
    }

    const token = jwt.sign(userForToken, SECRET)

    await ActiveSessions.create({ userId: user.id, token})

    response
        .status(200)
        .send({ token, username: user.username, name: user.name })
})

router.delete('/', tokenExtractor, async (req, res) => {
    const userId = req.decodedToken.id
    await ActiveSessions.destroy({
      where: {
        userId,
        token: req.get('authorization').substring(7)
      }
    })  

})

module.exports = router