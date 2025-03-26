import express from "express";
import dotenv from "dotenv";
import { dbConnect } from "./config/database.js";
import userRoutes from "./routes/User.routes.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
dbConnect();

app.use("/api/v1/", userRoutes);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
