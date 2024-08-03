var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index");
var Product = require("../models/produce");
var User = require("../models/user");
var passport = require("passport");
var Notification = require("../models/notification");

//essential route
// Product.create({
//     name: "Obasanjo chicks",
//     image: "pics\chicks.jpg",
//     description: "These are the early day old chicks that i use to sell"
// });


router.get("/register", async function(req, res){
    res.render("form/register");
});
router.post("/register", async function(req, res){
        try{
        var username = req.body.username;
        var email = req.body.email;
        var description = req.body.description;
        var fullname = req.body.fullname;
        var newUser = {username: username, email: email, secretCode: secretCode, description: description, fullname: fullname};
        var secretCode = req.body.secretCode;
        if(secretCode === "1980"){
            newUser.isAdmin = true;
        }
        var user = await User.register(newUser, req.body.password);
            res.redirect("/login");
        } catch(err){
        console.log(err);
        res.render("form/register");
    }
});

router.get("/login", function(req, res){
    res.render("form/login")
});
router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}), function(req, res){});

router.get("/logout", function(req, res){
    req.logOut(function(err, out){
        if(err){
            console.log(err)
        }
        res.redirect("/");
    });
});

//Profile page
router.get("/user/:id", async function(req, res){
   
    try {
        var product = await Product.find({});
        var user = await User.findById(req.params.id).populate('followers').exec();
        var unique = user.followers.filter((value, index)=>{
            return user.followers.indexOf(value) === index;
        });
        res.render('profile', {user, product, unique, title: user.username  + ' profile'});
    } catch(err) {
        console.log(err);
        return res.redirect('back');
    }
});

//follow user
router.get('/follow/:id', middleware.isLoggedIn, async function(req, res) {
    try {
        var user = await User.findById(req.params.id);
        user.followers.push(req.user._id);
        var unique = user.followers.filter((value, index)=>{
            return user.followers.indexOf(value) === index;
        });
        user.followers = unique;
        user.save();
        res.redirect('/user/' + req.params.id);
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
});

//Unfollow user
router.get('/unfollow/:id', middleware.isLoggedIn, async function(req, res) {
    try {
        var user = await User.findById(req.params.id);
        var remove = user.followers.indexOf(req.user._id);
        user.followers.splice(remove, 1);
        user.save();
        res.redirect('/user/' + req.params.id);
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
});
//notification routes
router.get("/notifications", middleware.isLoggedIn, async function(req, res){
    try{
        var user = await User.findById(req.user._id).populate({
            path: "notifications",
            options: {sort: {"_id": -1}}
        }).exec();
        var allNotification = user.notifications;
        res.render("notification", {allNotification});
    }catch(error){
        console.log(error);
    }
});
//notification address
router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
    try {
        var notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect('/'+ notification.postId);
    } catch(err) {
        console.log(err);
        res.redirect('back');
    }
});




module.exports = router;