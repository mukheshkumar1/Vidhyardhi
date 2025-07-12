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

// Routes
import authRoutes from "./routes/authRoute.js";
import studentRoutes from "./routes/studentRoute.js";
import staffRoutes from "./routes/staffRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import registerRoutes from "./routes/registerRoute.js";
import homeworkRoutes from "./routes/homeworkRoute.js";
import holidayEventRoutes from "./routes/holidayRoute.js";
import driveProxyRoutes from "./routes/proxyRoute.js";

// Config
dotenv.config();
const app = express(); 
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⏰ Cron Job: Clear expired homeworks hourly
cron.schedule('0 * * * *', () => {
  deleteExpiredHomeworks();
});

// 🌐 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🌍 Allowed origins
const allowedOrigins = [
  "http://localhost:5173",               // Local dev
  "https://vidhyardhi.vercel.app"        // Deployed frontend (✅ no trailing slash)
];

// 🧪 Debug: Log incoming origins
app.use((req, res, next) => {
  console.log("Incoming Request Origin:", req.headers.origin);
  next();
});

// 🛡️ CORS Setup
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// 📁 File Upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, "profile"),
  createParentPath: true,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
}));

// 📦 Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/holiday", holidayEventRoutes);
app.use("/api/proxy", driveProxyRoutes);

// 🔓 Serve static files
app.use('/public', express.static('public'));

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
