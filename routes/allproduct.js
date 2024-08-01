var express = require("express");
var router = express.Router();
var Product = require("../models/produce");
var Comment = require("../models/comment");
var User    = require("../models/user");
var Notification = require("../models/notification");
var multer = require("multer");
var path = require("path");
middleware = require("../middleware/index");
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/pics")
    },
    filename: function(req, file, cb){
        // console.log(file),
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({storage: storage});
var multiUpload = upload.fields([{ name: "image", maxCount: 5}]);

//redirect page
router.get("/", async function(req, res){
    try{
        res.redirect("/allproduct");
    }catch(err){
        console.log(err)
    }
});

//listing of all product page
router.get("/allproduct", async function(req, res){
    try{
        var product = await Product.find({});
        res.render("homepage", {product});
    }catch(err){
        console.log(err)
    }
});

router.get("/addnew", middleware.isLoggedIn, async function(req, res){
    try{
        res.render("addnew");
    }catch(err){
        console.log(err)
    }
});
//Adding new post (post request)
router.post("/", multiUpload, async function(req, res){
    try{
        var name = req.body.name;
        var price = req.body.price;
        var arr = req.files.image;
        var image = ["/pics/" + arr[0].filename, "/pics/" + arr[1].filename, "/pics/" + arr[2].filename];
        var description = req.body.description;
        var author ={
            id: req.user._id,
            username: req.user.username
        }
        var allproduct = {name: name, price: price, image: image, description: description, author: author};
        var newProduce = Product.create(allproduct)
        var user = await User.findById(req.user._id).populate('followers').exec();
        var newNotification = {
            post: {
                username: req.user.username,
                productId: newProduce.id
            }
        }
            for(var follower of user.followers) {
                var notification = await Notification.create(newNotification);
                follower.notifications.push(notification);
                follower.save();
            }
            //redirect back to allproducts page
            res.redirect("/allproduct");
    }catch(err){
        console.log(err)
    }
})

// the show page
router.get("/:id", async function(req, res){
    try{
        var detailed = await Product.findById(req.params.id).populate("comments").exec();
        res.render("details", {detailed});
    }catch(err){
        console.log(err)
    }
});

//edit page
router.get("/:id/edit", middleware.isOwner, async function(req, res){
    try{
        var edit = await Product.findById(req.params.id);
        res.render("edit", {edit});
    }catch(err){
        console.log(err)
    }
});

//Post Update route
router.put("/:id", middleware.isOwner, async function(req, res){
    try{
        var edit = await Product.findByIdAndUpdate(req.params.id, req.body.update);
        res.redirect("/" + req.params.id);
    }catch(err){
        console.log(err)
    }
});

//Post delete route
router.post("/:id", middleware.isOwner, async function(req, res){
    try{
        var deletePost = await Product.findByIdAndRemove(req.params.id);
        res.redirect("/allproduct");
    }catch(err){
        res.redirect("/"+ req.params.id)
    }
});

module.exports = router;