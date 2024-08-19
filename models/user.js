var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    image: String,
    password: String,
    email: {type: String, required: true, unique: true},
    fullname: String,
    phone: String,
    description: String,
    isAdmin: {type: Boolean, default: false},
    notifications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification"
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
})

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema)