import express from "express";
import { addStaff, addStudent, deleteStaff, deleteStudent, getAdmin, getAttendanceByClass,
        getStaff, getStudentAcademicDetails, getStudentsByClass, getStudentsGroupedByClass,
        promoteAllStudentsToNextGrade, toggleAdminRights, 
        updateProfile, updateStaffProfileImage, 
        updateStudentProfileImage, addPhotosToGallery, 
        getGallery, 
        deleteGalleryImage, updateStaffPermissions, 
        getEvents, addEvent, updateEvent, deleteEvent, 
        getAllSchoolImages, deleteSchoolImage, 
        addPhotosToSchoolImages, 
        addBulkStudents, 
        assignClassLeader, 
        getClassLeadersByMonth,
        getTopLeadersOfYear,
        setClassLeaderCandidates,
        getVotingStats,
        getVotingPeriod,
        setVotingDeadline,
        getClassLeaderCandidates,
        closeVotingByClass,
        getVotingStatusByClass,
        getStudentFeeDetails,
        promoteSingleStudent,
        recordDirectFeePayment,
        markStaffAttendance,
        getWeeklyAttendanceSummary,
        markBulkStaffAttendance,
        getStaffAttendanceReport,
        editAdminProfile,
        updateAdminProfileImage,
        getAdminProfile} from "../controllers/admin.controller.js";
import { getAllStudentsAttendance } from "../controllers/staff.controller.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {  deleteStudentGalleryImages, uploadStudentGalleryImages } from "../controllers/student.gallery.controller.js";


const router = express.Router();



router.post("/student/add",isAdmin, addStudent);
router.delete("/student/:studentId/delete", isAdmin, deleteStudent);
router.get("/students/:className", isAdmin ,getStudentsByClass);
router.get("/students", isAdmin, getStudentsGroupedByClass);
router.get("/students/attendance", isAdmin, getAllStudentsAttendance);
router.post("/staff/add", isAdmin,addStaff);   
router.get("/staff", isAdmin, getStaff);
router.get("/admin", isAdmin, getAdmin);
router.delete("/staff/:staffId/delete", isAdmin, deleteStaff);
router.patch("/staff/:staffId/toggle-Admin", isAdmin,toggleAdminRights);
router.post("/students/:studentId/promote", isAdmin, promoteSingleStudent);
router.post("/students/promote", isAdmin, promoteAllStudentsToNextGrade);
router.get("/attendance/class",isAdmin,getAttendanceByClass);
router.get("/students/:studentId/details",isAdmin,getStudentAcademicDetails);
router.put('/students/update/:studentId', updateProfile);
router.put("/students/:studentId/update-profile-picture",isAdmin, updateStudentProfileImage);
router.put("/staff/:staffId/update-profile-picture",isAdmin, updateStaffProfileImage);
router.post("/gallery/add", isAdmin, addPhotosToGallery);
router.get("/gallery", getGallery);
router.delete('/gallery/delete',isAdmin, deleteGalleryImage);
router.put("/staff/:staffId/permissions", isAdmin, updateStaffPermissions);
router.get("/getevents", getEvents);
router.post("/addevents", isAdmin,addEvent);
router.put("/:id/update", isAdmin, updateEvent);
router.delete("/:id/delete", isAdmin, deleteEvent);
router.post('/school-images/add', isAdmin, addPhotosToSchoolImages);
router.get('/school-images', getAllSchoolImages);
router.delete('/school-images/:id', isAdmin, deleteSchoolImage);
router.post("/add-bulk",isAdmin, addBulkStudents);
router.post("/voting/deadline", isAdmin, setVotingDeadline);
router.get("/voting/deadline/:className",  getVotingPeriod);
router.get("/voting/stats/:className", isAdmin, getVotingStats);
router.post("/voting/assign", isAdmin, assignClassLeader);
router.get("/leaders/:year/:month", isAdmin, getClassLeadersByMonth);
router.get("/top-leaders/:className/:year", isAdmin, getTopLeadersOfYear);
router.post("/select-classleader", isAdmin, setClassLeaderCandidates)
router.get("/voting/candidates",isAdmin, getClassLeaderCandidates);
router.post("/voting/close",isAdmin,closeVotingByClass);
router.get("/voting/status",getVotingStatusByClass);
router.get("/student/:studentId/fees",isAdmin, getStudentFeeDetails);
router.post("/students/:studentId/fee-payment", isAdmin, recordDirectFeePayment);
router.post("/students/:studentId/gallery", isAdmin,  uploadStudentGalleryImages);
router.delete("/student/gallery/:studentId/delete",isAdmin, deleteStudentGalleryImages);
router.post("/staff/attendance", isAdmin, markStaffAttendance);
router.get("/staff/:staffId/attendance/weekly", isAdmin, getWeeklyAttendanceSummary);
router.post("/staff/attendance/bulk",isAdmin, markBulkStaffAttendance);
router.get("/staff/:staffId/attendance/report",isAdmin, getStaffAttendanceReport);
router.put("/admin/profile",isAdmin, editAdminProfile);
router.put("/admin/image", isAdmin, updateAdminProfileImage);
router.get("/profile", isAdmin, getAdminProfile);

export default router;
