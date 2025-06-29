import express from 'express';
import {
  submitHomework,
  markAsChecked,
  deleteHomework,
  assignHomework,
  getStudentHomeworks,
  getHomeworksByStaff,
  getSubmissionsByHomeworkId,
  getHomeworkByStudentClass,
} from '../controllers/homework.controller.js';
import protectStudentRoute from '../middleware/protectRoute.js';
import { requireStaff } from '../middleware/requireStaff.js';

const router = express.Router();

router.post('/submit/:homeworkId', protectStudentRoute,submitHomework);
router.post('/mark',requireStaff, markAsChecked);
router.get('/submissions/:homeworkId/submissions', getSubmissionsByHomeworkId);

router.delete('/:homeworkId',requireStaff, deleteHomework);
router.post("/assign",requireStaff, assignHomework);
router.get('/student/:studentId',protectStudentRoute, getStudentHomeworks);
router.get("/by-staff",requireStaff,getHomeworksByStaff);
router.get('/student-class', protectStudentRoute, getHomeworkByStudentClass);

export default router;
