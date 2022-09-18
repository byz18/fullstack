const express = require('express')
const router = express.Router()

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const Vinyl = require('../models/vinyl')
const Artist = require('../models/artist')
const { query } = require('express')

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']  //accepted file types


// All Vinyls async
router.get('/', async (req, res) => {
    let query = Vinyl.find()
    // check for empty string
    // check from database model to create regexp containing title
    if (req.query.title != null && req.query.title != '') {         
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.releasedBefore != null && req.query.releasedBefore != '') {         
        query = query.lte('releaseDate', req.query.releasedBefore)
    }
    if (req.query.releasedAfter != null && req.query.releasedAfter != '') {         
        query = query.gte('releaseDate', req.query.releasedAfter)
    }
    try {
        const vinyls = await query.exec()
        res.render('vinyls/index', {
            vinyls: vinyls,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// Add Vinyl async
router.get('/new', async (req, res) => {
    renderNewPage(res, new Vinyl())
})

// Create Vinyl async //

//upload

router.post('/', async (req, res) => {
    const vinyl = new Vinyl({
        title: req.body.title,
        artist: req.body.artist,
        releaseDate: new Date(req.body.releaseDate),
        genre: req.body.genre,
        description: req.body.description
    })
    saveCover(vinyl, req.body.cover)

    try {
        const newVinyl = await vinyl.save()
        //res.redirect(`vinyls/${newVinyl.id}`)
        res.redirect(`vinyls`)
    } catch {
        renderNewPage(res, vinyl, true)
    }
}) 


// render/redirects page with error message
async function renderNewPage(res, vinyl, hasError = false) {
    try {
        const artists = await Artist.find({})
        const params = {
            artists: artists,
            vinyl: vinyl
        }
        if (hasError) params.errorMessage = 'Error Creating Vinyl'
        res.render('vinyls/new', params)
    } catch {
        res.redirect('/vinyls')
    }
}

function saveCover(vinyl, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        vinyl.coverImage = new Buffer.from(cover.data, 'base64')
        vinyl.coverImageType = cover.type
    }
}


module.exports = router