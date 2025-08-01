import { Review } from "../models/reviewModels.js";
import { getAll, createOne, updateOne, deleteOne  } from "./handlerFactory.js";

export const getAllReviews = async(req, res) => getAll(Review, req, res);
export const createReview = async(req, res) => createOne(Review, req, res);
export const updateReview = async(req, res) => updateOne(Review, req, res);
export const deleteReview = async(req, res) => deleteOne(Review, req, res); 