const mongoose = require('mongoose');
const cities = require('./cities')
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected !!!");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 200);
        const price = Math.floor(Math.random() * 200) + 10;
        const camp = new Campground({
            author: '62da55de4dfc4d357721f087',
            location: `${cities[random1000].City}, ${cities[random1000].State}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Here it is',
            price: price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].Longitude,
                    cities[random1000].Latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/di6h3prdr/image/upload/v1658842984/YelpCamp/znidgnrw4bemy5oi6fu9.jpg',
                    filename: 'YelpCamp/znidgnrw4bemy5oi6fu9',
                },
                {
                    url: 'https://res.cloudinary.com/di6h3prdr/image/upload/v1658843001/YelpCamp/fcf2fmnwzmrdhq7q9iqk.jpg',
                    filename: 'YelpCamp/fcf2fmnwzmrdhq7q9iqk',
                }
            ]
        })
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })