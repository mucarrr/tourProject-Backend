import mongoose from "mongoose";
import validator from "validator";

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        unique: [true, "Name must be unique"],
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [40, "Name must be less than 40 characters long"],
        validate: [
        validator.isAlpha, "Name must only contain letters"
        ]
    },
    duration: {
        type: Number,
        required: [true, "Duration is required"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "Max group size is required"]
    },
    difficulty: {
        type: String,
        required: [true, "Difficulty is required"],
        enum: {
            values: ["easy", "medium", "difficult"],
            message: "Difficulty must be either easy, medium or difficult"
        }
    },
    ratingsAverage: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating must be at most 5"],
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "Price is required"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {return val < this.price},
            message: "Discount price must be less than the regular price"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, "Summary is required"]
    },
    imageCover: {
        type: String,
        required: [true, "Image cover is required"]
    },
    images: [String],
    startDates: [Date],
    createdAt: {
        type: Date,
        default: new Date()
    },
    hour: {
        type: Number,
    },
    quides:[{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }]
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
)

tourSchema.virtual('slug').get(function(){
   return this.name.toLowerCase().replaceAll(" ", "-");
})
tourSchema.pre('save', function(next){
    this.hour = this.duration * 24;
    next();
})
tourSchema.pre(/^find/, function(next){
    this.populate({
        path: "quides",
        select: "-__v -password -active"
    })
    next();
})

const Tour = mongoose.model("Tour", tourSchema);

export default Tour;