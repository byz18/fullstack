const express = require('express')
const router  = express.Router()
const Vinyl = require('../models/vinyl')

// show recently added vinyls
router.get('/', async (req, res) => {
    let vinyls
    try {
        vinyls = await Vinyl.find().sort({ createAt: 'desc'}).limit(5).exec()
    } catch{
        vinyls = []
    }
    res.render('index', { books: books})
})

module.exports = router