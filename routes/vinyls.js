const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Vinyl = require('../models/vinyl')
const Artist = require('../models/artist')
const { query } = require('express')
const uploadPath = path.join('public', Vinyl.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

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

// New Vinyl async
router.get('/new', async (req, res) => {
    renderNewPage(res, new Vinyl())
})

// Create Vinyl async
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const vinyl = new Vinyl({
        title: req.body.title,
        artist: req.body.artist,
        releaseDate: new Date(req.body.releaseDate),
        genre: req.body.genre,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newVinyl = await vinyl.save()
        //res.redirect(`vinyls/${newVinyl.id}`)
        res.redirect(`vinyls`)
    } catch {
        if (vinyl.coverImageName != null) {
            removeAlbumCover(vinyl.coverImageName)
        }
        renderNewPage(res, vinyl, true)
    }
})

// remove file from albumCover folder with log
function removeAlbumCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

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


module.exports = router