const router = require('express').Router()
const { errorHandler } = require('../util/middleware')
const { Op } = require('sequelize')
const { User } = require('../models')
const { Blog } = require('../models')

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
    const { username, name } = req.body
    const user = await User.create({ username, name })
    res.json(user)
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
    await user.update({ username: newUsername })
    res.json(user)
})

module.exports = router