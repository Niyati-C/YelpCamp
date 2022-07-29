const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
    //passport automatically adds a username and password field to this schema once we 'plugin'
    //it is also gonna make sure that the usernames are unique , required and password also required
    //it also adds the hash and salt field to store the username. the hashes password and the salt value
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);