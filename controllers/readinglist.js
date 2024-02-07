const router = require('express').Router()
const { errorHandler } = require('../util/middleware')
const { ReadingList, User } = require('../models')
const { tokenExtractor } = require('../util/middleware')


router.post('/', async (req, res) => {
    const list = await ReadingList.create({
        userId: req.body.user_id,
        blogId: req.body.blog_id
    })
    if (list) {
        res.json(list)
    } else {
        res.status(404).end()
    }
})

router.put('/:id', tokenExtractor, async (req, res) => {
    const user = await User.findByPk(req.decodedToken.id)
    const bookEntry = await ReadingList.findByPk(req.params.id)
    if (bookEntry.id !== user.id) {
        return res.status(401).json({ error: 'You can only change own reading status!' })
    }
    await bookEntry.update({ read: req.body.read })
    res.json(bookEntry)
})


module.exports = router

