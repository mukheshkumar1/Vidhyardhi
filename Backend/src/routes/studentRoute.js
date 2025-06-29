import express from "express";
import {
  createRazorpayOrder,
  getClassLeaderCandidates,
  getStudentAcademicDetails,
  getStudentAttendance,
  getStudentProfile,
  payFees,
  verifyRazorpayPayment,
  voteForLeader,
} from "../controllers/student.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import { getStudentGallery } from "../controllers/student.gallery.controller.js";


const router = express.Router();

router.get("/profile", protectRoute, getStudentProfile);

router.post("/:studentId/pay", protectRoute, payFees);

router.get("/:studentId/academic-details", protectRoute, getStudentAcademicDetails);

router.get("/attendance", protectRoute, getStudentAttendance);

router.post("/create-order",protectRoute, createRazorpayOrder);

router.post("/verify-payment",protectRoute, verifyRazorpayPayment);

router.post("/vote", protectRoute, voteForLeader)

router.get("/leader", protectRoute, getClassLeaderCandidates)

router.get("/:studentId/gallery", getStudentGallery);


export default router;
