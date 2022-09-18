const express = require('express')
const router  = express.Router()

router.use(express.urlencoded({ extended: false})) //access in req in post

router.get('/', (req, res) => {
    res.render('login/index.ejs',)
})

router.get('/login', (req, res) => {
    res.render('login/login.ejs',)
})

router.post('/login', (req, res) => {
})

router.get('/register', (req, res) => {
    res.render('login/register.ejs',)
})

router.post('/register', (req, res) => {
})

module.exports = router