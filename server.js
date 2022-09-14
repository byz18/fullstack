
// Define "require"
//import { createRequire } from "module";
//const require = createRequire(import.meta.url);

const multer = require('multer')
const express = require('express')


if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


//
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage})

const indexRouter = require('./routes/index')
const artistRouter = require('./routes/artists')
const vinylRouter = require('./routes/vinyls')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ limit: '10mb', extended: false}))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', error => console.log('Connected to Mongoose'))

app.use('/', indexRouter)
app.use('/artists', artistRouter)
app.use('/vinyls', vinylRouter)

app.listen(process.env.PORT || 3000)