import mongoose from "mongoose";
import Tour from "./tourModels.js";

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



// Ortalama hesaplama fonksiyonu
const calculateAverage = async (tourId) => {
    const Review = mongoose.model('Review');
    const stats = await Review.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: "$tour",
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ])
   console.log(stats, "stats")

   if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: stats[0].avgRating,
        ratingsQuantity: stats[0].nRating
    })
   }else{
    await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: 3,
        ratingsQuantity: 0
    })
   }
}

reviewSchema.post("save", async function(){
        await calculateAverage(this.tour)
})

// Update işlemleri için
reviewSchema.post(/^findOneAndUpdate/, async function(doc){
    if(doc && doc.tour) {
        await calculateAverage(doc.tour._id)
    }
})

// Delete işlemi için özel middleware
reviewSchema.pre(/^findOneAndDelete/, async function(next){
    const doc = await this.model.findOne(this.getQuery());
    if(doc) {
        this.tourId = doc.tour;
    }
    next();
})

reviewSchema.post(/^findOneAndDelete/, async function(){
    if(this.tourId) {
        await calculateAverage(this.tourId);
    }
})


export const Review = mongoose.model("Review", reviewSchema);