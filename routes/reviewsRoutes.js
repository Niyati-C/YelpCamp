//here we have broken the long routes itno folders
const express = require('express');
const router = express.Router({mergeParams: true});
//we needed this merge params property as the params in campground routes cant be accessed in here otherwise

// requiring the utils folder files for error handling
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

// requiring our mongoose database models
const Campground = require('../models/campground');
const Review = require('../models/review')

//requiring all the logic functions for the routes
const forReviewsRoutes = require('../controllers/forReviewsRoutes');

//requiring middleware for validating
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

//*************************************************************************************//
//routes

router.post('/',isLoggedIn, validateReview, catchAsync(forReviewsRoutes.createReview));

//this is to delete a review
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(forReviewsRoutes.deleteReview));


//*************************************************************************************************//

module.exports = router;