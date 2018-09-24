var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    _id: Number,
    first: String,
    last: String,
    username: {
        type: String,
        required: true
    },
    city: String,
    address: String,
    role: {
        type: String,
        default: 'guest'
    }
},
    { _id: false });
User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);