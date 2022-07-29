//requiring our schemas(joi) for error handling from server side
const {campgroundSchema, reviewsSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

//middlewares are for protecting routes if they are accessed from postman or other routes/ basically protect server side errors

//this is the middleware function to ensure that a user is logged in before he/she performs further functions
//this is going to be used when a new campgorund is created, or a user enters a review

//authentication middleware
module.exports.isLoggedIn = (req, res, next) => {

    if(!req.isAuthenticated()){
        
        //we want to make sure to return the user to the page he/she was trying to go to before logging in.
        //so for that we have to store the url before he/she logged in. And then return to the same url after he/she was successfully logged in
        req.session.returnTo = req.originalUrl;

        req.flash('error', 'You must be signed in first');
        return res.redirect('/login');
    }
    next();
}

// we create a middleware function to validate campgrounds by mongoose using JOI
module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }

}


//authorization middleware
module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const c = await Campground.findById(id);
    if(!c.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};



// we create a middleware function to validate reviews by mongoose using JOI
module.exports.validateReview = (req, res, next) => {
  

    const {error} = reviewsSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }

}

//we create a middleware to check if the review being deleted is by the review author only
module.exports.isReviewAuthor = async (req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

