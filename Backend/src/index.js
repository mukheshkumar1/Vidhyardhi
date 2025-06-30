import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cron from "node-cron";

// Controllers and utility for cleanup
import { deleteExpiredHomeworks } from "../src/controllers/homework.controller.js";
import "../src/utils/clearHomework.js";

// Routes
import authRoutes from "./routes/authRoute.js";
import adminRoutes from "./routes/adminRoute.js";
import studentRoutes from "./routes/studentRoute.js";
import staffRoutes from "./routes/staffRoute.js";
import registerRoutes from "./routes/registerRoute.js";
import homeworkRoutes from "./routes/homeworkRoute.js";
import holidayEventRoutes from "./routes/holidayRoute.js";
import driveProxyRoutes from "./routes/proxyRoute.js";

// Environment setup
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🕒 Run cron job hourly
cron.schedule("0 * * * *", () => {
  deleteExpiredHomeworks();
});

// 🧠 Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://vidhyardhi.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "profile"),
    createParentPath: true,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  })
);

// 🧭 API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/holiday", holidayEventRoutes);
app.use("/api/proxy", driveProxyRoutes);

// Static folder
app.use("/public", express.static("public"));

// 🧨 404 fallback (optional)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  connectDB();
});
