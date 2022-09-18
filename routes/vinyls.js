const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const sharp = require('sharp')

const crypto = require('crypto')
const randomImageName = () => crypto.randomBytes(16).toString('hex') //randomiser for image name

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const Vinyl = require('../models/vinyl')
const Artist = require('../models/artist')
const { query } = require('express')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage})

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']  //accepted file types
const uploadPath = path.join('public', Vinyl.coverImageBasePath)
const uploadMongodb = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// AWS s3
const aws = require('aws-sdk')
const {Upload} = require('@aws-sdk/lib-storage')
const multerS3 = require('multer-s3')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { compileFunction } = require('vm')



const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion

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

// Add Vinyl async
router.get('/new', async (req, res) => {
    renderNewPage(res, new Vinyl())
})

// Create Vinyl async //

//MONGODB upload

router.post('/local', uploadMongodb.single('cover'), async (req, res) => {
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


//AWS image upload

router.post('/cloud', upload.single('cover'), async (req, res) => {
    
    //resize
    const buffer = await sharp(req.file.buffer).resize({height: 150, width: 150, fit: "contain"}).toBuffer()
    //randomise image name
    const imageName = randomImageName()

    const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: buffer,
        ContentType: req.file.mimetype,
    }

    const command = new PutObjectCommand(params)
    await s3.send(command)


    res.send({})
})


// remove file from albumCover folder with log
function removeAlbumCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

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


module.exports = router