import Staff from "../models/user.model.js";
import Student from "../models/student.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";

// Generate random password and hash it
const generateHashedPassword = async () => {
  const rawPassword = crypto.randomBytes(4).toString("hex");
  const hashedPassword = await bcrypt.hash(rawPassword, 12);
  return { rawPassword, hashedPassword };
};

// ---------------------- SIGNUPS ----------------------

// ✅ Admin Signup with Secret
export const adminSignup = async (req, res) => {
  try {
    const { fullName,email, mobileNumber, password, confirmPassword, gender, salary, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin secret." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await Staff.findOne({ fullName });
    if (existingUser) {
      return res.status(400).json({ error: "fullName already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const initial = fullName?.trim()?.charAt(0).toUpperCase() || "S";
    const defaultAvatar = `https://ui-avatars.com/api/?name=${initial}&background=random&color=fff&size=128`;

    const newAdmin = new Staff({
      fullName,
      email,
      mobileNumber,
      password: hashedPassword,
      gender,
      profilePicture: {
        imageUrl: defaultAvatar,
      },
      salary,
      role: "admin"
    });

    await newAdmin.save();
    generateTokenAndSetCookie(newAdmin._id, res, "admin");

    res.status(201).json({
      message: "Admin account created successfully",
      user: {
        _id: newAdmin._id,
        fullName: newAdmin.fullName,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error("Admin Signup Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// ---------------------- LOGINS ----------------------

// ✅ Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    const admin = await Staff.findOne({ mobileNumber, role: "admin" });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) return res.status(400).json({ error: "Invalid password" });

    generateTokenAndSetCookie(admin._id, res, "admin");

    res.status(200).json({
      message: "Admin login successful",
      user: {
        _id: admin._id,
        fullName: admin.fullName,
        mobileNumber: admin.mobileNumber,
        role: "admin"
      }
    });
  } catch (error) {
    console.error("Admin Login Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Staff Login
export const staffLogin = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    const staff = await Staff.findOne({ mobileNumber, role: "staff" });
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    const isPasswordCorrect = await bcrypt.compare(password, staff.password);
    if (!isPasswordCorrect) return res.status(400).json({ error: "Invalid password" });

    generateTokenAndSetCookie(staff._id, res, "staff");

    res.status(200).json({
      message: "Staff login successful",
      user: {
        _id: staff._id,
        fullName: staff.fullName,
        mobileNumber: staff.mobileNumber,
        role: "staff"
      }
    });
  } catch (error) {
    console.error("Staff Login Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Student Login
export const studentLogin = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    const student = await Student.findOne({ phone: mobileNumber });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const isPasswordCorrect = await bcrypt.compare(password, student.password);
    if (!isPasswordCorrect) return res.status(400).json({ error: "Invalid password" });

    generateTokenAndSetCookie(student._id, res, "student");

    res.status(200).json({
      message: "Student login successful",
      user: {
        _id: student._id,
        fullName: student.fullName,
        mobileNumber: student.phone,
        role: "student"
      }
    });
  } catch (error) {
    console.error("Student Login Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ---------------------- LOGOUT ----------------------
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//------------------------- Forgot and Reset Password--------------------------------------

export const forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    const student = await Student.findOne({ phone });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const otp = generateOTP();
    student.otp = otp;
    student.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await student.save({ validateBeforeSave: false }); // ⬅️ Skip full schema validation

    await sendEmail(
      student.email,
      "OTP for Password Reset",
      `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px;">
          <div style="text-align: center;">
            <img src="https://res.cloudinary.com/demj86hzs/image/upload/v1749547385/logo1_qlduf9.png" alt="Vidhyardhi School Logo" style="max-width: 120px; margin-bottom: 20px;" />
          </div>
          <p style="text-align: center;">Hello ${student.fullName},</p>
          <p>Your OTP for password reset is:</p>
          <h2 style="text-align: center;">${otp}</h2>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      </div>
      `
    );

    res.status(200).json({ message: "OTP sent to registered email" });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


export const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    const student = await Student.findOne({ phone });

    if (!student || student.otp !== otp || student.otpExpires < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    student.password = hashedPassword;
    student.otp = null;
    student.otpExpires = null;

    await student.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


//----------------------- Forgot password Staff---------------------------
export const forgotPasswordStaff = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    const staff = await Staff.findOne({ mobileNumber, role: "staff" });

    if (!staff) {
      return res.status(404).json({ error: "Staff not found" });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Staff.updateOne(
      { _id: staff._id },
      { $set: { otp, otpExpires } }
    );

    await sendEmail(
      staff.email,
      "OTP for Password Reset",
      `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px;">
            <div style="text-align: center;">
              <img src="https://res.cloudinary.com/demj86hzs/image/upload/v1749547385/logo1_qlduf9.png" alt="Vidhyardhi School Logo" style="max-width: 120px; margin-bottom: 20px;" />
            </div>
            <p style="text-align: center;">Hello ${staff.fullName},</p>
            <p>Your OTP for password reset is:</p>
            <h2 style="text-align: center;">${otp}</h2>
            <p>This OTP is valid for 10 minutes.</p>
          </div>
        </div>
      `
    );

    res.status(200).json({ message: "OTP sent to registered email" });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyOtpAndResetPasswordStaff = async (req, res) => {
  try {
    const { mobileNumber, otp, newPassword } = req.body;

    const staff = await Staff.findOne({ mobileNumber, role: "staff" });

    if (!staff || staff.otp !== otp || staff.otpExpires < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Staff.updateOne(
      { _id: staff._id },
      {
        $set: {
          password: hashedPassword,
          otp: null,
          otpExpires: null,
        },
      }
    );

    // ✅ Send confirmation email
    await sendEmail(
      staff.email,
      "Password Reset Successful",
      `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px;">
            <div style="text-align: center;">
              <img src="https://res.cloudinary.com/demj86hzs/image/upload/v1749547385/logo1_qlduf9.png" alt="Vidhyardhi School Logo" style="max-width: 120px; margin-bottom: 20px;" />
            </div>
            <h2 style="text-align: center;">Hello ${staff.fullName},</h2>
            <p style="text-align: center;">Your password has been successfully reset.</p>
            <p>If this wasn't you, please contact the school administrator immediately.</p>
            <p style="text-align: center; font-size: 14px; color: #888;">- Vidhyardhi School</p>
          </div>
        </div>
      `
    );

    res.status(200).json({ message: "Password reset successful and confirmation email sent" });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

