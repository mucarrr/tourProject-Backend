import express from "express";
import { getAllUsers } from "../controllers/userControllers.js";
import { login, register, protect } from "../controllers/authControllers.js";
const router = express.Router();

router.get("/", protect, getAllUsers);
router.post("/login", login);
router.post("/register", register);

export default router;