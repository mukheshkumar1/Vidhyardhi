import express from "express";
import multer from "multer";
import {
    
  calculateMonthlyAttendance,
  getClassPerformance,
  // calculateYearlyAttendance,
  getProfile,
  getStudentsByClass,
  markDailyAttendance,
  updateAttendance,
    updatePerformance,
  
  } from "../controllers/staff.controller.js";
import { requireStaff } from "../middleware/requireStaff.js";
import { forgotPasswordStaff, verifyOtpAndResetPasswordStaff } from "../controllers/auth.controller.js";
import { getStudentsGroupedByClass } from "../controllers/admin.controller.js";

const upload = multer({ dest: 'uploads/' }); 
const router = express.Router();

router.put("/:studentId/grades", requireStaff, updatePerformance);
router.get("/results/:className", requireStaff, getClassPerformance);
router.put("/:studentId/attendance", requireStaff, updateAttendance);
router.post("/forgotpassword", forgotPasswordStaff);
router.post("/resetpassword", verifyOtpAndResetPasswordStaff);
router.get("/students", getStudentsGroupedByClass);
router.get("/class/:className",requireStaff,getStudentsByClass)
router.post("/attendance/daily/:className",requireStaff, markDailyAttendance);
router.put("/attendance/monthly/:className/:month",requireStaff, calculateMonthlyAttendance);
// router.post("/attendance/yearly/:className", requireStaff,calculateYearlyAttendance);

router.get('/profile/staff',requireStaff,  getProfile);




export default router;