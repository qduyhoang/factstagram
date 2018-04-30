var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var post = require("../models/post");
var middleware = require("../middleware");
var { isLoggedIn, checkUserpost, checkUserComment, isAdmin } = middleware; // destructuring assignment

//root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    if(req.body.adminCode === process.env.ADMIN_CODE) {
      newUser.isAdmin = false;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "You are signed up!!!" + req.body.username);
           res.redirect("/posts"); 
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login", {page: "login"}); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/posts",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome to Factstagram!'
    }), function(req, res){
});

//show user's profile
router.get("/:id/profile", isLoggedIn, function(req, res){
    var user = req.user._id;
    User.findById(user).populate("votedPosts").exec(function(err, user){
        if (err || !user){
            console.log(err)
        }
        //Store all voted posts' id
        var postIds = []
        user.votedPosts.forEach(function(votedPost){
            postIds.push(votedPost.postId)
        });
        //find posts in users' array
        var expression = {$in : postIds}
        post.find({"_id": expression}, function(err, post){
            if (err || !post){
                console.log(err)
            } else {
                res.render("profile", {votedPosts: post})
            }
        })
    })
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "See you soon!");
   res.redirect("/posts");
});


module.exports = router;