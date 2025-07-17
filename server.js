import express from "express";
import userRoutes from "./routes/userRoutes.js";
import tourRoutes from "./routes/tourRoutes.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

mongoose.connect("mongodb://localhost:27017/toursDB")
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((err) => {
  console.log(err);
});
app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/tours", tourRoutes);





app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

