var express = require("express");
var router  = express.Router();
var post = require("../models/post");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var SummaryTool = require('node-summary');
var { isLoggedIn, checkUserpost, checkUserComment, isAdmin } = middleware; // destructuring assignment
// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all posts
router.get("/", function(req, res){
    var noMatch = null;
  if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all posts from DB
      post.find({$or: [{name: regex},{type: regex},{desc: regex},{factOrMyth: regex},{'author.username': regex}]}, function(err, allposts){
         if(err){
            console.log(err);
         } else {
             if (allposts.length <1){
                 noMatch = "Can not find the fact you are looking for";
             }
            res.render("posts/index", {posts: allposts, noMatch: noMatch})
         }
      });
  } else {
      // Get all posts from DB
      post.find({}, function(err, allposts){
         if(err){
             console.log(err);
         } else {
              res.render("posts/index",{posts: allposts, page: 'posts', noMatch: noMatch});
         }
      });
  }
});

router.post("/", isLoggedIn, function(req, res){
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  var type = req.body.type;
  var factOrMyth = req.body.factOrMyth;
  var source = req.body.source;
  var title="";
  SummaryTool.summarize(title, desc, function(err, summary) {
	if(err) {console.log("Something went wrong!");}
	
  var newpost = {name: name, image: image, description: desc, summary: summary, author:author, type: type, factOrMyth: factOrMyth, source: source};
    // Create a new post and save to DB
    post.create(newpost, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            res.redirect("/posts");
        }
    });
  })
  
});

//NEW - show form to create new post
router.get("/new", isLoggedIn, function(req, res){
   res.render("posts/new"); 
});

// SHOW - shows more info about one post
router.get("/:id", function(req, res){
    post.findById(req.params.id).populate("comments").exec(function(err, foundPost){
        if(err || !foundPost){
            console.log(err);
            req.flash('error', 'Sorry, that post does not exist!');
            return res.redirect('/posts');
        }
        res.render("posts/show", {post: foundPost});
    });
});

// EDIT - shows edit form for a post
router.get("/:id/edit", isLoggedIn, checkUserpost, function(req, res){
  //render edit template with that post
  res.render("posts/edit", {post: req.post});
});

// PUT - updates post in the database
router.put("/:id", function(req, res){
var newData = {name: req.body.name, image: req.body.image, description: req.body.description, type: req.body.type, factOrMyth: req.body.factOrMyth, source: req.body.source};
    post.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, post){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/posts/" + post._id);
        }
    });
  }
);

// DELETE - removes post and its comments from the database
router.delete("/:id", isLoggedIn, checkUserpost, function(req, res) {
    Comment.remove({
      _id: {
        $in: req.post.comments
      }
    }, function(err) {
      if(err) {
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.post.remove(function(err) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('error', 'post deleted!');
            res.redirect('/posts');
          });
      }
    })
});

module.exports = router;

