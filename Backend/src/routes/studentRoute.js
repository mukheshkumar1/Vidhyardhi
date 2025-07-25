import express from "express";
import {
  createRazorpayOrder,
  getClassLeaderCandidates,
  getStudentExtraCurricularDetails,
  getStudentAcademicDetails,
  getStudentAttendance,
  getStudentProfile,
  payFees,
  verifyRazorpayPayment,
  voteForLeader,
  checkStudentBirthday,
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

router.get("/:studentId", protectRoute, getStudentExtraCurricularDetails);

router.get("/birthday",protectRoute, checkStudentBirthday)


export default router;
