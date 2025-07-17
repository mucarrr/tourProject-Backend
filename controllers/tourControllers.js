import Tour from "../models/tourModels.js";
import { getAll } from "./handlerFactory.js";

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

export const getTourById = async(req, res) => {
    try{
        const tour = await Tour.findById(req.params.id);
        if(!tour){
            return res.status(404).json({
                success: false,
                message: "Tour not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Tour fetched successfully",
            data: tour
        });
    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
