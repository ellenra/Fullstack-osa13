const router = require('express').Router()
const { Blog, User } = require('../models/index')
const { Op } = require('sequelize')
const { sequelize } = require('../util/db')
const { tokenExtractor } = require('../util/middleware')

router.get('/', async (req, res) => {
  const where = {}
  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${req.query.search}%` } },
      { author: { [Op.iLike]: `%${req.query.search}%` } },
    ]
  }
  const blogs = await Blog.findAll({
      attributes: { exclude: ['userId'] },
      include: {
          model: User,
          attributes: ['name']
      },
      where,
      order: [
        [sequelize.literal('"likes" DESC')]
      ]
  })
  res.json(blogs)
})


router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    if (user.disabled) {
      return res.status(401).json({
          error: 'account disabled'
      })
    }
    const blog = await Blog.create({...req.body, userId: user.id, date: new Date()})
    res.json(blog)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', tokenExtractor, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    if (user.disabled) {
      return res.status(401).json({
          error: 'account disabled'
      })
    }
    const blog = await Blog.findByPk(req.params.id)
    if (blog && blog.userId === user.id) {
      await blog.destroy()
      res.status(204).end()
    }
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id)
    blog.likes = req.body.likes
    await blog.save()
    res.json(blog)
  } catch (error) {
    next(error)
  }
})


module.exports = router