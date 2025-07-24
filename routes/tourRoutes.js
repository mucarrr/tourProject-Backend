import express from "express";
import { getAllTours, getTourById, createTour } from "../controllers/tourControllers.js";
import formatQuery from "../utils/formatQuery.js";
import { protect, restrictTo } from "../controllers/authControllers.js";
const router = express.Router();

router.get("/", protect, formatQuery,getAllTours);
router.get("/:id", protect, getTourById);
router.post("/", protect, restrictTo("admin"), createTour);

export default router;