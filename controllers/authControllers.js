import User from "../models/userModels.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendMail } from "../utils/sendMail.js";
import crypto from "crypto"; 

const signToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXP || "1d"});
}
const createSendToken = (user, code, res) => {
    const token = signToken(user._id);
     // 2.yontem // cookiye kaydetmek icin 
     res.cookie("jwt", token, {
        expires: new Date(Date.now() + parseInt(process.env.JWT_EXP || 1) * 24 * 60 * 60 * 1000),
        httpOnly: true,
       // secure : true,
       
    });
    // 1.yontem // fe ye response olarak donmek icin 
    user.password = undefined;
    user.__v = undefined;
    res.status(code).json({message: "success", token, user});
   
}

export const protect = async(req, res, next) => {
    let token = req.cookies.jwt;
    if(!token){
        return res.status(401).json({
            success: false,
            message: "Unauthorized - No token found in cookies" 
        });
    }
    
    let decoded;
    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(err){
        if(err.message === "jwt expired"){
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
    const activeUser = await User.findById(decoded.id).select("-password -confirmPassword -__v");
    if(!activeUser.active){
        return res.status(401).json({
            success: false,
            message: "User is not active"
        });
    }
    if(activeUser.passwordChangedAt){
        const passwordChangedSeconds = parseInt(activeUser.passwordChangedAt.getTime() / 1000, 10);
        if(decoded.iat < passwordChangedSeconds){
            return res.status(401).json({
                success: false,
                message: "Password changed recently, please login again"
            });
        }
    }
    req.user = activeUser;
    next();
}

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this resource"
            });
        }
        next();
    }
}

export const register = async(req, res) => {
    try{
       const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
       });
       createSendToken(newUser, 201, res);
    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

export const login = async(req, res) => {
    if(!req.body.email || !req.body.password){
        return res.status(400).json({
            success: false,
            message: "Please provide email and password"
        });
    }
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return res.status(401).json({
            success: false,
            message: "Invalid email"
        });
    }
    if(!user.active){
        return res.status(401).json({
            success: false,
            message: "User is not active"
        });
    }
    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
    if(!isPasswordCorrect){
        return res.status(401).json({
            success: false,
            message: "Invalid password"
        });
    }

    createSendToken(user, 200, res);
    
};

export const logout = async(req, res) => {
    res.clearCookie("jwt");
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}

export const forgotPassword = async(req, res) => {
    try{
        const user = await User.findOne({ email: req.body.email});
        console.log(user);
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const resetToken = user.createPasswordResetToken();
        await user.save({validateBeforeSave: false});
        const resetURL = `${req.protocol}://${req.headers.host}/api/users/reset-password/${resetToken}`;
        await sendMail(user.email, "Password reset", "Click the link to reset your password", `<h2> Hello ${user.name}</h2> <p>Forgot your password? Click the link to reset it: <a href="${resetURL}">${resetURL}</a></p>`);
        return res.status(200).json({
            success: true,
            message: "Email sent successfully"
        });
    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const resetPassword = async(req, res) => { 
    try{
        const token = req.params.token;
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: {$gt: Date.now()}
        });
        if(!user){
            return res.status(400).json({
                success: false,
                message: "Token is invalid or has expired"  
            });
        }
        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        createSendToken(user, 200, res);
    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const updatePassword = async(req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if(!user || !user.active){
            return res.status(404).json({
                success: false,
                message: "User not found or inactive"
            });
        }
        const isPasswordCorrect = await user.correctPassword(req.body.currentPassword, user.password);
        if(!isPasswordCorrect){ 
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }
        user.password = req.body.newPassword;
        user.confirmPassword = req.body.confirmPassword;
        await user.save();
        await sendMail(user.email, "Password updated", "Hello " + user.name + ", Your password has been updated successfully");
        // res.clearCookie("jwt");
        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}