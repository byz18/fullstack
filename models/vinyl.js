const mongoose = require('mongoose')

const coverImageBasePath = 'uploads/albumCovers'

const vinylSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type:String
    },
    releaseDate: {
        type: Date,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName:{
    type: String,
    required: true
    },
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Artist'
    }
})

module.exports = mongoose.model('Vinyl', vinylSchema)
module.exports.coverImageBasePath = coverImageBasePath