//this is a file where all the functionality for campground routes will be added.
// like creating a campground etc. So the logic will be written here and just used in the routes directory

// requiring our mongoose database models
const Campground = require('../models/campground');

//requiring mapbox for location
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require('../cloudinary');

//this function just shows all the campgrounds(index page)
module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
};

//renders a new campground form
module.exports.renderCreateNewForm = (req,res) => {
    //we will need to check whether ths user is signed in or not before he/she adds a new campground
    //passport automatically adds a helper method called isAuthenticated to the request object itself.
    //it helps us to track whether a user is signed in or not

    // if(!req.isAuthenticated()){
    //     req.flash('error', 'You must be signed in first');
    //     return res.redirect('/login');
    // }
    
    //but after doing this, we can still make a new campground using postman or ajax or something
    //so instead we should make a middle ware that has this functionality so that its applicable for every routes
    res.render('campgrounds/new');
};

//creates new campground
module.exports.CreatesNew = async(req,res) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    //this is for taking location from the form and using it to show it own maps
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
 
    // req.body.campground gives us the entered form data as we have stored everything in
    //campground[title], campground[price], campground[etc]
    const campground = new Campground(req.body.campground);
    //this is for storing lat and long
    campground.geometry = geoData.body.features[0].geometry;
    //this is for image uploading using cloudinary
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    //we will set the author of this new campground to the currently logges in user
    campground.author = req.user._id;

    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

//to show the particular campground
module.exports.showCampground = async (req,res) => {
    const c = await Campground.findById(req.params.id).populate({
        //we want to see the author who made a review so we need to use nested populate
        path: 'reviews',
        populate: {
            path: 'author'
        }
        //and this populate down here is for populating the author of the campground
    }).populate('author');

    if(!c){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show',{c});
};

//to render the edit campground form
module.exports.renderEditForm = async (req,res) => {
    const {id} = req.params;
    const c = await Campground.findById(id);
    if(!c){
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {c});
};

//edit campground
module.exports.editCampground = async(req,res) => {
    const {id} = req.params;
    //we first have to check if the author of the campground that we found, matches the cuurent logged in user
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const c = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    const images = req.files.map(f => ({url: f.path, filename: f.filename}))
    c.images.push(...images);
    c.geometry = geoData.body.features[0].geometry;
    await c.save();
    //to delete selected images
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await c.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${c.id}`);
};

//delete campground
module.exports.deleteCampground = async (req,res)=> {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds')
};