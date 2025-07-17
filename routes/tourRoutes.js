import express from "express";
import { getAllTours, getTourById, createTour } from "../controllers/tourControllers.js";
import formatQuery from "../utils/formatQuery.js";
const router = express.Router();

router.get("/", formatQuery,getAllTours);
router.get("/:id", getTourById);
router.post("/", createTour);

export default router;