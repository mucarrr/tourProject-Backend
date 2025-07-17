import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"],
        validate: {validator: validator.isEmail, message: "Invalid email"}
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        validate: {validator: validator.isStrongPassword, message: "Password is not strong enough"}
    },
    confirmPassword: {
        type: String,
        required: [true, "Confirm password is required"],
        validate: {validator: function(val) {return val === this.password}, message: "Passwords do not match"}
    },
    photo: {
        type: String,
        default: "https://via.placeholder.com/150"
    },
    role: {
        type: String,
        enum: ["user", "admin", "guide", "lead-guide"],
        default: "user"
    },
    active: {
        type: Boolean,
        default: true
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
})
userSchema.pre("save", async function(next){
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
    
});

const User = mongoose.model("User", userSchema);

export default User; 