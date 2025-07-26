import express from "express";
import { getAllTours, getTourById, createTour, getTourStats, getMonthlyPlan, aliasTopTours } from "../controllers/tourControllers.js";
import formatQuery from "../utils/formatQuery.js";
import { protect, restrictTo } from "../controllers/authControllers.js";
const router = express.Router();

router.route("/top-5-tours").get(aliasTopTours, getAllTours);
router.get("/", protect, formatQuery,getAllTours);
router.get("/tour-stats", protect, restrictTo("admin"), getTourStats);
router.get("/monthly-plan/:year", protect, restrictTo("admin"), getMonthlyPlan);
router.get("/:id", protect, getTourById);
router.post("/", protect, restrictTo("admin"), createTour);


export default router;