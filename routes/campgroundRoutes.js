//here we have broken the long routes itno folders
const express = require('express');
const router = express.Router();

//for image uploading 
const multer = require('multer');
const {storage} = require('../cloudinary')//node automatically looks for index.js file
const upload = multer({ storage });

// requiring the utils folder files for error handling
const catchAsync = require('../utils/catchAsync');

// requiring our mongoose database models
const Campground = require('../models/campground');

//requiring middlewares
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

//***********************************************************************************************//

//requiring all the logic functions for the routes
const forCampgroundRoutes = require('../controllers/forCampgroundRoutes');

//Actual routes

router.route('/')
    .get(catchAsync(forCampgroundRoutes.index))
    //route to post the form which adds a new campground
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(forCampgroundRoutes.CreatesNew));
   
//instead of 
// router.get('/', catchAsync(forCampgroundRoutes.index));
//and
//router.post('/',isLoggedIn, validateCampground,  catchAsync(forCampgroundRoutes.CreatesNew));

//route to add a new campground using an html form
router.get('/new',isLoggedIn, forCampgroundRoutes.renderCreateNewForm);

//we pass this whole function to catchAsync function to handle errors
// and if there is any error, it is catched and passed to next()
//next() calls the next error handling function which the app.use() at the end before app.listen()

//we call the validateCampground function instead of typing the whole logic in here



//BEFORE

// //route to show the campground
// router.get('/:id', catchAsync(forCampgroundRoutes.showCampground));

// //route to post the form which edits the campground
// router.put('/:id',isLoggedIn, isAuthor, validateCampground, catchAsync(forCampgroundRoutes.editCampground));

// router.delete('/:id',isLoggedIn, isAuthor, catchAsync(forCampgroundRoutes.deleteCampground));

//AFTER
//we can group all the /:id routes together too
router.route('/:id')
    //route to show the campground
    .get(catchAsync(forCampgroundRoutes.showCampground))
    //route to post the form which edits the campground
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(forCampgroundRoutes.editCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(forCampgroundRoutes.deleteCampground));


//route to edit campground using a form
router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(forCampgroundRoutes.renderEditForm));

//***********************************************************************************************************//

module.exports = router;