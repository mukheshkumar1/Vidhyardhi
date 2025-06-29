import express from "express";
import {
  adminSignup,
  adminLogin,
  staffLogin,
  studentLogin,
  logout,
  forgotPassword,
  verifyOtpAndResetPassword
} from "../controllers/auth.controller.js";
import {isAdmin} from "../middleware/isAdmin.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// Signups
           // Staff signup
router.post("/admin/signup", adminSignup);

// Logins
router.post("/login/admin", adminLogin);
router.post("/login/staff", staffLogin);
router.post("/login/student", studentLogin);

//forgot and reset
router.post("/forgot-password",  forgotPassword);
router.post("/reset-password", verifyOtpAndResetPassword);

// Auth
router.post("/logout", logout);

// Students


export default router;
