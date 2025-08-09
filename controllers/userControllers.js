import User from "../models/userModels.js";   
import multer from "multer";
import sharp from "sharp";

// const upload = multer({
//     storage: multer.diskStorage({
//         destination: (req, file, cb) => {
//             // Klasör: public/image/users (var olan klasöre hizalandı)
//             cb(null, "public/image/users");
//         },
//         filename: (req, file, cb) => {
//             cb(null, file.originalname);
//         }
//     })
// })

// export const uploadUserImage = upload.single("photo");

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });
export const uploadUserImage = upload.single("photo");
export const resizeUserImage = async (req, res, next) => {
    if(!req.file) return next();
    req.file.filename = `${req.user._id}-${Date.now()}.webp`;
    await sharp(req.file.buffer).resize(100, 100).toFormat("webp").webp({ quality: 90 }).toFile(`public/image/users/${req.file.filename}`);
    next();
}

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
export const updateMe = async (req, res) => {
    try {
        let user = req.user;
        if (req.file) {
            user = await User.findByIdAndUpdate(
                req.user._id,
                { photo: `image/users/${req.file.filename}` },
                { new: true, runValidators: true }
            ).select("-password -__v");
        }
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

