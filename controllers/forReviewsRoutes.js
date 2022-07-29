//this is a file where all the functionality for reviews routes will be added.
// like leaving a review etc. So the logic will be written here and just used in the routes directory

// requiring our mongoose database models
const Campground = require('../models/campground');
const Review = require('../models/review')

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    //pull- it removes from an existing array all instances of a value
    //or values that match a specified condition
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId}});

    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
};