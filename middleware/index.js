var Product = require("../models/produce");
var Comment = require("../models/comment");
var User    = require("../models/user");
var passport = require("../models/user");
middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login")
    }
}

middlewareObj.isOwner = async function(req, res, next){
    try{
var edit =await Product.findById(req.params.id);
    if(req.isAuthenticated()){
        if(edit.author.id.equals(req.user._id) || req.user.isAdmin){
            next();
        }else{
            res.redirect("back");
        }
    }else{
        if(!req.isAuthenticated()){
            res.redirect("/login");
        }
    }
    }catch(err){
        console.log(err);
    }
    
}

middlewareObj.commentOwner = async function(req, res, next){
    try{
        if(req.isAuthenticated()){
            var edit = await Comment.findById(req.params.comment_id);
            if(edit.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            }else{
                res.redirect("back");
            }
        }else{
            res.redirect("/login");
        }
    }catch(err){
        console.log(err);
    }
}
module.exports = middlewareObj;