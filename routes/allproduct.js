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


// //livestock page
// router.get("/livestocks", async function(req, res){
//     try{
//         var livestocks = await Product.find({"category": "Livestocks", "adminpost": "true"});
//         res.render("categories/livestocks", {livestocks});
//     }catch(err){
//         console.log(err)
//     }
// });
// //vegetable page
// router.get("/vegetables", async function(req, res){
//     try{
//         var veggies = await Product.find({"category": "Vegetables", "adminpost": "true"});
//         res.render("categories/vegetables", {veggies});
//     }catch(err){
//         console.log(err)
//     }
// });
// //seedling page
// router.get("/seedlings", async function(req, res){
//     try{
//         var seedlings = await Product.find({"category": "Seedlings", "adminpost": "true"});
//         res.render("categories/seedlings", {seedlings});
//     }catch(err){
//         console.log(err)
//     }
// });
// //food page
// router.get("/food", async function(req, res){
//     try{
//         var food = await Product.find({"category": "Food", "adminpost": "true"});
//         res.render("categories/food", {food});
//     }catch(err){
//         console.log(err)
//     }
// });
// //farmequipment page
// router.get("/farmequips", async function(req, res){
//     try{
//         var farmequips = await Product.find({"category": "Farm equipments", "adminpost": "true"});
//         res.render("categories/farmequips", {farmequips});
//     }catch(err){
//         console.log(err)
//     }
// });
// //Others
// router.get("/others", async function(req, res){
//     try{
//         var others = await Product.find({"category": "Others", "adminpost": "true"});
//         res.render("categories/others", {others});
//     }catch(err){
//         console.log(err)
//     }
// });

// //admin page
// router.get("/adminpost", async function(req, res){
//     try{
//         var post = await Product.find({"adminpost": "false"});
//         res.render("categories/post", {post});
//     }catch(err){
//         console.log(err)
//     }
// });

// //delete post from the admin server
// router.post("/adminpost", async function(req, res){
//     try{
//         var deletePost = await Product.findByIdAndRemove(req.params.id);
//         res.redirect("/");
//     }catch(err){
//         res.redirect("/"+ req.params.id)
//     }
// });

// router.get("/approvepost", async function(req, res){
//     try{
//         var approve = await Product.find({"adminpost": false});
//         approve[0].adminpost = true;
//         approve[0].save();
//         res.redirect("/");
//     }catch(err){
//         res.redirect("/"+ req.params.id)
//     }
// });

// //index page
// router.get("/", async function(req, res){
//     try{
//         var product = await Product.find({});
//         var user = await User.find({});
//         res.render("index",{product, user});
//     }catch(err){
//         console.log(err)
//     }
// });
// router.post("/search", async function(req, res){
//     try{
//         var regex = new RegExp(["", req.body.productSearch, "$"].join(""), "i");
//         var product = await Product.find({name: regex});
//         res.render("productsearch", {product});
//     }catch(err){
//         res.redirect("/");
//     }
// });

// router.post("/usersearch", async function(req, res){
//     try{
//         var regex = new RegExp(["", req.body.userSearch, "$"].join(""), "i");
//         var findUser = await User.find({username: regex});
//         res.render("usersearch", {findUser});
//     }catch(err){
//         res.redirect("/");
//     }
// });

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
        var category = req.body.category;
        var name = req.body.name;
        var price = req.body.price;
        var arr = req.files.image;
        var image = ["/pics/" + arr[0].filename, "/pics/" + arr[1].filename, "/pics/" + arr[2].filename];
        var description = req.body.description;
        var author ={
            id: req.user._id,
            username: req.user.username,
            phone: req.user.phone
        }
        var allproduct = {category: category, name: name, price: price, image: image, description: description, author: author};
        var newProduce = Product.create(allproduct);
        var dataid = (await newProduce).id;
        var user = await User.findById(req.user._id).populate('followers').exec();
        var newNotification = {
            post: {
                username: req.user.username,
                productId: dataid
            }
        }
            for(var follower of user.followers) {
                var notification = await Notification.create(newNotification);
                follower.notifications.push(notification);
                follower.save();
            }
            //redirect back to allproducts page
            res.render("index", {success: "Your produce have been uploaded successfully!"});
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
        res.redirect("/" + req.params.id, {edit});
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