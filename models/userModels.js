import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
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
userSchema.pre("save", function(next){
    if(!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
}
userSchema.methods.correctPassword = function(password, hashedPassword){
    return bcrypt.compare(password, hashedPassword);
}
const User = mongoose.model("User", userSchema);

export default User; 