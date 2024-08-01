var express = require("express");
var router = express.Router();
var Product = require("../models/produce");
var Comment = require("../models/comment");
var User    = require("../models/user");
var Notification = require("../models/notification");
var middleware = require("../middleware/index");


//comment route
router.get("/:id/comment/new", middleware.isLoggedIn, async function(req, res){
    try{
        var product = await Product.findById(req.params.id);
       res.render("comment/new", {product});
    }catch(err){
        console.log(err)
    }
});


router.post("/:id/comment", middleware.isLoggedIn, async function(req, res){
    try{
        var product = await Product.findById(req.params.id);
        var commentData = req.body.comment;
        var comment = await Comment.create(commentData);
        comment.author.username = req.user.username;
        comment.author.id = req.user._id;
        comment.save();
        product.comments.push(comment);
        product.save();
        var user = await User.findById(req.user._id).populate('followers').exec();
        var newNotification ={
            comment: {
                username: req.user.username,
                productId: product.id,
            }
            
        }
        var products = product.author.username;
        var userfinder = await User.find({username: products});
        for(var userComment of userfinder){
            var notification = await Notification.create(newNotification);
                userComment.notifications.push(notification);
                userComment.save();
        }
        res.redirect("/" + product._id);
    }catch(err){
        console.log(err);
    }
});
router.get("/:id/comment/:comment_id/edit", middleware.commentOwner, async function(req, res){
    var edit = await Comment.findById(req.params.comment_id);
 res.render("comment/edit", {product_id:req.params.id, edit})
});

//comment update route
router.put("/:id/comment/:comment_id", middleware.commentOwner, async function(req, res){
    try{
        var update = await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
        res.redirect("/" + req.params.id);
    }catch(err){
        console.log(err);
    }
});

//comment delete route
router.delete("/:id/comment/:comment_id", middleware.commentOwner, async function(req, res){
    try{
        var removeComment = await Comment.findByIdAndRemove(req.params.comment_id);
        res.redirect("/" + req.params.id);
    }catch(err){
        console.log(err)
    }
})



module.exports = router;