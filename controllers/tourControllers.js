import Tour from "../models/tourModels.js";
import { getAll, getSingle, createOne   } from "./handlerFactory.js";

export const createTour = async(req, res) => createOne(Tour, req, res);         

export const aliasTopTours = async(req, res, next) => {
    req.query.limit = 5;
    req.query.sort = "-ratingsAverage, -ratingsQuantity";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";
    req.formattedParams.price = { $lte: 1000 };
    next();
}   


export const getAllTours = async(req, res) => getAll(Tour, req, res);

export const getTourById = async(req, res) => getSingle(Tour, req, res); 

export const getTourStats = async(req, res) => {
    try{
        const stats = await Tour.aggregate([
            {
                $match: {
                    ratingsAverage: { $gte: 4.7 }
                }
            },
            { 
                $group: { 
                    _id: "$difficulty", 
                    count: { $sum: 1 },
                    avgRating: { $avg: "$ratingsAverage" },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" }
                }},
            {
                $sort: {
                    avgPrice: 1
                }
            }
        ]);
        res.status(200).json({
            success: true,
            message: "Tour stats fetched successfully",
            data: stats
        });
    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const getMonthlyPlan = async(req, res) => {
    try{
        const year = Number(req.params.year);
        const monthlyPlan = await Tour.aggregate([
            {
               $unwind: {
                path: "$startDates",
               }
            },
            {
                $match: {
                    startDates: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`)}
                }
            },
            {
                $group: {
                    _id: { $month: "$startDates" }, 
                    count: { $sum: 1 },
                    tours: { $push: "$name" },
                    avgPrice: { $avg: "$price" },
                    avgRating: { $avg: "$ratingsAverage" }
                }
            },
            {
                $addFields: {
                    month: "$_id"
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    count: 1,
                    tours: 1,
                    avgPrice: 1,
                    avgRating: 1
                }
            },
            {
                $sort: {
                    month: 1
                }
            }
        ]);
        res.status(200).json({
            success: true,
            message: "Monthly plan fetched successfully",
            data: monthlyPlan
        });
    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}