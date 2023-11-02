import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import mentorRoute from "./routes/mentorRoute.js";
import studentRoute from "./routes/studentRoute.js";

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/mentor", mentorRoute);
app.use("/api/student", studentRoute);

app.get("/", (req, res) => {
  res.send("<h1>Welcome to backend</h1>");
});

app.listen("5000", () => {
  console.log("server running at port 5000");
});
