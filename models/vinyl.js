const mongoose = require('mongoose')
const path = require('path')
const coverImageBasePath = 'uploads/albumCovers'

const vinylSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type:String
    },
    genre: {
        type: String,
        required: true
    },
    releaseDate: {
        type: Date,
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

// virtual property of image from public folder value
vinylSchema.virtual('coverImagePath').get(function() {
    if (this.coverImageName != null) {
        return path.join('/', coverImageBasePath, this.coverImageName)
    }
})

module.exports = mongoose.model('Vinyl', vinylSchema)
module.exports.coverImageBasePath = coverImageBasePath