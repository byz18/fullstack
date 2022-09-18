const mongoose = require('mongoose')
const Vinyl = require('./vinyl')

const artistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        dropDups: true
    }
})

// checks if artist is in use before removing artist
artistSchema.pre('remove', function(next) {
    Vinyl.find({ artist: this.id }, (err, vinyls) => {
        if (err) {
            next(err) //passes error to next function and prevents removing artist
        } else if (vinyls.length > 0) {
            next(new Error('This Artist is still in use')) 
        } else {
            next() //removes artist
        }
    })
})

module.exports = mongoose.model('Artist', artistSchema)