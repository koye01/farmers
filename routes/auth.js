var express = require("express");
var router = express.Router();
var middleware = require("../middleware/index");
var Product = require("../models/produce");
var User = require("../models/user");
var passport = require("passport");
var Notification = require("../models/notification");
var path = require("path");
var multer = require("multer");
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/profile")
    },
    filename: function(req, file, cb){
        //console.log(file),
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
var upload = multer({storage: storage});

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
        var image = "/profile/" + req.file.filename;
        var username = req.body.username;
        var email = req.body.email;
        phone = req.body.phone;
        var description = req.body.description;
        var fullname = req.body.fullname;
        var newUser = {image: image, username: username, email: email, secretCode: secretCode, 
            description: description, fullname: fullname, phone: phone};
        var secretCode = req.body.secretCode;
        if(secretCode === "1980"){
            newUser.isAdmin = true;
        }
        var user = await User.register(newUser, req.body.password);
        req.flash("success", user.username,+ "!", "Your registration was successful")
            res.redirect("/login");
        } catch(err){
        req.flash("error", err.message);
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
    req.flash("success", "successfully logged out");
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
//Profile edit page
router.get("/user/:id/edit", async function(req, res){
    try{
        var editProf = await User.findById(req.params.id);
        res.render("profileedit", {editProf})
    }catch(err){
        console.log(err);
    }
});
//Profile post edit page
router.put("/user/:id", upload.single("image"), async function(req, res){
    try{
        var image = "/profile/" + req.file.filename;
        var fullname = req.body.fullname;
        var description = req.body.description;
        var phone = req.body.phone
        var update = {image: image, fullname: fullname, description: description, phone: phone}
        var user = await User.findByIdAndUpdate(req.params.id, update);
        req.flash('success', 'profile successfully updated');
        res.redirect("/user/"+ req.params.id);
    }catch(err){
        console.log(err);
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
        req.flash("success", unique.username, "started following you");
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
        req.flash("success", "you successfully unfollowed", remove.username);
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
//Product notification address
router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
    try {
        var user = await User.findById(req.params.id);
        var notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect("/" +notification.post.productId);
    } catch(err) {
        console.log(err);
    }
});
//comment notification address
router.get('/notifications/com/:id', middleware.isLoggedIn, async function(req, res) {
    try {
        var user = await User.findById(req.params.id);
        var notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect("/" +notification.comment.productId);
    } catch(err) {
        console.log(err);
    }
});





module.exports = router;