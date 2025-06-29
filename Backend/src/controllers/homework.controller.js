import fs from 'fs';
import { google } from 'googleapis';
import Homework from '../models/homework.model.js';
import Student from '../models/student.model.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Staff from '../models/user.model.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../../apikey.json'),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const uploadToDrive = async (filePath, fileName, folderId) => {
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = { name: fileName, parents: [folderId] };
  const media = { mimeType: 'application/pdf', body: fs.createReadStream(filePath) };

  const file = await drive.files.create({ resource: fileMetadata, media, fields: 'id' });
  const fileId = file.data.id;

  await drive.permissions.create({
    fileId,
    requestBody: { type: 'anyone', role: 'reader' },
  });

  const result = await drive.files.get({ fileId, fields: 'webViewLink' });
  return result.data.webViewLink;
};

export const assignHomework = async (req, res) => {
  const { title, className, subject, description, deadline } = req.body;
  const staffId = req.user?.id || req.user?._id; // Extract from logged-in staff

  if (!title || !className || !subject || !description || !deadline || !staffId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newHomework = new Homework({
      title,
      className,
      subject,
      description,
      deadline,
      createdBy: staffId, // auto-set from logged-in staff
    });

    await newHomework.save();

    // Assign homework to all students in the class
    await Student.updateMany(
      { className },
      {
        $push: {
          homework: {
            homeworkId: newHomework._id,
            status: 'Not Submitted',
          },
        },
      }
    );

    res.status(201).json({
      message: 'Homework assigned successfully',
      homework: newHomework,
    });
  } catch (err) {
    console.error('Assign Homework Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const submitHomework = async (req, res) => {
  const studentId = req.user?.id || req.user?._id;
  const { homeworkId } = req.params;
  const file = req.files?.file;

  if (!studentId) {
    return res.status(401).json({ message: "Unauthorized: Student not logged in" });
  }

  if (!homeworkId || !file) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const tempPath = file.tempFilePath;
    const driveLink = await uploadToDrive(tempPath, file.name, process.env.GDRIVE_FOLDER_ID);
    fs.unlinkSync(tempPath);

    const homework = await Homework.findById(homeworkId);
    if (!homework) return res.status(404).json({ message: "Homework not found" });

    const existingSubmission = homework.studentSubmissions.find(
      (s) => s.studentId.toString() === studentId.toString()
    );
    if (existingSubmission) {
      return res.status(400).json({ message: "Already submitted" });
    }

    homework.studentSubmissions.push({
      studentId,
      fileUrl: driveLink,
      status: "submitted",
      submittedAt: new Date(),
    });

    await homework.save();
    res.status(200).json({ message: "Homework submitted successfully" });
  } catch (err) {
    console.error("Submit Homework Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

  

  // Assuming Homework is your mongoose model for homework collection

export const markAsChecked = async (req, res) => {
  const { homeworkId, studentId, marks, comments } = req.body;

  try {
    const homework = await Homework.findById(homeworkId);
    if (!homework) return res.status(404).json({ message: 'Homework not found' });

    let submission = homework.studentSubmissions.find(
      (s) => s.studentId.toString() === studentId
    );

    if (!submission) {
      // Create new submission for physical submission
      submission = {
        studentId,
        status: 'checked',
        marks: marks || '',
        comments: comments || '',
        submitted: false,
        fileUrl: '',
      };
      homework.studentSubmissions.push(submission);
    } else {
      // Update existing submission
      submission.status = 'checked';
      submission.marks = marks || submission.marks;
      submission.comments = comments || submission.comments;
    }

    // Check if all submissions are checked
    const allChecked = homework.studentSubmissions.every((s) => s.status === 'checked');

    if (allChecked && !homework.fullyCheckedAt) {
      homework.fullyCheckedAt = new Date();
    }

    await homework.save();

    // Send updated submission back (optional, but good practice)
    const updatedSubmission = homework.studentSubmissions.find(
      (s) => s.studentId.toString() === studentId
    );

    res.status(200).json({ message: 'Marked as checked', updatedSubmission });
  } catch (err) {
    console.error('Mark as Checked Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  
  export const deleteExpiredHomeworks = async () => {
    const now = new Date();
    const expiredHomeworks = await Homework.find({
      fullyCheckedAt: { $exists: true },
      $expr: {
        $lte: [
          { $add: ["$fullyCheckedAt", 1000 * 60 * 60 * 24] }, // 24h
          now
        ]
      }
    });
  
    for (const hw of expiredHomeworks) {
      await Homework.findByIdAndDelete(hw._id);
      console.log(`Deleted expired homework: ${hw.title}`);
    }
  };

  export const deleteHomework = async (req, res) => {
    const { homeworkId } = req.params;
  
    try {
      const homework = await Homework.findById(homeworkId);
      if (!homework) return res.status(404).json({ message: 'Not found' });
  
      await Homework.findByIdAndDelete(homeworkId);
      res.status(200).json({ message: 'Homework deleted manually' });
    } catch (err) {
      console.error('Delete Homework Error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

  export const getStudentHomeworks = async (req, res) => {
    const { studentId } = req.params;
  
    try {
      const student = await Student.findById(studentId);
      if (!student) return res.status(404).json({ message: "Student not found" });
  
      const homeworks = await Homework.find({ className: student.className }).sort({ createdAt: -1 });
  
      const formattedHomeworks = homeworks.map((hw) => {
        const submission = hw.studentSubmissions.find(
          (s) => s.studentId.toString() === studentId
        );
  
        return {
          _id: hw._id,
          title: hw.title,
          description: hw.description,
          deadline: hw.deadline,
          status: submission ? "Submitted" : "Pending",
          fileUrl: submission?.fileUrl || "",
          marks: submission?.marks || null,
          comments: submission?.comments || "",
        };
      });
  
      res.status(200).json(formattedHomeworks); // ✅ send array, not { homeworks: [] }
    } catch (err) {
      console.error("Get Student Homework Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

  export const deleteStudentHomework = async (req, res) => {
    const { studentId, homeworkId } = req.params;
  
    try {
      // Remove submission from student's record
      const student = await Student.findById(studentId);
      if (!student) return res.status(404).json({ message: 'Student not found' });
  
      student.homework = student.homework.filter(hw => hw.homeworkId.toString() !== homeworkId);
      await student.save();
  
      // Remove student's submission from the homework document
      const homework = await Homework.findById(homeworkId);
      if (homework) {
        homework.studentSubmissions = homework.studentSubmissions.filter(
          s => s.studentId.toString() !== studentId
        );
        await homework.save();
      }
  
      res.status(200).json({ message: 'Student homework submission deleted successfully' });
    } catch (err) {
      console.error('Delete Homework Error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  

  // controller
// route: GET /api/homework/submissions/:homeworkId
export const getSubmissionsByHomeworkId = async (req, res) => {
  try {
    const { homeworkId } = req.params;

    // Step 1: Fetch the homework document
    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    // Step 2: Get all students of that class (use "className" as per your Student model)
    const students = await Student.find({ className: homework.className });

    // Step 3: Map submissions by studentId
    const submissionMap = {};
    for (const submission of homework.studentSubmissions) {
      submissionMap[submission.studentId.toString()] = submission;
    }

    // Step 4: Create response with submission status
    const result = students.map((student) => {
      const submission = submissionMap[student._id.toString()];
      return {
        studentId: student._id,
        studentName: student.fullName,
        status: submission ? submission.status : 'not_submitted',
        submitted: !!submission,
        fileUrl: submission?.fileUrl || '',
        marks: submission?.marks?.toString() || '',
        comments: submission?.comments || '',
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getSubmissionsByHomeworkId:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get homework by staff classes (pseudo-code)
export const getHomeworksByStaff = async (req, res) => {
  try {
    const staffId = req.user?.id || req.user?._id;

    if (!staffId) {
      return res.status(401).json({ message: 'Unauthorized - Staff not found' });
    }

    const homeworks = await Homework.find({ createdBy: staffId }).sort({ createdAt: -1 });

    // Group by className
    const grouped = homeworks.reduce((acc, hw) => {
      if (!acc[hw.className]) acc[hw.className] = [];
      acc[hw.className].push(hw);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    console.error('getHomeworksByStaff Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// controllers/homeworkController.js

export const getHomeworkByStudentClass = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID not found in request' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const className = student.className;

    const homeworkList = await Homework.find({ className }).sort({ deadline: -1 });

    // Map only the current student's submission data
    const enrichedHomework = homeworkList.map((hw) => {
      const studentSubmission = hw.studentSubmissions.find(
        (s) => s.studentId.toString() === studentId.toString()
      );

      return {
        _id: hw._id,
        title: hw.title,
        description: hw.description,
        deadline: hw.deadline,
        fileUrl: studentSubmission?.fileUrl || "",
        status: studentSubmission?.status === 'checked' ? 'Checked' : studentSubmission?.status === 'submitted' ? 'Submitted' : 'Not Submitted',
        marks: studentSubmission?.marks || null,
        comments: studentSubmission?.comments || "",
      };
    });

    res.status(200).json({ homework: enrichedHomework });
  } catch (err) {
    console.error('Error fetching homework by class:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};







 