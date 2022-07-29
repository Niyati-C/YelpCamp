const express = require('express');
const passport = require('passport');
const router = express.Router();

//requiring our user mongoose model
const User = require('../models/user');

//requiring all the logic functions for the routes
const forUserRoutes = require('../controllers/forUserRoutes');

const catchAsync = require('../utils/catchAsync');

router.route('/register')
    //route for registering a user
    .get(forUserRoutes.renderRegisterForm)
    //route for posting the registering form
    .post(catchAsync(forUserRoutes.registerUser));


router.route('/login')
    //route for logging in
    .get(forUserRoutes.renderLoginForm)
    //route for posting the login request form
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }) , forUserRoutes.loginUser);

//route for user to log out
router.get('/logout', forUserRoutes.logoutUser); 

module.exports = router;