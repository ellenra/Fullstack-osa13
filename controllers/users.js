const router = require('express').Router()
const { Op } = require('sequelize')
const { User } = require('../models')
const { Blog } = require('../models')
const { ValidationError } = require('sequelize')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
        model: Blog,
        attributes: { exclude: ['userId']}
    }
  })
  res.json(users)
})

router.post('/', async (req, res) => {
    try {
        const { username, name } = req.body
        const validateUser = User.build({ username, name })
        await validateUser.validate()
        const user = await User.create({ username, name })
        res.json(user)
    } catch (error) {
        if (error instanceof ValidationError) {
            const message = error.errors.map((i) => i.message)
            return res.status(400).json({ error: message })
        }
        return res.status(400).json({ error: error.message })
    }
})

router.get('/:id', async (req, res) => {
    let readStatus = {
        [Op.in]: [false, true]
    }
    if (req.query.read) {
        readStatus = {
            [Op.eq]: req.query.read === "true"
        }
    }

    const user = await User.findByPk(req.params.id, {
        include:{
            model: Blog,
            as: 'saved_blogs',
            attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
            through: {
                attributes: ['read', 'id'],
                where: {
                    '$saved_blogs->readingList.read$': readStatus
                }
            }
        }
    })
    if (user) {
        res.json(user)
    } else {
        res.status(404).end()
    }
})

router.put('/:username', async (req, res) => {
    const newUsername = req.body.username
    const user = await User.findOne({
        where: {
            username: req.params.username
        }
    })
    if (user.disabled) {
        return res.status(401).json({
            error: 'account disabled'
        })
    }
    try {
        await user.update({ username: newUsername })
        res.json(user)
    } catch (error) {
        return res.status(400).json({ error: 'Error in changing username' })
    }
})

module.exports = router