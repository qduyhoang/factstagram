var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: {type: Boolean, default: false},
    votedPosts: [{
        postId: {           
            type: mongoose.Schema.Types.ObjectId,
            ref: "post",
        },
        userChoice: String
        }]
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);