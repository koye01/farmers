var mongoose = require("mongoose");
var productSchema = new mongoose.Schema({
    name: String,
    image: [
       String
    ],
    description: String,
    price: String,
    phone: String,
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
            username: String
        },
    
});
module.exports = mongoose.model("Product", productSchema);