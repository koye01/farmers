var mongoose = require("mongoose");
var productSchema = new mongoose.Schema({
    name: String,
    image: [
       String
    ],
    description: String,
    price: String,
    phone: String,
    category: String,
    adminpost: {type: Boolean, default: false},
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    author:{
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String,
            phone: String
        },
    
});
module.exports = mongoose.model("Product", productSchema);