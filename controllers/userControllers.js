import User from "../models/userModels.js";


export const getAllUsers = async(req, res) => {
    try{
        const users = await User.find();
        if(!users){
            return res.status(404).json({
                success: false,
                message: "No users found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            count: users.length,
            data: users
        });
    }catch(err){    
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
