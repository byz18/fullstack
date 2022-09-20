const express = require('express')
const router  = express.Router()
const Artist = require('../models/artist')
const Vinyl = require('../models/vinyl')


// All Artists async
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const artists = await Artist.find(searchOptions)
        res.render('artists/index', {
            artists: artists,
            searchOptions: req.query})
    } catch {
        res.redirect('/')
    }
})

// Add Artist 
router.get('/new', (req, res) => {
    res.render('artists/new', { artist: new Artist() })
})

// Create Artist async
router.post('/', async (req, res) => {
    const artist = new Artist({
        name:req.body.name
    })
    try{
    const newArtist = await artist.save()
    res.redirect(`artists/${newArtist.id}`)
    } catch {
        res.render('artists/new', {
            artist: artist,
            errorMessage: 'Error creating Artist'
        })
    }
})

// view artist
router.get('/:id', async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id)
        const vinyls = await Vinyl.find({ artist: artist.id }).limit(10).exec()
        res.render('artists/show', {
            artist: artist,
            vinylsByArtist: vinyls
        })
    } catch {
        res.redirect('/')
    }

})

// edit artist page
router.get('/:id/edit', async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id)
        res.render('artists/edit', { artist: artist })
    } catch {
        res.redirect('/artists')
    }

})

// update artist
router.put('/:id', async (req, res) => {
    let artist
    try {
        artist = await Artist.findById(req.params.id)
        artist.name = req.body.name
        await artist.save()
        res.redirect(`/artists/${artist.id}`)
    } catch {
        if (artist == null) {
            res.redirect('/')
        } else {
            res.render('artists/edit', {
                artist: artist,
                errorMessage: 'Error updating Artist'
            })
        }
    }
})

// delete artist
router.delete('/:id', async (req, res) => {
    let artist
    try {
        artist = await Artist.findById(req.params.id)
        await artist.remove()
        res.redirect('/artists')
    } catch {
        if (artist == null) {
            res.redirect('/')
        } else {
            res.redirect(`artists/${artist.id}`)
        }
    }
})

module.exports = router