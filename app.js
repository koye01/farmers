var express = require("express"),
    app = express(),
    Product = require("./models/produce"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    Notification = require("./models/notification"),
    multer = require("multer"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require("mongoose"),
    path = require("path")
    passport = require("passport"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    expressSession = require("express-session")

    var productRoute = require("./routes/auth");
    var dynamicRoute = require("./routes/allproduct");
    var commentRoute = require("./routes/comment");
const flash = require("connect-flash/lib/flash");

mongoose.connect("mongodb://localhost/Product");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static( __dirname +"/public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(expressSession({
    secret: "Rusty is my best dog",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async function(req, res, next){
    if(req.user) {
        try {
            var user = await User.findById(req.user._id).populate('notifications', null, {isRead: false}).exec();
            res.locals.notifications = user.notifications.reverse();
        } catch(err) {
            console.log(err.message);
        }
    }
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
})

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
//essential route
// Product.create({
//     name: "Obasanjo chicks",
//     image: "pics\chicks.jpg",
//     description: "These are the early day old chicks that i use to sell"
// });
app.use(productRoute);
app.use(dynamicRoute);
app.use(commentRoute);





app.listen("3000", function(){
    console.log("Your app is loading")
});