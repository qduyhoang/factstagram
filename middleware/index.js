var Comment = require('../models/comment');
var post = require('../models/post');
module.exports = {
  isLoggedIn: function(req, res, next){
      if(req.isAuthenticated()){
          return next();
      }
      req.flash('error', 'You must be signed in to do that!');
      res.redirect('/login');
  },
  checkUserpost: function(req, res, next){
    post.findById(req.params.id, function(err, foundpost){
      if(err || !foundpost){
          console.log(err);
          req.flash('error', 'Sorry, that post does not exist!');
          res.redirect('/posts');
      } else if(foundpost.author.id.equals(req.user._id) || req.user.isAdmin){
          req.post = foundpost;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/posts/' + req.params.id);
      }
    });
  },
  checkUserComment: function(req, res, next){
    Comment.findById(req.params.commentId, function(err, foundComment){
       if(err || !foundComment){
           console.log(err);
           req.flash('error', 'Sorry, that comment does not exist!');
           res.redirect('/posts');
       } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
            req.comment = foundComment;
            next();
       } else {
           req.flash('error', 'You don\'t have permission to do that!');
           res.redirect('/posts/' + req.params.id);
       }
    });
  },
  isAdmin: function(req, res, next) {
    if(req.user.isAdmin) {
      next();
    } else {
      req.flash('error', 'You don\'t have access to that');
      res.redirect('back');
    }
  }
//  isSafe: function(req, res, next) {
//    if(req.body.image.match(/^https:\/\/images\.unsplash\.com\/.*/)) {
//      next();
//    }else {
//      req.flash('error', 'Only images are allowed.');
//      res.redirect('back');
//    }
//  }
}