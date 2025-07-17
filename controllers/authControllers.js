import User from "../models/userModels.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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