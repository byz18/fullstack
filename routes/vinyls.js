const express = require('express')
const router = express.Router()
const Vinyl = require('../models/vinyl')
const Artist = require('../models/artist')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']  //accepted file types


// All Vinyls 
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

// New Vinyl 
router.get('/new', async (req, res) => {
    renderNewPage(res, new Vinyl())
})

// New Vinyl

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
        res.redirect(`vinyls/${newVinyl.id}`)
    } catch {
        renderNewPage(res, vinyl, true)
    }
}) 


// Show Vinyl 
// populate changes from an id to an object (adds artist information)
router.get('/:id', async (req, res) => {
  try {
    const vinyl = await Vinyl.findById(req.params.id)
                           .populate('artist')
                           .exec()
    res.render('vinyls/show', { vinyl: vinyl })
  } catch {
    res.redirect('/')
  }
})

// Edit Vinyl 
router.get('/:id/edit', async (req, res) => {
    try {
      const vinyl = await Vinyl.findById(req.params.id)
      renderEditPage(res, vinyl)
    } catch {
      res.redirect('/')
    }
  })
  

// Update Vinyl Route
router.put('/:id', async (req, res) => {
    let book
  
    try {
      vinyl = await Vinyl.findById(req.params.id)
      vinyl.title = req.body.title
      vinyl.artist = req.body.artist
      vinyl.releaseDate = new Date(req.body.releaseDate)
      vinyl.genre = req.body.genre
      vinyl.description = req.body.description
      if (req.body.cover != null && req.body.cover !== '') {
        saveCover(vinyl, req.body.cover)
      }
      await vinyl.save()
      res.redirect(`/vinyls/${vinyl.id}`)
    } catch {
      if (vinyl != null) {
        renderEditPage(res, vinyl, true)
      } else {
        redirect('/')
      }
    }
  })
  
  // Delete Vinyl Page
  router.delete('/:id', async (req, res) => {
    let vinyl
    try {
      vinyl = await Vinyl.findById(req.params.id)
      await vinyl.remove()
      res.redirect('/vinyls')
    } catch {
      if (vinyl != null) {
        res.render('vinyls/show', {
          vinyl: vinyl,
          errorMessage: 'Could not remove vinyl'
        })
      } else {
        res.redirect('/')
      }
    }
  })



async function renderNewPage(res, vinyl, hasError = false) {
    renderFormPage(res, vinyl, 'new', hasError)
}


async function renderEditPage(res, vinyl, hasError = false) {
    renderFormPage(res, vinyl, 'edit', hasError)
}

// render/redirects/edits page with error message
async function renderFormPage(res, vinyl, form, hasError = false) {
    try {
        const artists = await Artist.find({})
        const params = {
            artists: artists,
            vinyl: vinyl
        }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Updating Vinyl'
              } else {
                params.errorMessage = 'Error Creating Vinyl'
              }
        } 
        res.render(`vinyls/${form}`, params)
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