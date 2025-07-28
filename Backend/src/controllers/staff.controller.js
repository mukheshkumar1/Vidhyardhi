import Student from "../models/student.model.js";
import dotenv from "dotenv";
import Staff from "../models/user.model.js";

dotenv.config();

export const updatePerformance = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required in params" });
    }

    const {formativeAssessment1, formativeAssessment2, formativeAssessment3, formativeAssessment4, summativeAssessment1,summativeAssessment2 } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Helper to calculate total, percentage, and grade
    const calculateStats = (marks) => {
      const subjects = Object.keys(marks);
      const total = subjects.reduce((sum, subject) => sum + Number(marks[subject]), 0);
      const maxTotal = subjects.length * 100;
      const percentage = ((total / maxTotal) * 100).toFixed(2);

      let grade = "F";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B+";
      else if (percentage >= 60) grade = "B";
      else if (percentage >= 50) grade = "C";
      else if (percentage >= 40) grade = "D";

      return {
        subjects: marks,
        total,
        percentage,
        grade,
      };
    };

    // Merge helper
    const mergeMarks = (existing = {}, updates = {}) => {
      const merged = { ...existing };
      for (const subject in updates) {
        merged[subject] = Number(updates[subject]);
      }
      return merged;
    };

    // Initialize performance if not present
    if (!student.performance) {
      student.performance = {};
    }

    // Preserve old data, update only if new data is present
    if (formativeAssessment1) {
      const existing = student.performance.formativeAssessment1?.subjects || {};
      const merged = mergeMarks(existing, formativeAssessment1);
      student.performance.formativeAssessment1 = calculateStats(merged);
    } else if (student.performance.formativeAssessment1) {
      student.performance.formativeAssessment1 = student.performance.formativeAssessment1; // retain old
    }

    if (formativeAssessment2) {
      const existing = student.performance.formativeAssessment2?.subjects || {};
      const merged = mergeMarks(existing, formativeAssessment2);
      student.performance.formativeAssessment2 = calculateStats(merged);
    } else if (student.performance.formativeAssessment2) {
      student.performance.formativeAssessment2 = student.performance.formativeAssessment2; // retain old
    }

    if (formativeAssessment3) {
      const existing = student.performance.formativeAssessment3?.subjects || {};
      const merged = mergeMarks(existing, formativeAssessment3);
      student.performance.formativeAssessment3 = calculateStats(merged);
    } else if (student.performance.formativeAssessment3) {
      student.performance.formativeAssessment3 = student.performance.formativeAssessment3; // retain old
    }

    if (formativeAssessment4) {
      const existing = student.performance.formativeAssessment4?.subjects || {};
      const merged = mergeMarks(existing, formativeAssessment4);
      student.performance.formativeAssessment4 = calculateStats(merged);
    } else if (student.performance.formativeAssessment4) {
      student.performance.formativeAssessment4 = student.performance.formativeAssessment4; // retain old
    }

    if (summativeAssessment1) {
      const existing = student.performance.summativeAssessment1?.subjects || {};
      const merged = mergeMarks(existing, summativeAssessment1);
      student.performance.summativeAssessment1 = calculateStats(merged);
    } else if (student.performance.summativeAssessment1) {
      student.performance.summativeAssessment1 = student.performance.summativeAssessment1;
    }

    if (summativeAssessment2) {
      const existing = student.performance.summativeAssessment2?.subjects || {};
      const merged = mergeMarks(existing, summativeAssessment2);
      student.performance.summativeAssessment2 = calculateStats(merged);
    } else if (student.performance.summativeAssessment2) {
      student.performance.summativeAssessment2 = student.performance.summativeAssessment2;
    }

    await student.save();

    return res.status(200).json({ message: "Performance updated", student });

  } catch (error) {
    console.error("Update Performance Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



  //--------------------------get Performance------------------------
  // controllers/staff.controller.js or similar


export const getClassPerformance = async (req, res) => {
  try {
    const { className } = req.params;

    if (!className) {
      return res.status(400).json({ error: "Class name is required" });
    }

    const students = await Student.find({ className });

    const subjects = ["Telugu", "Hindi", "English", "Maths", "Science", "Social Studies", "computer"];

    const computeStats = (marks = {}) => {
      const scoreList = subjects.map((sub) => marks[sub] || 0);
      const total = scoreList.reduce((acc, mark) => acc + mark, 0);
      const percentage = (total / (subjects.length * 100)) * 100;

      let grade = "F";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 80) grade = "A";
      else if (percentage >= 70) grade = "B+";
      else if (percentage >= 60) grade = "B";
      else if (percentage >= 50) grade = "C";
      else if (percentage >= 40) grade = "D";

      return {
        marks,
        total,
        percentage: Number(percentage.toFixed(2)),
        grade
      };
    };

    const formatted = students.map((student) => {
      const performance = {
        formativeAssessment1: computeStats(student.performance?.formativeAssessment1?.subjects || student.performance?.formativeAssessment1 || {}),
        formativeAssessment2: computeStats(student.performance?.formativeAssessment2?.subjects || student.performance?.formativeAssessment2 || {}),
        formativeAssessment3: computeStats(student.performance?.formativeAssessment3?.subjects || student.performance?.formativeAssessment3 || {}),
        formativeAssessment4: computeStats(student.performance?.formativeAssessment4?.subjects || student.performance?.formativeAssessment4 || {}),
        summativeAssessment1: computeStats(student.performance?.summativeAssessment1?.subjects || student.performance?.summativeAssessment1 || {}),
        summativeAssessment2: computeStats(student.performance?.summativeAssessment2?.subjects || student.performance?.summativeAssessment2 || {}),
      };

      return {
        _id: student._id,
        fullName: student.fullName,
        performance
      };
    });

    res.status(200).json({ students: formatted });

  } catch (err) {
    console.error("Error fetching students with performance:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

  //----------------------------Attendance------------------------------

  export const updateAttendance = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { month, workingDays, presentDays, yearly } = req.body;
  
      if (!month || workingDays == null || presentDays == null) {
        return res.status(400).json({ error: "Month, workingDays, and presentDays are required." });
      }
  
      const percentage = ((presentDays / workingDays) * 100).toFixed(2);
  
      const monthlyKey = `attendance.monthly.${month}`;
  
      const updateFields = {
        [monthlyKey]: {
          workingDays,
          presentDays,
          percentage
        }
      };
  
      if (yearly) {
        const totalWorking = Number(yearly.workingDays || 0);
        const totalPresent = Number(yearly.presentDays || 0);
        const totalPercentage = ((totalPresent / totalWorking) * 100).toFixed(2);
  
        updateFields["attendance.yearly"] = {
          workingDays: totalWorking,
          presentDays: totalPresent,
          percentage: totalPercentage
        };
      }
  
      const student = await Student.findByIdAndUpdate(
        studentId,
        { $set: updateFields },
        { new: true }
      );
  
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      res.status(200).json({ message: "Attendance updated successfully", student });
    } catch (error) {
      console.error("Update Attendance Error:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  //--------------------------GetAllStuentsAttandance------------------------------

 export const getAllStudentsAttendance = async (req, res) => {
  try {
    const { className, month } = req.query;

    // Optional class filter
    const filter = {};
    if (className) {
      filter.className = className;
    }

    const students = await Student.find(filter, "fullName className attendance").lean();

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found." });
    }

    const result = students.map((student) => {
      const monthly = student.attendance?.monthly || {};
      const yearly = student.attendance?.yearly || {};

      const monthlyData = month
        ? { [month]: monthly[month] || { workingDays: 0, presentDays: 0, percentage: 0 } }
        : monthly;

      return {
        id: student._id,
        name: student.fullName,
        class: student.className,
        attendance: {
          monthly: monthlyData,
          yearly: {
            workingDays: yearly.workingDays || 0,
            presentDays: yearly.presentDays || 0,
            percentage: yearly.percentage || 0
          }
        }
      };
    });

    res.status(200).json({ count: result.length, students: result });
  } catch (error) {
    console.error("Error fetching student attendance:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//-----------------------get students by classwise---------------------
export const getStudentsByClass = async (req, res) => {
  const { className } = req.params;

  try {
    if (!className) {
      return res.status(400).json({ message: 'Class name is required' });
    }

    const students = await Student.find({ className })
      .select('fullName className') // Only return these two fields
      .sort({ fullName: 1 }); // Optional: sort alphabetically

    res.status(200).json({ students });
  } catch (err) {
    console.error('Error fetching students by class:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//---------------------profile-----------------------------
export const getProfile = async (req, res) => {
  try {
    const staffId = req.user._id; // ✅ fixed: read from req.user

    const staff = await Staff.findById(staffId)
      .select('-password -otp -otpExpires -__v')
      .lean();

    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    res.json({
      fullName: staff.fullName,
      email: staff.email,
      mobileNumber: staff.mobileNumber,
      gender: staff.gender,
      profilePicture: staff.profilePicture,
      role: staff.role,
      teaching: staff.teaching,
      subjects: staff.subjects,
      salary: staff.salary,
      attendance: staff.attendance,
      className: staff.className || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// POST /api/staff/attendance/daily
export const markDailyAttendance = async (req, res) => {
  try {
    const { date, className, attendanceRecords } = req.body;


    if (!date || !className || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({ error: "Date, className, and attendanceRecords are required." });
    }

    for (const record of attendanceRecords) {
      const student = await Student.findById(record.studentId);
      if (!student) continue;

      const status = record.status === "Present";

      // Skip if holiday
      if (record.status === "Holiday") {
        await Student.findByIdAndUpdate(record.studentId, {
          $set: {
            [`attendance.daily.${date}`]: "Holiday"
          }
        });
      } else {
        await Student.findByIdAndUpdate(record.studentId, {
          $set: {
            [`attendance.daily.${date}`]: status
          }
        });
      }
    }

    res.status(200).json({ message: "Daily attendance marked successfully" });
  } catch (error) {
    console.error("Mark Daily Attendance Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//----------------------------------- calculate monthly-----------------------

// POST /api/staff/attendance/monthly
export const calculateMonthlyAttendance = async (req, res) => {
  try {
    const { className, month } = req.params;

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: "Invalid month format (use YYYY-MM)" });
    }

    const students = await Student.find({ className });

    for (const student of students) {
      const daily = student.attendance?.daily || new Map();
      const dailyEntries = Array.from(daily.entries ? daily.entries() : Object.entries(daily));

      let workingDays = 0;
      let presentDays = 0;

      for (const [date, status] of dailyEntries) {
        if (!date.startsWith(month)) continue;

        if (status === "Holiday") continue; // Skip holidays

        workingDays++;

        if (
          status === "Present" ||
          status === true ||
          status === "true"
        ) {
          presentDays++;
        }
      }

      const percentage = workingDays > 0 ? (presentDays / workingDays) * 100 : 0;

      // Update monthly
      const updatedMonthly = new Map(student.attendance.monthly || []);
      updatedMonthly.set(month, {
        workingDays,
        presentDays,
        percentage: +percentage.toFixed(2),
      });

      student.attendance.monthly = updatedMonthly;
      student.markModified("attendance.monthly");

      // Update yearly
      let totalWorking = 0;
      let totalPresent = 0;

      for (const [, record] of updatedMonthly.entries()) {
        totalWorking += record.workingDays || 0;
        totalPresent += record.presentDays || 0;
      }

      const yearlyPercent = totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0;

      student.attendance.yearly = {
        workingDays: totalWorking,
        presentDays: totalPresent,
        percentage: +yearlyPercent.toFixed(2),
      };
      student.markModified("attendance.yearly");

      await student.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      message: `Monthly and yearly attendance updated for ${className}`,
      students,
    });
  } catch (err) {
    console.error("Monthly Attendance Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Calculate Yearly Attendance
// export const calculateYearlyAttendance = async (req, res) => {
//   try {
//     const { className } = req.body;

//     if (!className) {
//       return res.status(400).json({ error: "className is required." });
//     }

//     const students = await Student.find({ className });

//     for (const student of students) {
//       let totalWorking = 0;
//       let totalPresent = 0;

//       const monthlyData = student.attendance?.monthly || {};
//       for (const month in monthlyData) {
//         totalWorking += monthlyData[month].workingDays || 0;
//         totalPresent += monthlyData[month].presentDays || 0;
//       }

//       const percentage = totalWorking > 0 ? ((totalPresent / totalWorking) * 100).toFixed(2) : 0;

//       await Student.findByIdAndUpdate(student._id, {
//         $set: {
//           "attendance.yearly": {
//             workingDays: totalWorking,
//             presentDays: totalPresent,
//             percentage
//           }
//         }
//       });
//     }

//     res.status(200).json({ message: "Yearly attendance calculated successfully" });
//   } catch (error) {
//     console.error("Calculate Yearly Attendance Error:", error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

//------------------extra acticities

export const addExtraCurricularMarks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { activityName, grade } = req.body;
    const staffId = req.user.id;

    // ✅ Correct validation
    if (!activityName || !grade) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found." });

    student.extraCurricular.push({
      activityName,
      grade,
      addedBy: staffId,
      addedAt: new Date(),
    });

    await student.save();

    res.status(200).json({
      message: "Extra-curricular marks added successfully.",
      extraCurricular: student.extraCurricular,
    });
  } catch (error) {
    console.error("Error adding extra-curricular marks:", error);
    res.status(500).json({ message: "Server error." });
  }
};


// controllers/extraCurricularController.js

// Staff: Get extra-curricular marks of any student
// controllers/staff.controller.js or admin.controller.js

export const getAllStudentPerformances = async (req, res) => {
  try {
    const { className } = req.params;

    if (!className) {
      return res.status(400).json({ message: "Class name is required." });
    }

    const students = await Student.find({ className })
      .select("fullName className extraCurricular")
      .populate("extraCurricular.addedBy", "fullName"); // Optional: Get staff name

    res.status(200).json({ students });
  } catch (error) {
    console.error("Error fetching student performances:", error);
    res.status(500).json({ message: "Server error." });
  }
};
