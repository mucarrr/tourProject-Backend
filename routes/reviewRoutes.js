import express from "express";
import { getAllReviews, createReview, updateReview, deleteReview } from "../controllers/reviewControllers.js";
import { protect, restrictTo } from "../controllers/authControllers.js";

const router = express.Router();

router.route("/").get(getAllReviews).post(protect, createReview);
router.route("/:id").patch(protect, updateReview).delete(protect, deleteReview);

export default router;