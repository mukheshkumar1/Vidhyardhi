import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import { fileURLToPath } from 'url';
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import cron from 'node-cron';
import { deleteExpiredHomeworks } from '../src/controllers/homework.controller.js';
import "../src/utils/clearHomework.js";

import authRoutes from "./routes/authRoute.js";
import studentRoutes from "./routes/studentRoute.js";
import staffRoutes from "./routes/staffRoute.js";
 import adminRoutes from "./routes/adminRoute.js";
import registerRoutes from "./routes/registerRoute.js";
import homeworkRoutes from "./routes/homeworkRoute.js";
import holidayEventRoutes from "./routes/holidayRoute.js";
import driveProxyRoutes from "./routes/proxyRoute.js";
dotenv.config();

const app = express(); 
const PORT = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cron.schedule('0 * * * *', () => {
    deleteExpiredHomeworks();
  });
  
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser())
app.use(cors({
    origin: 'https://vidhyardhi.vercel.app/',
    credentials: true,
  }));

  app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname,"profile"),
    createParentPath:true,
    limits:{
        fileSize: 5*1024*1024  //2MB max FileSize
    }
}))


app.use("/api/auth",authRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/student",studentRoutes)
app.use("/api/staff",staffRoutes)
app.use("/api/register", registerRoutes)
app.use("/api/homework", homeworkRoutes);
app.use("/api/holiday", holidayEventRoutes);
app.use("/api/proxy", driveProxyRoutes);

app.use('/public', express.static('public'));
app.listen(5000, ()=>{
    console.log("Server is running on port " +  PORT);
    connectDB();
})
