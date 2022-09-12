const express = require('express')
const router  = express.Router()
const multer = require('multer')
const path = require('path')
const Vinyl = require('../models/vinyl')
const uploadPath = path.join('public', Vinyl.coverImageBasePath)
const Artist = require('../models/artist')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, )
    }
})

// All Vinyls async
router.get('/', async (req, res) => {
    res.send('All Vinyls')    
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
        renderNewPage(res, vinyl, true)
    }
})

async function renderNewPage(res, vinyl, hasError = false) {
    try {
        const artists = await Artist.find ({})
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