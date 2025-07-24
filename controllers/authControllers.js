import User from "../models/userModels.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendMail } from "../utils/sendMail.js";

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
        const resetURL = `${req.protocol}://${req.get("host")}/reset-password/${resetToken}`;
        await sendMail(user.email, "Password reset", "Click the link to reset your password", `<h2> Hello ${user.name}</h2> <p>Forgot your password? Click the link to reset it: <a href="${resetURL}">Reset Password</a></p>`);
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
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return res.status(404).json({
            success: false,
            message: "User not found"
        });
    }
}