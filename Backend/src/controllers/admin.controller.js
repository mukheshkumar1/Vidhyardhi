import bcrypt from "bcryptjs";
import crypto from "crypto";
import Student from "../models/student.model.js";
import Staff from "../models/user.model.js";
import VotingPeriod from "../models/voting.model.js";
import sendEmail from "../utils/sendEmail.js"; 
import {uploadToCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js";
import fs from "fs";
import path from "path";
import moment from "moment";
import { fileURLToPath } from "url";
import Gallery from "../models/gallery.model.js";
import Event from "../models/event.model.js";
import SchoolImage from "../models/SchoolImage.model.js";
import mongoose from "mongoose";
import XLSX from "xlsx";
import { Buffer } from "buffer";
import { generatePromotionReportPDF} from "../utils/generatePromotionReport.js";
import { generateFeeReceiptPDF } from "../utils/generateReceipt.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const generateHashedPassword = async () => {
  const rawPassword = crypto.randomBytes(4).toString("hex");
  const hashedPassword = await bcrypt.hash(rawPassword, 12);
  return { rawPassword, hashedPassword };
};


//--------------------------------update profile image admin-----------------

export const updateAdminProfileImage = async (req, res) => {
  try {
    const adminId  = req.user.id;

    if (!adminId || !req.files || !req.files.image) {
      return res.status(400).json({ error: "Missing admin ID or image file" });
    }

    const admin = await Staff.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const file = req.files.image;

    // Save file temporarily
    const tempDir = path.join(__dirname, "../tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const tempPath = path.join(tempDir, `${Date.now()}_${file.name}`);
    await file.mv(tempPath);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(tempPath, "admin_profiles");

    // Delete previous image from Cloudinary
    const oldPublicId = admin.profilePicture?.publicId;
    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId);
    }

    // Update DB with new image
    admin.profilePicture = {
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
    await admin.save();

    // Clean up temp file
    fs.unlinkSync(tempPath);

    return res.status(200).json({
      message: "Admin profile image updated successfully",
      imageUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Admin Image Upload Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

//--------------------------------edit profile admin

export const editAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id; // from auth middleware
    const { fullName, email, mobileNumber, gender, salary, profilePicture } = req.body;

    const updated = await Staff.findByIdAndUpdate(
      adminId,
      {
        fullName,
        email,
        mobileNumber,
        gender,
        salary,
        ...(profilePicture && { profilePicture }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({
      message: "Profile updated successfully",
      admin: {
        _id: updated._id,
        fullName: updated.fullName,
        email: updated.email,
        mobileNumber: updated.mobileNumber,
        gender: updated.gender,
        profilePicture: updated.profilePicture,
        salary: updated.salary,
        role: updated.role,
      },
    });
  } catch (err) {
    console.error("Edit Profile Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
};
//------------------------------get admin profile-----------------------------
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id; // populated by middleware (from token)

    const admin = await Staff.findById(adminId).select("-password"); // remove password from response

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json({
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      mobileNumber: admin.mobileNumber,
      gender: admin.gender,
      salary: admin.salary,
      role: admin.role,
      profilePicture: admin.profilePicture,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addStudent = async (req, res) => {
  try {
    const { fullName, className, email, phone, feeStructure = {}, transportOpted = false } = req.body;

    const { rawPassword, hashedPassword } = await generateHashedPassword();

    // Default Fee Structure
    const defaultFeeStructureByClass = {
      "Grade 1": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 2": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 3": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 4": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 5": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 6": { tuition: 75000, transport: 0, kit: 15000 },
      "Grade 7": { tuition: 75000, transport: 0, kit: 15000 },
    };

    const defaults = defaultFeeStructureByClass[className] || { tuition: 30000, transport: 0, kit: 15000 };
    const tuition = feeStructure.tuition ?? defaults.tuition;
    const transport = transportOpted ? (feeStructure.transport ?? defaults.transport) : 0;
    const kit = feeStructure.kit ?? defaults.kit;

    const firstTermTuition = Math.floor(tuition / 2);
    const secondTermTuition = Math.ceil(tuition / 2);
    const total = firstTermTuition + secondTermTuition + transport + kit;

    const mergedFeeStructure = {
      tuition: {
        firstTerm: firstTermTuition,
        secondTerm: secondTermTuition,
      },
      transport,
      kit,
      total,
      paid: 0,
      balance: total,
      paidComponents: {
        "tuition.firstTerm": 0,
        "tuition.secondTerm": 0,
        transport: 0,
        kit: 0,
      },
    };

    const initial = fullName?.trim()?.charAt(0).toUpperCase() || "S";
    const defaultAvatar = `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`;

    const student = new Student({
      fullName,
      className,
      email,
      phone,
      password: hashedPassword,
      subjects: {
        telugu: "",
        hindi: "",
        english: "",
        maths: "",
        Science: "",
        Social: "",
      },
      performance: {
        quarterly: {},
        halfYearly: {},
        annual: {},
      },
      attendance: {
        yearly: {
          workingDays: 0,
          presentDays: 0,
          percentage: 0,
        },
      },
      profilePicture: {
        imageUrl: defaultAvatar,
      },
      feeStructure: mergedFeeStructure,
      history: [],
    });

    await student.save();

    await sendEmail(
      email,
      "Your Vidhyardhi School Student Login Credentials",
      `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px;">
          <div style="text-align: center;">
            <img src="https://res.cloudinary.com/demj86hzs/image/upload/v1749547385/logo1_qlduf9.png" alt="Vidhyardhi School Logo" style="max-width: 120px; margin-bottom: 20px;" />
            <h2 style="color: #2a7ae2;">Welcome to Vidhyardhi School, ${fullName}!</h2>
          </div>

          <p style="font-size: 16px; color: #333;">We are excited to have you on board. Below are your login credentials:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 16px;">
            <tr>
              <td style="padding: 10px; font-weight: bold; width: 120px;">Login ID:</td>
              <td style="padding: 10px;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Password:</td>
              <td style="padding: 10px;">${rawPassword}</td>
            </tr>
          </table>

          <div style="text-align: center; margin: 20px 0;">
            <a href="https://localhost:5173/forgot-password" style="background-color: #2a7ae2; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
              Go to Student Portal
            </a>
          </div>

          <p style="font-size: 16px;">Please log in and change your password after your first login to keep your account secure.</p>

          <p style="margin-top: 40px; font-size: 16px;">Best regards,<br/>Vidhyardhi School Admin Team</p>
        </div>
      </div>
      `
    );

    res.status(201).json({ message: "Student created successfully with fee structure and credentials sent." });
  } catch (error) {
    console.error("Add Student Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//------------------------Delete Students-----------------------------
export const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: "Staff not found" });
    }

    await Student.findByIdAndDelete(studentId);

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete Student Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//  List Students by Class

export const getStudentsByClass = async (req, res) => {
  const { className } = req.params;

  try {
    if (!className) {
      return res.status(400).json({ message: 'Class name is required' });
    }

    const students = await Student.find({ className })
      .select('fullName className profilePicture') // Only return these two fields
      .sort({ fullName: 1 }); // Optional: sort alphabetically

    res.status(200).json({ students });
  } catch (err) {
    console.error('Error fetching students by class:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentsGroupedByClass = async (req, res) => {
  try {
    const allStudents = await Student.find().select(
      "fullName email phone className feeStructure profilePicture attendance performance history isCurrentLeader"
    );

    const classOrder = [
      "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
      "Grade 6", "Grade 7"
    ];

    const grouped = {};

    classOrder.forEach((grade) => {
      grouped[grade] = allStudents
        .filter(student => student.className === grade)
        .map(student => ({
          _id: student._id,
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
          className: student.className,
          profilePicture: student.profilePicture,
          attendance: student.attendance,
          performance: student.performance,
          history: student.history,
          isCurrentLeader: student.isCurrentLeader,
          feeStructure: {
            firstTerm: student.feeStructure.tuition.firstTerm,
            secondTerm: student.feeStructure.tuition.secondTerm,
            transport: student.feeStructure.transport,
            kit: student.feeStructure.kit, 
            paid: student.feeStructure.paid,
            balance: student.feeStructure.balance
          }
        }));
    });

    // Handle unlisted classNames
    allStudents.forEach(student => {
      if (!classOrder.includes(student.className)) {
        if (!grouped[student.className]) grouped[student.className] = [];
        grouped[student.className].push({
          _id: student._id,
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
          className: student.className,
          profilePicture: student.profilePicture,
          attendance: student.attendance,
          performance: student.performance,
          history: student.history,
          isCurrentLeader: student.isCurrentLeader,
          feeStructure: {
            firstTerm: student.feeStructure.tuition.firstTerm,
            secondTerm: student.feeStructure.tuition.secondTerm,
            transport: student.feeStructure.transport,
            kit: student.feeStructure.kit, 
            paid: student.feeStructure.paid,
            balance: student.feeStructure.balance
          }
        });
      }
    });

    res.status(200).json(grouped);
  } catch (error) {
    console.error("Fetch Students Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//------------------------Promote students to next Class-----------------------

export const promoteSingleStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      currentClass,
      nextClass,
      updatedFees = {},
      includeTransport = true, // ✅ Prompt-style flag
    } = req.body;

    if (!studentId || !currentClass || !nextClass) {
      return res.status(400).json({ error: "studentId, currentClass, and nextClass are required." });
    }

    const student = await Student.findById(studentId);
    if (!student || student.className !== currentClass) {
      return res.status(404).json({ error: "Student not found or current class mismatch." });
    }

    if (student.className === "Old Students") {
      return res.status(400).json({ error: "This student is already marked as an Old Student. No further promotion allowed." });
    }

    // Archive current state
    const previousData = {
      className: student.className,
      feeStructure: student.feeStructure,
      performance: student.performance,
      attendance: student.attendance,
      promotedAt: new Date(),
    };

    // Handle Old Student finalization
    if (nextClass === "Old Students" || currentClass === "Grade 7") {
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        {
          $set: {
            className: "Old Students",
            active: false,
          },
          $push: {
            history: previousData,
          },
        },
        { new: true }
      );

      return res.status(200).json({
        message: `Student ${updatedStudent.fullName} has been moved to Old Students.`,
        student: updatedStudent,
      });
    }

    // ✅ Default fee structure including KIT
    const defaultFeeStructureByClass = {
      "Grade 1": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 2": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 3": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 4": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 5": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 6": { tuition: 75000, transport: 0, kit: 15000 },
      "Grade 7": { tuition: 75000, transport: 0, kit: 15000 },
    };

    const defaults = defaultFeeStructureByClass[nextClass] || {
      tuition: 30000,
      transport: 0,
      kit: 10000,
    };

    const tuition = updatedFees.tuition ?? defaults.tuition;
    const transport = includeTransport ? (updatedFees.transport ?? defaults.transport) : 0;
    const kit = updatedFees.kit ?? defaults.kit;

    const firstTerm = Math.floor(tuition / 2);
    const secondTerm = Math.ceil(tuition / 2);
    const total = firstTerm + secondTerm + transport + kit;

    const newFeeStructure = {
      tuition: {
        firstTerm,
        secondTerm,
      },
      transport,
      kit,
      total,
      paid: 0,
      balance: total,
      paidComponents: {
        "tuition.firstTerm": 0,
        "tuition.secondTerm": 0,
        transport: 0,
        kit: 0,
      },
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        $set: {
          className: nextClass,
          feeStructure: newFeeStructure,
          performance: {
            quarterly: {},
            halfYearly: {},
            annual: {},
          },
          attendance: {
            yearly: {
              workingDays: 0,
              presentDays: 0,
              percentage: 0,
            },
          },
        },
        $push: {
          history: previousData,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: `Student ${updatedStudent.fullName} promoted to ${nextClass} successfully.`,
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Single Promotion Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



//----------------get student details---------------------  
export const getStudentAcademicDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Not found" });

    res.status(200).json({
      fullName: student.fullName,
      currentClass: student.className,
      subjects: student.subjects,
      performance: student.performance,
      picture: student.profilePicture,
      attendance: {
        monthly: Object.fromEntries(student.attendance?.monthly || []),
        yearly: student.attendance?.yearly || {},
      },
      feeStructure: student.feeStructure,
      feePayments: student.feePayments,
      history: student.history || []
      
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

//----------------------update details-----------------------
export const updateProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { fullName, feeStructure } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // ✅ Update full name
    if (fullName) student.fullName = fullName;

    // ✅ Update feeStructure only if provided
    if (feeStructure) {
      const existing = student.feeStructure;

      // Tuition: can be object or number
      if (feeStructure.tuition) {
        if (typeof feeStructure.tuition === "object") {
          existing.tuition.firstTerm =
            feeStructure.tuition.firstTerm ?? existing.tuition.firstTerm ?? 0;
          existing.tuition.secondTerm =
            feeStructure.tuition.secondTerm ?? existing.tuition.secondTerm ?? 0;
        } else if (typeof feeStructure.tuition === "number") {
          const half = Math.floor(feeStructure.tuition / 2);
          existing.tuition.firstTerm = half;
          existing.tuition.secondTerm = feeStructure.tuition - half;
        }
      }

      // Transport
      if (feeStructure.hasOwnProperty("transport")) {
        existing.transport = feeStructure.transport;
      }

      // Kit
      if (feeStructure.hasOwnProperty("kit")) {
        existing.kit = feeStructure.kit;
      }

      // Recalculate total and balance
      const tuitionTotal = existing.tuition.firstTerm + existing.tuition.secondTerm;
      const total = tuitionTotal + (existing.transport || 0) + (existing.kit || 0);
      existing.total = total;
      existing.balance = total - (existing.paid || 0);

      // Ensure paidComponents exists
      existing.paidComponents = {
        "tuition.firstTerm": existing.paidComponents?.["tuition.firstTerm"] || 0,
        "tuition.secondTerm": existing.paidComponents?.["tuition.secondTerm"] || 0,
        transport: existing.paidComponents?.transport || 0,
        kit: existing.paidComponents?.kit || 0,
      };

      student.feeStructure = existing;
    }

    await student.save();
    res.status(200).json({ message: "Profile updated", student });

  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ error: "Failed to update student profile" });
  }
};



//-----------------------student profile image--------------------

export const updateStudentProfileImage = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId || !req.files || !req.files.image) {
      return res.status(400).json({ error: "Missing student ID or image file" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const file = req.files.image;

  
    const tempDir = path.join(__dirname, "../profile");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

 
    const tempPath = path.join(tempDir, `${Date.now()}_${file.name}`);
    await file.mv(tempPath);

   
    const uploadResult = await uploadToCloudinary(tempPath);

   
    const oldUrl = student.profilePicture?.imageUrl;
    if (oldUrl && oldUrl.includes("res.cloudinary.com")) {
      const publicId = oldUrl.split("/").pop().split(".")[0];
      await deleteFromCloudinary(`student_profiles/${publicId}`);
    }

  
    student.profilePicture = {
      imageUrl: uploadResult.url,
      publicId: uploadResult.public_id,
    };

    await student.save();

  
    fs.unlinkSync(tempPath);

    return res.status(200).json({
      message: "Profile image updated",
      imageUrl: uploadResult.url,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
//----------------------promote all students---------------------------


export const promoteAllStudentsToNextGrade = async (req, res) => {
  try {
    const { currentClass, nextClass, updatedFees = {}, transportOptedIds = [] } = req.body;

    if (!currentClass || !nextClass) {
      return res.status(400).json({ error: "currentClass and nextClass are required." });
    }

    const students = await Student.find({ className: currentClass });
    if (!students.length) {
      return res.status(404).json({ error: "No students found in the current class." });
    }

    const defaultFeeStructureByClass = {
      "Grade 1": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 2": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 3": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 4": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 5": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 6": { tuition: 75000, transport: 0, kit: 15000 },
      "Grade 7": { tuition: 75000, transport: 0, kit: 15000 },
    };

    const promotedStudents = [];

    for (const student of students) {
      const isGraduating = student.className === "Grade 7" || nextClass === "Old Students";

      const previousData = {
        className: student.className,
        feeStructure: student.feeStructure,
        performance: student.performance,
        attendance: student.attendance,
        promotedAt: new Date(),
      };

      if (isGraduating) {
        const updated = await Student.findByIdAndUpdate(
          student._id,
          {
            $set: {
              className: "Old Students",
              active: false,
            },
            $push: {
              history: previousData,
            },
          },
          { new: true }
        );

        promotedStudents.push(updated);
        continue;
      }

      const defaults = defaultFeeStructureByClass[nextClass] || {};
      const tuition = updatedFees.tuition ?? defaults.tuition ?? 30000;
      const transport = transportOptedIds.includes(String(student._id))
        ? updatedFees.transport ?? 0
        : 0;
      const kit = updatedFees.kit ?? 0;

      const firstTermTuition = Math.floor(tuition / 2);
      const secondTermTuition = Math.ceil(tuition / 2);
      const total = firstTermTuition + secondTermTuition + transport + kit;

      const newStructure = {
        tuition: {
          firstTerm: firstTermTuition,
          secondTerm: secondTermTuition,
        },
        transport,
        kit,
        total,
        paid: 0,
        balance: total,
        paidComponents: {
          "tuition.firstTerm": 0,
          "tuition.secondTerm": 0,
          transport: 0,
          kit: 0,
        },
      };

      const updated = await Student.findByIdAndUpdate(
        student._id,
        {
          $set: {
            className: nextClass,
            feeStructure: newStructure,
            performance: {
              quarterly: {},
              halfYearly: {},
              annual: {},
            },
            attendance: {
              yearly: {
                workingDays: 0,
                presentDays: 0,
                percentage: 0,
              },
            },
          },
          $push: {
            history: previousData,
          },
        },
        { new: true }
      );

      // Generate and email PDF report
      const pdfBuffer = await generatePromotionReportPDF({
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        fromClass: currentClass,
        toClass: nextClass,
        feeStructure: newStructure,
        promotedAt: new Date(),
      });

      await sendEmail(
        updated.email,
        "Vidhyardhi School - Promotion Confirmation",
        `
         <div style="
              max-width: 600px;
              margin: auto;
              font-family: Arial, sans-serif;
              border: 1px solid #ddd;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            ">
              <!-- Header with Logo -->
              <div style="background-color: #f5f7fa; padding: 20px; text-align: center;">
                <img src="https://res.cloudinary.com/demj86hzs/image/upload/v1749547385/logo1_qlduf9.png" alt="Vidhyardhi School Logo" style="max-height: 80px;" />
              </div>

              <!-- Main Message -->
              <div style="padding: 30px; background-color: #ffffff;">
                <h2 style="color: #2c3e50;">🎓 Promotion Confirmation</h2>

                <p style="font-size: 16px; color: #333;">
                  Dear <strong>${updated.fullName},</strong>,
                </p>

                <p style="font-size: 16px; color: #333;">
                  Congratulations! You have been successfully promoted from 
                  <strong>${currentClass}</strong> to <strong>${nextClass}</strong>.
                </p>

                <p style="font-size: 16px; color: #333;">
                  Attached is your fee structure and promotion details in PDF format. Please review the details carefully.
                </p>

                <hr style="margin: 20px 0;" />

                <p style="font-size: 15px; color: #555;">
                  If you have any queries, feel free to contact the school office.
                </p>
              </div>

              <!-- Footer -->
              <div style="background-color: #f5f7fa; padding: 20px; text-align: center; font-size: 14px; color: #555;">
                <p style="margin: 0;">
                  <strong>Vidhyardhi School</strong><br/>
                 Intriguing- Empowering- Transformative
                </p>
                <p style="margin: 5px 0 0;">
                  📍 Door no: 26-175/1, Gayatri Nagar, Near Current Office, Nellore-524004<br/>
                  📞 +91-9849244277 | ✉️ vidhyardhie.m.school25@gmail.com
                </p>
              </div>
            </div>
        `,
        [
          {
            filename: `Promotion-${updated.fullName}-${Date.now()}.pdf`,
            content: Buffer.from(pdfBuffer),
            contentType: "application/pdf",
          },
        ]
      );

      promotedStudents.push(updated);
    }

    res.status(200).json({
      message: `Promotion complete. ${promotedStudents.length} students processed.`,
      promotedStudents,
    });
  } catch (error) {
    console.error("Promotion Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//----------------------------fetching attendance--------------------------
export const getAttendanceByClass = async (req, res) => {
  try {
    const { className } = req.query;

    if (!className) {
      return res.status(400).json({ error: "className is required." });
    }

    const students = await Student.find({ className }).select("fullName attendance.percentage");

    res.status(200).json({ students });
  } catch (error) {
    console.error("Error fetching students by class:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



//-----------------------------------Adding Staff-----------------------------------

export const addStaff = async (req, res) => {
  try {
    const { fullName, email, mobileNumber,  gender ,teaching, subjects, salary } = req.body;

    const { rawPassword, hashedPassword } = await generateHashedPassword();

    const initial = fullName?.trim()?.charAt(0).toUpperCase() || "S";
    const defaultAvatar = `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`;

    const staff = new Staff({
      fullName,
      email,
      mobileNumber,
      gender,
      password: hashedPassword,
      profilePicture: {
        imageUrl: defaultAvatar,
      },
      teaching,
      subjects: teaching ? subjects : [], 
      salary,
      role: "staff",
      permissions: {
        canEditStudents: false, 
      }
    });

    await staff.save({ validateBeforeSave: false });

await sendEmail(
  email,
  "Your Vidhyardhi School  Staff Login Credentials",
  `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px;">

        <div style="text-align: center;">
          <img src="https://res.cloudinary.com/demj86hzs/image/upload/v1749547385/logo1_qlduf9.png" alt="Vidhyardhi School Logo" style="max-width: 120px; margin-bottom: 20px;" />
          <h2 style="color: #2a7ae2;">Welcome to Vidhyardhi School, ${fullName}!</h2>
        </div>

        <p style="font-size: 16px; color: #333;">We are excited to have you on board. Below are your login credentials:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 16px;">
          <tr>
            <td style="padding: 10px; font-weight: bold; width: 120px;">Login ID:</td>
            <td style="padding: 10px;">${mobileNumber}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Password:</td>
            <td style="padding: 10px;">${rawPassword}</td>
          </tr>
        </table>
        <button 
        style="background-color: blue; color: white; padding: 10px 20px; border: rounded; cursor: pointer;" 
        onclick="this.style.backgroundColor='green'; window.location.href='https://localhost:5173/forgot-password';">
        Click Here
        </button>


        <p style="font-size: 16px;">Please log in to your student portal and change your password after your first login.</p>

        <p style="margin-top: 40px; font-size: 16px;">Best regards,<br/>Vidhyardhi School Admin Team</p>

      </div>
    </div>
  `
);

res.status(201).json({ message: "Staff added and credentials sent." });
} catch (error) {
  console.error("Staff Student Error:", error.message);
  res.status(500).json({ error: "Internal Server Error" });
}
};

//---------------------------getStaff-----------------------------

export const getStaff = async (req, res) => {
  try {
    // Fetch all staff members who are not admins from the database.
    const staffMembers = await Staff.find({ role: { $ne: "admin" } }).select('-password'); // Exclude the password field
    // Send the list of staff members as a response
    res.status(200).json({
      success: true,
      staff: staffMembers,
    });
  } catch (error) {
    console.error("Get Staff Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//------------------------getAdmin-------------------------------

export const getAdmin = async (req, res) => {
  try {
    // Fetch all staff members who are admins from the database.
    const adminMembers = await Staff.find({ role: "admin" }).select('-password'); // Exclude the password field
    // Send the list of admin members as a response
    res.status(200).json({
      success: true,
      admins: adminMembers,
    });
  } catch (error) {
    console.error("Get Admin Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//----------------------------delete Staff----------------------------------

export const deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    if (staff.role === "admin") {
      return res.status(403).json({ error: "Cannot delete an admin user" });
    }

    await Staff.findByIdAndDelete(staffId);

    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("Delete Staff Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//---------------------------------Admin Can give rights to staff-------------------------------------
export const toggleAdminRights = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const newRole = staff.role === "admin" ? "staff" : "admin";

    const updatedStaff = await Staff.findByIdAndUpdate(
      staffId,
      { role: newRole },
      { new: true, runValidators: false }
    );

    res.status(200).json({
      message: `Staff role updated to ${updatedStaff.role}`,
      staff: updatedStaff
    });
  } catch (error) {
    console.error("Toggle Admin Rights Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//-------------------------staff profile------------------
export const updateStaffProfileImage = async (req, res) => {
  try {
    const { staffId } = req.params;

    if (!staffId || !req.files || !req.files.image) {
      return res.status(400).json({ error: "Missing staff ID or image file" });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const file = req.files.image;

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, "../profile");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const tempPath = path.join(tempDir, `${Date.now()}_${file.name}`);
    await file.mv(tempPath);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(tempPath, "staff_profiles");

    // Delete old image from Cloudinary if exists
    const oldUrl = staff.profilePicture?.imageUrl;
    if (oldUrl && oldUrl.includes("res.cloudinary.com")) {
      const publicId = oldUrl.split("/").pop().split(".")[0];
      await deleteFromCloudinary(`staff_profiles/${publicId}`);
    }

    // Update MongoDB
    staff.profilePicture = {
      imageUrl: uploadResult.url,
      publicId: uploadResult.public_id,
    };

    await staff.save();

    // Clean up temp file
    fs.unlinkSync(tempPath);

    return res.status(200).json({
      message: "Staff profile image updated successfully",
      imageUrl: uploadResult.url,
    });
  } catch (error) {
    console.error("Staff profile update error:", error);
    return res.status(500).json({ error: "Server error while updating staff image" });
  }
};
//------------------------------ add photos to gallery-------------------------------------


// -------------------- ADD PHOTOS --------------------
export const addPhotosToGallery = async (req, res) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const { names, descriptions } = req.body;

    let files = req.files.images;
    if (!Array.isArray(files)) {
      files = [files];
    }

    const tempDir = path.join(process.cwd(), "temp_gallery_uploads");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const savedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempPath = path.join(tempDir, `${Date.now()}_${file.name}`);
      await file.mv(tempPath);

      const uploadResult = await uploadToCloudinary(tempPath, "gallery");

      fs.unlinkSync(tempPath);

      const newImage = new Gallery({
        name: Array.isArray(names) ? names[i] : names,
        description: Array.isArray(descriptions) ? descriptions[i] : descriptions,
        imageUrl: uploadResult.url,
        publicId: uploadResult.public_id
      });

      await newImage.save();
      savedImages.push(newImage);
    }

    return res.status(200).json({
      message: "Gallery images added successfully",
      images: savedImages
    });
  } catch (error) {
    console.error("Error adding images to gallery:", error);
    return res.status(500).json({ error: "Server error while adding gallery images" });
  }
};

//-------------------------------get images from gallery------------

export const getGallery = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });

    if (!images.length) {
      return res.status(404).json({ message: "No gallery images found" });
    }

    return res.status(200).json(images);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return res.status(500).json({ error: "Server error fetching gallery images" });
  }
};

//-------------------------------delete image from gallery-------------

export const deleteGalleryImage = async (req, res) => {
  try {
    const { publicId } = req.query; 

    if (!publicId) {
      return res.status(400).json({ error: "Missing publicId" });
    }

    await deleteFromCloudinary(publicId); 

    const result = await Gallery.findOneAndDelete({ publicId });

    if (!result) {
      return res.status(404).json({ error: "Image not found in database" });
    }

    return res.status(200).json({
      message: "Image deleted successfully",
      deletedImage: result
    });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return res.status(500).json({ error: "Server error while deleting image" });
  }
};



//-----------------------------------give staff permissions---------------------------

export const updateStaffPermissions = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { canEditStudents } = req.body;

    const staff = await Staff.findByIdAndUpdate(
      staffId,
      { "permissions.canEditStudents": canEditStudents },
      { new: true }
    );

    if (!staff) return res.status(404).json({ error: "Staff not found" });

    res.status(200).json({ message: "Staff permissions updated", staff });
  } catch (err) {
    console.error("Update Staff Permission Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//----------------------event calender--------------------------------------

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add new event
export const addEvent = async (req, res) => {
  const { date, title, description } = req.body;
  if (!date || !title) {
    return res.status(400).json({ message: "Date and title are required" });
  }
  try {
    const newEvent = new Event({
      date: new Date(date),
      title,
      description,
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update event by id
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { date, title, description } = req.body;
  try {
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (date) event.date = new Date(date);
    if (title) event.title = title;
    if (description) event.description = description;

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete event by id
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// add photos to school gallery
export const addPhotosToSchoolImages = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    let files = req.files.image;
    if (!Array.isArray(files)) files = [files];

    const savedImages = [];

    for (const file of files) {
      const tempPath = `./temp/${Date.now()}_${file.name}`;
      await file.mv(tempPath);

      const uploadResult = await uploadToCloudinary(tempPath, "school_images");
      fs.unlinkSync(tempPath);

      const newImage = new SchoolImage({
        title: req.body.title,
        description: req.body.description,
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      });

      await newImage.save();
      savedImages.push(newImage);
    }

    return res.json({ message: "Upload success", images: savedImages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};
// get school images
export const getAllSchoolImages = async (req, res) => {
  try {
    const images = await SchoolImage.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
};
// delete school images
export const deleteSchoolImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid image ID" });
    }

    const image = await SchoolImage.findById(id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    // Delete the document by ID instead of using image.remove()
    await SchoolImage.deleteOne({ _id: id });

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message || "Failed to delete image" });
  }
};

// add bulk students--------------------------
export const addBulkStudents = async (req, res) => {
  try {
    const { fileBase64 } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: "Base64 Excel data required." });
    }

    const buffer = Buffer.from(fileBase64, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const defaultFeeStructureByClass = {
      "Grade 1": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 2": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 3": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 4": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 5": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 6": { tuition: 75000, transport: 0, kit: 15000 },
      "Grade 7": { tuition: 75000, transport: 0, kit: 15000 },
    };

    const results = [];

    for (const studentData of sheetData) {
      const { fullName, className, email, phone } = studentData;
      const { rawPassword, hashedPassword } = await generateHashedPassword();

      const defaults = defaultFeeStructureByClass[className] || {
        tuition: 55000,
        transport: 0,
        kit: 15000,
      };

      const tuition = defaults.tuition;
      const transport = defaults.transport;
      const kit = defaults.kit;

      const feeStructure = {
        tuition: {
          firstTerm: Math.floor(tuition / 2),
          secondTerm: Math.ceil(tuition / 2),
        },
        transport,
        kit,
        total: tuition + transport + kit,
        paid: 0,
        balance: tuition + transport + kit,
        paidComponents: {
          "tuition.firstTerm": 0,
          "tuition.secondTerm": 0,
          transport: 0,
          kit: 0,
        },
      };

      const initial = fullName?.trim()?.charAt(0).toUpperCase() || "S";
      const defaultAvatar = `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`;

      const student = new Student({
        fullName,
        className,
        email,
        phone,
        password: hashedPassword,
        subjects: {
          telugu: "",
          hindi: "",
          english: "",
          maths: "",
          Science: "",
          Social: "",
        },
        performance: {
          quarterly: {},
          halfYearly: {},
          annual: {},
        },
        profilePicture: {
          imageUrl: defaultAvatar,
        },
        feeStructure,
      });

      await student.save({ validateBeforeSave: false });

      await sendEmail(
        email,
        "Your Vidhyardhi School Student Login Credentials",
        `
          <h2>Hi ${fullName}, Welcome!</h2>
          <p>Your Login ID: <strong>${phone}</strong></p>
          <p>Password: <strong>${rawPassword}</strong></p>
          <p><a href="https://localhost:5173/forgotpasswordstudent">Go to Portal</a></p>
        `
      );

      results.push({ fullName, email, status: "success" });
    }

    res.status(201).json({ message: "Bulk upload complete", results });
  } catch (error) {
    console.error("Bulk Add Base64 Error:", error);
    res.status(500).json({ error: "Internal server error during bulk upload." });
  }
};

export const setVotingDeadline = async (req, res) => {
  try {
    const { className, startDate, endDate } = req.body;

    if (!className || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required." });
    }


    const existing = await VotingPeriod.findOne({ className });

    if (existing) {
      existing.startDate = new Date(startDate);
      existing.endDate = new Date(endDate);
      await existing.save();
    } else {
      await VotingPeriod.create({
        className,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    res.status(200).json({ message: "Voting period set successfully." });
  } catch (error) {
    console.error("Deadline error:", error);
    res.status(500).json({ message: "Failed to set voting deadline." });
  }
};

/**
 * 2. Get voting period for a class
 */
export const getVotingPeriod = async (req, res) => {
  try {
    const { className } = req.params;

    const period = await VotingPeriod.findOne({ className });

    if (!period) {
      return res.status(404).json({ message: "No voting period found." });
    }

    res.status(200).json(period);
  } catch (error) {
    res.status(500).json({ message: "Error fetching voting period." });
  }
};

/**
 * 3. Monitor voting status: see all candidates with vote counts
 */
export const getVotingStats = async (req, res) => {
  try {
    const { className } = req.params;

    const candidates = await Student.find({
      className,
      isCandidate: true,
    })
      .select("fullName votes profilePicture");

    res.status(200).json(candidates);
  } catch (error) {
    console.error("Voting stats error:", error);
    res.status(500).json({ message: "Failed to get voting stats." });
  }
};
//----------------------------------assign class Leader------------------------------------

export const assignClassLeader = async (req, res) => {
  try {
    const { className, studentId } = req.body;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Remove previous leaders
    await Student.updateMany(
      { className, isCurrentLeader: true },
      { isCurrentLeader: false }
    );

    const student = await Student.findById(studentId);

    if (!student || student.className !== className) {
      return res.status(404).json({ message: "Student not found." });
    }

    student.isCurrentLeader = true;

    const existing = student.electionHistory.find(
      (e) => e.year === year && e.month === month && e.className === className
    );

    if (existing) {
      existing.timesElected += 1;
    } else {
      student.electionHistory.push({
        year,
        month,
        className,
        timesElected: 1,
      });
    }

    // Reset votes for all students in class
    await Student.updateMany({ className }, { $set: { votes: 0 } });

    await student.save();

    res.status(200).json({ message: "Class leader assigned for the month." });
  } catch (error) {
    console.error("Assign Leader Error:", error);
    res.status(500).json({ message: "Failed to assign leader." });
  }
};
//----------------------get class leader--------------------------------

export const getClassLeadersByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;

    const leaders = await Student.find({
      electionHistory: {
        $elemMatch: {
          year: parseInt(year),
          month: parseInt(month),
        },
      },
    });

    const result = leaders.map((s) => {
      const record = s.electionHistory.find(
        (e) => e.year === parseInt(year) && e.month === parseInt(month)
      );
      return {
        studentId: s._id,
        fullName: s.fullName,
        className: record.className,
        timesElected: record.timesElected,
        profilePicture: s.profilePicture?.imageUrl,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch class leaders" });
  }
};

//--------------------------------Leader Ranking-----------------------------------

export const getTopLeadersOfYear = async (req, res) => {
  try {
    const { className, year } = req.params;

    const students = await Student.find({ className });
    const top = students
      .map((s) => {
        const totalElections = s.electionHistory?.filter(
          (e) => e.year === parseInt(year) && e.className === className
        );
        const totalTimesElected = totalElections?.reduce(
          (acc, e) => acc + e.timesElected, 0
        );

        return {
          studentId: s._id,
          fullName: s.fullName,
          totalTimesElected: totalTimesElected || 0,
        };
      })
      .sort((a, b) => b.totalTimesElected - a.totalTimesElected);

    res.status(200).json(top);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch ranking" });
  }
};

//---------------------------------assign candidate--------------

export const setClassLeaderCandidates = async (req, res) => {
  try {
    const { className, candidateIds } = req.body; // array of student IDs

    // Reset previous candidates in the class
    await Student.updateMany({ className }, { $set: { isCandidate: false } });

    // Set selected candidates
    await Student.updateMany(
      { _id: { $in: candidateIds } },
      { $set: { isCandidate: true } }
    );

    res.status(200).json({ message: "Candidates updated for the class." });
  } catch (error) {
    console.error("Set Candidates Error:", error);
    res.status(500).json({ error: "Failed to set candidates." });
  }
};

// Get all candidates grouped by class
export const getClassLeaderCandidates = async (req, res) => {
  try {
    const { className } = req.query;

    if (!className) {
      return res.status(400).json({ message: "Class name is required" });
    }

    const candidates = await Student.find({
      isCandidate: true,
      className: className.trim(), 
    })
      .select("fullName profilePicture votes className")
      .sort({ votes: -1 });

    return res.status(200).json(candidates);
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const closeVotingByClass = async (req, res) => {
  try {
    const { className } = req.body;
    if (!className) return res.status(400).json({ message: "Class name is required" });

    const now = new Date();
    const updated = await VotingPeriod.findOneAndUpdate(
      { className },
      { endDate: now },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Voting period not found for the class" });
    }

    return res.status(200).json({ message: `Voting closed for ${className}.` });
  } catch (error) {
    console.error("Error closing voting:", error);
    return res.status(500).json({ message: "Failed to close voting" });
  }
};

export const getVotingStatusByClass = async (req, res) => {
  try {
    const { className } = req.query;
    if (!className) return res.status(400).json({ message: "Class name is required" });

    const period = await VotingPeriod.findOne({ className });
    if (!period) return res.status(404).json({ isOpen: false, message: "No voting period found" });

    const now = new Date();
    const isOpen = now >= period.startDate && now <= period.endDate;

    return res.status(200).json({ isOpen });
  } catch (error) {
    console.error("Error fetching voting status:", error);
    return res.status(500).json({ message: "Failed to fetch voting status" });
  }
};

//---------------------get feee details-----------------



export const getStudentFeeDetails = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).lean();

    if (!student) return res.status(404).json({ message: "Student not found" });

    const fee = student.feeStructure || {};
    const tuition = fee.tuition || { firstTerm: 0, secondTerm: 0 };
    const transport = fee.transport || 0;
    const kit = fee.kit || 0;
    const paidComponents = fee.paidComponents || {};
    const paid = fee.paid || 0;
    const balance = fee.balance || 0;

    const tuitionFirstStatus =
      (paidComponents["tuition.firstTerm"] || 0) >= tuition.firstTerm
        ? "Paid"
        : "Pending";

    const tuitionSecondStatus =
      (paidComponents["tuition.secondTerm"] || 0) >= tuition.secondTerm
        ? "Paid"
        : "Pending";

      const kitStatus =
      (paidComponents.kit || 0) >= kit
        ? "Paid"
        : "Pending";

    const transportStatus =
      (paidComponents.transport || 0) >= transport
        ? "Paid"
        : "Pending";

    const feeSummary = {
      total: tuition.firstTerm + tuition.secondTerm + transport+ kit,
      paid,
      balance,
      tuition: {
        firstTerm: {
          amount: tuition.firstTerm,
          status: tuitionFirstStatus,
          paidAmount: paidComponents["tuition.firstTerm"] || 0,
        },
        secondTerm: {
          amount: tuition.secondTerm,
          status: tuitionSecondStatus,
          paidAmount: paidComponents["tuition.secondTerm"] || 0,
        },
      },
      kit: {
        amount: kit,
        status: kitStatus,
        paidAmount: paidComponents.kit || 0,
      },
      transport: {
        amount: transport,
        status: transportStatus,
        paidAmount: paidComponents.transport || 0,
      },
    };

    return res.json({
      studentId: student._id,
      fullName: student.fullName,
      className: student.className,
      feeSummary,
      feePayments: student.feePayments || [],
    });
  } catch (err) {
    console.error("Error fetching student fee details:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



//----------------------------direct payment--------------------
export const recordDirectFeePayment = async (req, res) => {
  try {
    const { paymentBreakdown, paymentMethod, mode } = req.body;
    const { studentId } = req.params;

    if (!studentId || !paymentBreakdown || typeof paymentBreakdown !== "object" || !paymentMethod || !mode) {
      return res.status(400).json({ error: "Missing or invalid input data" });
    }

    if (!["cash", "upi"].includes(mode.toLowerCase())) {
      return res.status(400).json({ error: "Invalid payment mode (must be 'cash' or 'upi')" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const fee = student.feeStructure;
    if (!fee) return res.status(400).json({ error: "Fee structure not initialized" });

    let totalPaidNow = 0;
    fee.paidComponents = fee.paidComponents || {};

    const paidFor = {
      tuition: false,
      kit: false,
      transport: false,
    };
    let term;

    for (const [component, amountRaw] of Object.entries(paymentBreakdown)) {
      const amount = Number(amountRaw);
      if (!["tuition.firstTerm", "tuition.secondTerm", "kit","transport"].includes(component)) {
        return res.status(400).json({ error: `Invalid component: ${component}` });
      }

      const [main, sub] = component.split(".");
      const maxAllowed = sub ? fee[main]?.[sub] : fee[component];
      const alreadyPaid = fee.paidComponents[component] || 0;

      if ((alreadyPaid + amount) > maxAllowed) {
        return res.status(400).json({ error: `Overpayment in ${component}` });
      }

      fee.paidComponents[component] = alreadyPaid + amount;
      totalPaidNow += amount;

      if (component === "transport") paidFor.transport = true;
      if (component === "kit") paidFor.kit = true;
      if (component === "tuition.firstTerm") {
        paidFor.tuition = true;
        term = "First Term";
      }
      if (component === "tuition.secondTerm") {
        paidFor.tuition = true;
        term = "Second Term";
      }

      if (fee.paidComponents[component] >= maxAllowed) {
        if (sub) {
          if (fee[main]) fee[main][sub] = 0;
        } else {
          fee[component] = 0;
        }
      }
    }

    fee.paid += totalPaidNow;
    const firstTermLeft = fee.tuition.firstTerm;
    const secondTermLeft = fee.tuition.secondTerm;
    const kitLeft = fee.kit;
    const transportLeft = fee.transport;
    fee.balance = Math.max(0, firstTermLeft + secondTermLeft + kitLeft + transportLeft);

    const paymentDate = new Date();
    const transactionId = `${mode}-${Date.now()}`;

    student.feePayments = student.feePayments || [];
    student.feePayments.push({
      amount: totalPaidNow,
      mode,
      transactionId,
      paymentMethod,
      term,
      paidFor,
      breakdown: paymentBreakdown,
      date: paymentDate,
    });

    student.markModified("feeStructure.paidComponents");
    student.markModified("feeStructure.tuition");
    student.markModified("feeStructure.transport");
    student.markModified("feeStructure.kit");

    await student.save();

    const breakdownHtml = Object.entries(paymentBreakdown)
      .map(([k, v]) => `<li>${k}: ₹${v}</li>`)
      .join("");

      const pdfBuffer = await generateFeeReceiptPDF({
        name: student.fullName,
        className: student.className,
        transactionId,
        modeOfTransaction: mode, 
        paymentDate,             
        amount: totalPaidNow,
        balance: fee.balance,
        breakdown: {
          tuitionFirstTerm: paymentBreakdown["tuition.firstTerm"] || 0,
          tuitionSecondTerm: paymentBreakdown["tuition.secondTerm"] || 0,
          transport: paymentBreakdown["transport"] || 0,
          kit: paymentBreakdown["kit"] || 0,
        },
      });

    await sendEmail(
      student.email,
      "Vidhyardhi School - Fee Payment Receipt",
      `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial; background: #fff; border-radius: 8px;">
          <h2 style="text-align: center; color: #4CAF50;">Payment Confirmation</h2>
          <p>Dear <strong>${student.fullName}</strong>,</p>
          <p>We have recorded your payment of <strong>₹${totalPaidNow}</strong> via <strong>${mode.toUpperCase()}</strong> on <strong>${paymentDate.toLocaleString()}</strong>.</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Breakdown:</strong></p>
          <ul>${breakdownHtml}</ul>
          <p><strong>Remaining Balance:</strong> ₹${fee.balance}</p>
          <p>Thank you for your payment.</p>
        </div>
      `,
      [
        {
          filename: `FeeReceipt-${student.fullName}-${Date.now()}.pdf`,
          content: pdfBuffer.toString("base64"),
          contentType: "application/pdf",
          encoding: "base64",
        },
      ]
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FeeReceipt-${student.fullName}-${Date.now()}.pdf`
    );
    return res.send(pdfBuffer);

  } catch (err) {
    console.error("Manual Fee Payment Error:", err);
    return res.status(500).json({ error: "Failed to record payment" });
  }
};






//--------------------------------staff attendance-----------------------

export const markStaffAttendance = async (req, res) => {
  try {
    const { staffId, status } = req.body; // status = 'present' | 'absent' | 'holiday'
    const today = moment().format("YYYY-MM-DD");
    const currentMonth = moment().format("YYYY-MM");

    if (!["present", "absent", "holiday"].includes(status)) {
      return res.status(400).json({ message: "Invalid attendance status" });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // Prevent marking attendance multiple times
    if (!staff.attendance) staff.attendance = {};
    if (!staff.attendance.daily) staff.attendance.daily = {};
    if (staff.attendance.daily[today]) {
      return res.status(400).json({ message: "Attendance already marked for today" });
    }

    // Save today's status
    staff.attendance.daily[today] = status;

    // Update monthly stats
    if (!staff.attendance.monthly) staff.attendance.monthly = {};
    if (!staff.attendance.monthly[currentMonth]) {
      staff.attendance.monthly[currentMonth] = { present: 0, absent: 0, holiday: 0 };
    }
    staff.attendance.monthly[currentMonth][status] += 1;

    // Update yearly stats
    if (!staff.attendance.yearly) {
      staff.attendance.yearly = {
        workingDays: 0,
        presentDays: 0,
        percentage: 0,
      };
    }

    if (status === "present" || status === "absent") {
      staff.attendance.yearly.workingDays += 1;
    }
    if (status === "present") {
      staff.attendance.yearly.presentDays += 1;
    }

    const { presentDays, workingDays } = staff.attendance.yearly;
    staff.attendance.yearly.percentage = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;

    await staff.save();
    return res.status(200).json({ message: "Attendance marked successfully", staff });

  } catch (err) {
    console.error("Attendance Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Optional: Get weekly summary
export const getWeeklyAttendanceSummary = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await Staff.findById(staffId);
    if (!staff || !staff.attendance || !staff.attendance.daily) {
      return res.status(404).json({ message: "No attendance found" });
    }

    const startOfWeek = moment().startOf("isoWeek");
    const endOfWeek = moment().endOf("isoWeek");

    let summary = { present: 0, absent: 0, holiday: 0 };

    for (let date in staff.attendance.daily) {
      const day = moment(date, "YYYY-MM-DD");
      if (day.isBetween(startOfWeek, endOfWeek, null, "[]")) {
        summary[staff.attendance.daily[date]]++;
      }
    }

    return res.status(200).json({ week: `${startOfWeek.format("YYYY-MM-DD")} to ${endOfWeek.format("YYYY-MM-DD")}`, summary });

  } catch (err) {
    return res.status(500).json({ message: "Error fetching weekly summary" });
  }
};


export const markBulkStaffAttendance = async (req, res) => {
  try {
    const { attendanceList, date } = req.body;
    const markDate = moment(date || new Date()).format("YYYY-MM-DD");
    const currentMonth = moment(markDate).format("YYYY-MM");

    const updates = [];

    for (const entry of attendanceList) {
      const { staffId, status } = entry;
      if (!["present", "absent", "holiday"].includes(status)) continue;

      const staff = await Staff.findById(staffId);
      if (!staff) continue;

      // 🛠️ Initialize Maps if undefined
      if (!staff.attendance) staff.attendance = {};
      if (!staff.attendance.daily) staff.attendance.daily = new Map();
      if (!staff.attendance.monthly) staff.attendance.monthly = new Map();

      // ✅ Skip if already marked
      if (staff.attendance.daily.has(markDate)) continue;

      // ✅ Save daily attendance
      staff.attendance.daily.set(markDate, status);
      staff.markModified("attendance.daily");

      // ✅ Update monthly summary
      const monthSummary = staff.attendance.monthly.get(currentMonth) || {
        present: 0,
        absent: 0,
        holiday: 0,
      };
      monthSummary[status] += 1;
      staff.attendance.monthly.set(currentMonth, monthSummary);
      staff.markModified("attendance.monthly");

      // ✅ Update yearly summary
      if (!staff.attendance.yearly) {
        staff.attendance.yearly = { workingDays: 0, presentDays: 0, percentage: 0 };
      }

      if (["present", "absent"].includes(status)) {
        staff.attendance.yearly.workingDays++;
      }
      if (status === "present") {
        staff.attendance.yearly.presentDays++;
      }

      const { workingDays, presentDays } = staff.attendance.yearly;
      staff.attendance.yearly.percentage =
        workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;

      updates.push(staff.save());
    }

    await Promise.all(updates);
    res.status(200).json({ message: "Bulk attendance marked successfully" });
  } catch (err) {
    console.error("Bulk attendance error:", err);
    res.status(500).json({ message: "Bulk attendance failed" });
  }
};


export const getStaffAttendanceReport = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { month } = req.query; // e.g. "2025-07"

    const staff = await Staff.findById(staffId);
    if (!staff || !staff.attendance || !staff.attendance.daily) {
      return res.status(404).json({ message: "Staff not found or no attendance" });
    }

    const dailyRecords = Array.from(staff.attendance.daily.entries())
      .filter(([date]) => date.startsWith(month))
      .map(([date, status]) => ({ date, status }));

    const summary = { present: 0, absent: 0, holiday: 0 };
    let workingDays = 0;

    for (const { status } of dailyRecords) {
      if (summary[status] !== undefined) summary[status]++;
      if (["present", "absent"].includes(status)) workingDays++;
    }

    const presentDays = summary.present;
    const percentage = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;

    res.status(200).json({
      month,
      summary,
      dailyRecords,
      yearly: { workingDays, presentDays, percentage },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching report" });
  }
};
