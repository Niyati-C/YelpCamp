const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

// this model is going to have a one to many relationship with campgorund model
// where one is campgorund and many is reviews

module.exports = mongoose.model("Review", reviewSchema);