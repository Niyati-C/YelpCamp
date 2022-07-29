const BaseJoi = require('joi');

//this is for security purposes/ sanitizing out html. Which means we cannot type html in any of our inputs
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)


//this is not a mongoose schema, its a joi schema which is going to validate our data
//before we even attempt to save is with mongoose
//even if we handled express error, but someone can use our form from postman and create an invalid campground from there
// so we need to validate errors from mongoose side as well
module.exports.campgroundSchema = Joi.object({

    //remember, campground is defined in html when a new campground is added
    //everything is campground[title], campground[image], campground[etc..]
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()

    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewsSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});