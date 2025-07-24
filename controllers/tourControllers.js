import Tour from "../models/tourModels.js";
import { getAll, getSingle } from "./handlerFactory.js";

export const createTour = async(req, res) => {
    try{
        const tour = await Tour.create(req.body);
        res.status(201).json({
            success: true,
            message: "Tour created successfully",
            data: tour
        });
    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const getAllTours = async(req, res) => getAll(Tour, req, res);

export const getTourById = async(req, res) => getSingle(Tour, req, res); 