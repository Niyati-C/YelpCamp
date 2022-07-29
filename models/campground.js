const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

//we will create an image schema so that we can refer to each image inorder to use cloudinary thumbnail property
const ImageSchema = new Schema({
    url: String,
    filename: String
});

//we now display all the images as thumbnails
//we use vitual as we dont need this in our DB because its just derived from the info we're already storing
//in cloudinary there is this api where we can add queries in the url itself to edit images
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    //this is for geoJSON tyoe in order to use lat and long for location
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    //author is going to be the userId for specific user.
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this.id}">${this.title}</a></strong>`;
});


//this is a middleware that will delete reviews in the reviews model
// when a campground from the campground model will be deleted


//this 'findOneAndDelete' middleware is typed here as we used 
//findByIdDelete() to delete campground in app.js
//findByIdDelete() triggers the middleware 'findOneAndDelete' 
// if instead of findByIdDelete(), we would have used some other function,
//it will trigger some other middleware and
// we would have to use some other middleware instead of 'findOneAndDelete' below
// middlewares triggered by particular functions are listed in the docs
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);