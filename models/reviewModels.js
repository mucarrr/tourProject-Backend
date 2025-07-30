import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review is required"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "Rating is required"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "Tour is required"]
    },
    anonymous: {
        type: Boolean,
        default: false
    },
},
{
    timestamps: true
}
)

reviewSchema.pre(/^find/, function(next){
    if(!this.anonymous){
        this.populate({
            path: "user",
            select: "name photo _id"
        })
    }else this.user = undefined;
    
    this.populate({
        path: "tour",
        select: "name price _id"
    })
    next();
})

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });


export const Review = mongoose.model("Review", reviewSchema);