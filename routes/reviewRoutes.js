import express from "express";
import { getAllReviews, createReview } from "../controllers/reviewControllers.js";
import { protect, restrictTo } from "../controllers/authControllers.js";

const router = express.Router();

router.route("/").get(getAllReviews).post(protect, createReview);

export default router;