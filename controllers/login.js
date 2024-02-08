const jwt = require('jsonwebtoken')
const router = require('express').Router()
const { errorHandler } = require('../util/middleware')
const { tokenExtractor } = require('../util/middleware')
const { SECRET } = require('../util/config')
const User = require('../models/user')
const { ActiveSessions } = require('../models')

router.post('/', async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ where: { username } })

    if ((!user || password !== 'secret')) {
        return res.status(401).json({
        error: 'Invalid username or password'
        })
    }

    if (user.disabled) {
        return res.status(401).json({
            error: 'Account disabled'
        })
    }

    const userForToken = {
        username: user.username,
        id: user.id,
    }

    const token = jwt.sign(userForToken, SECRET)

    try {
        const oldSession = await ActiveSessions.findOne({ where: {userId: user.id }})
        if (oldSession) {
            oldSession.destroy()
        }
        await ActiveSessions.create({ userId: user.id, token})
    } catch (error) {
        return res.status(401).json({ error: 'Error in login' })
    }

    res.status(200).send({ token, username: user.username, name: user.name })
})

router.delete('/', tokenExtractor, async (req, res) => {
    try {
        const userId = req.decodedToken.id
        await ActiveSessions.destroy({
        where: {
            userId,
            token: req.get('authorization').substring(7)
        }
        })  
    } catch (error) {
        res.status(404).json({ error: 'Error in logout' })
    }

})

module.exports = router