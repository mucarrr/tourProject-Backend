import { Review } from "../models/reviewModels.js";
import { getAll, createOne } from "./handlerFactory.js";

export const getAllReviews = async(req, res) => getAll(Review, req, res);
export const createReview = async(req, res) => createOne(Review, req, res);