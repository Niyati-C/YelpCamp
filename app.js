//process.env.NODE_ENV is an environment variable that is usually just development.
//if we're in development mode, require this file in my node app so i can access them 
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

//for connection to production environment
const MongoStore = require('connect-mongo');


//for security of mongodb
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

//requiring our routes which are in another folder. We have used express router
const campgroundRoutes = require('./routes/campgroundRoutes');
const reviewsRoutes = require('./routes/reviewsRoutes')
const userRoutes = require('./routes/userRoutes');

// requiring our mongoose database models
const Campground = require('./models/campground');
const Review = require('./models/review')
const User = require('./models/user');


// requiring the utils folder files for error handling
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

//requiring our schemas(joi) for error handling from server side
const {campgroundSchema, reviewsSchema} = require('./schemas.js');

//for deploying
// const dbUrl = process.env.DB_URL; 
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

// **************************************************************************************************** //
// 
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//this is to parse the body of any html form into actual data
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
//this is to use the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

//for deployment
//*************************************************** */
const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: secret
  }
});
store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
});
//********************************************************//

//setting up session
const sessionConfig = {
    //to protect our session id
    store,
    name: 'spartan',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
        //as Date.now() is in ms, if i want this to expire in one week from now, i have to add that many ms 
    }
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

//all this is for helmet to work
//add crossorigin to all the js/css files included in the boilerplate

const scriptSrcUrls = [
 
    'https://stackpath.bootstrapcdn.com/',
    'https://api.tiles.mapbox.com/',
    'https://api.mapbox.com/',
    'https://kit.fontawesome.com/',
    'https://cdnjs.cloudflare.com/',
    'https://cdn.jsdelivr.net'
  ];
  const styleSrcUrls = [
    'https://kit-free.fontawesome.com/',
    'https://stackpath.bootstrapcdn.com/',
    'https://api.mapbox.com/',
    'https://api.tiles.mapbox.com/',
    'https://fonts.googleapis.com/',
    'https://use.fontawesome.com/',
    'https://cdn.jsdelivr.net'  // I had to add this item to the array 
  ];
  const connectSrcUrls = [
    'https://api.mapbox.com/',
    'https://a.tiles.mapbox.com/',
    'https://b.tiles.mapbox.com/',
    'https://events.mapbox.com/'
  ];
  const fontSrcUrls = [];
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", 'blob:'],
        objectSrc: [],
        imgSrc: [
          "'self'",
          'blob:',
          'data:',
          'https://res.cloudinary.com/di6h3prdr/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
          'https://images.unsplash.com/'
        ],
        fontSrc: ["'self'", ...fontSrcUrls]
      }
    })
  );
//******************************************************************************************************************************************************************//

// in an express app, passport.initialize() middleware is required to initialize passport
//If your app uses persistent login sessions, passport.session() middleware must also be used(if we dont want to have to log in on every single request)
//session should be used before passport.session()
app.use(passport.initialize());
app.use(passport.session());

//what we're saying here is that, hello passport, we would like you use the local strategy that we have downloaded and required,
//and for that local strategy, the authentication is going to be located on our user model and its called authenticate
//authenticate is a built-in static method that generates a function that is used in passport local strategy
passport.use(new LocalStrategy(User.authenticate()));

//this is telling passports to serialize a user. Which basically refers to how do we get data or how do we store a user in the session.
passport.serializeUser(User.serializeUser());

//and this refers to how do we get an user out of that session
passport.deserializeUser(User.deserializeUser());


//********************************************************************************************************************************************************************//

// a middleware for flash to accept this request
//most of the times its gonna be nothing until we flash something
//so whatever's in there, will have access to in our templates automatically
app.use((req, res, next) => {
    
    //passport provides an object in request called user. It shows the properties of the current signed in user
    res.locals.currentUser = req.user;
    //so now in all my templates, i will have access to current user and i can now check if user is signed in or not

    //we just always have access to something called success and its gonna flash whatever's stored under the key 'success'
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    req.next();
});


// ********************************************************************************************************************** //

app.get('/', (req,res) => {
    res.render('home');
});


//this is to use all the routes starting with /campgrounds
app.use('/campgrounds', campgroundRoutes);

//this is to use all the review routes starting with /campgrounds/:id/reviews
app.use('/campgrounds/:id/reviews', reviewsRoutes);

//this is to use all the routes for users inside users folder
app.use('/', userRoutes);

//to register a user
app.get('/register', async (req,res) => {
    //passport provides a register method which registers a new user instance with a given password,
    //and also checks that username is unique
    //register takes the untire user model, the instance of the model and then a password.
    //Then its going to hash that password, takes the salt and stores the salt and hash on our user.


})

// ************************************************************************************************************************* // 


//if no other url is matched from above, this function below is going to run

//this means i am passing this ExpressError to next
//and next is app.use below it
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})



//this is our error handler
//i can throw errors in any function, specify a message, specify a status code, 
//and it will make its way down here where we use that message, we use that status code,
//or we provide a default(500, something went wrong) if nothing was provided.
// Then we set that status code in the response and sends that message.
// we hanndled express errors but we can still get mongoose errors
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    // res.status(statusCode).send(message);
    //instead of simply sending a message , we will render an error template

    if(!err.message) err.message = 'Oh No! Something Went Wrong'
    res.status(statusCode).render('error', {err});
    
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
});