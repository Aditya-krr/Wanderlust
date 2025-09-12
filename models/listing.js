const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const listingSchema = new Schema ({
    title: {
        type:String,
        required: true,
    },
    description:String,
    image: {
       
        
        filename:String,      
        url:String
    },
       
    price:Number,
    location:String,
    country:String,
    review : [{
        type: Schema.Types.ObjectId,
        ref : "Review"
    }],
    owner : { 
        type: Schema.Types.ObjectId,
        ref : "User"
    },
    geometry: {
     type: {
        type: String, 
        enum: ["Point"],
        
        },
     coordinates: {
        type: [Number],
        required: true,
        },
    },
    category : {
         type: String,
        enum : ["trending", "rooms", "Cities","Farms" , "Mountains", "Arctic" ,"Camping", "Castles","Pools"]

    }
});
   

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({_id: {$in: listing.review}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;