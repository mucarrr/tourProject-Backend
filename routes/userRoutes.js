import express from "express";
import { getAllUsers, updateMe, uploadUserImage, resizeUserImage } from "../controllers/userControllers.js";
import { login, register, protect, logout, forgotPassword, resetPassword, updatePassword} from "../controllers/authControllers.js";
const router = express.Router();

router.get("/", protect, getAllUsers);
router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
router.patch("/update-password", protect, updatePassword);
router.patch("/update-me", protect, uploadUserImage, resizeUserImage, updateMe);

export default router;