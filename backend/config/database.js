import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const dbConnect = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log("Database connection faild");
      console.log(err);
      process.exit(1);
    });
};
