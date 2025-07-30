import express from "express";
import { getAllTours, getTourById, createTour, getTourStats, getMonthlyPlan, aliasTopTours } from "../controllers/tourControllers.js";
import formatQuery from "../utils/formatQuery.js";
import { protect, restrictTo } from "../controllers/authControllers.js";
const router = express.Router();

router.route("/top-5-tours").get(aliasTopTours, getAllTours);
router.route("/").get(protect, formatQuery,getAllTours).post(protect, restrictTo("admin"), createTour);
router.get("/tour-stats", protect, restrictTo("admin"), getTourStats);
router.get("/monthly-plan/:year", protect, restrictTo("admin"), getMonthlyPlan);
router.route("/:id").get(protect, getTourById);


export default router;