var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   createdAt: { type: Date, default: Date.now },
   type: String,
   source: String,
   factOrMyth: String,
   numFact: 0,
   numMyth: 0,
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("post", postSchema);