import { RegisterModel } from "../models/Register.model.js";
import sendEmail from "../utils/sendEmail.js"; // your email utility
import { getIO } from "../utils/socket.js"; // socket instance

export const register = async (req, res) => {
  try {
    const { fullName, parentName, relation,previousSchool,siblings, studentAge, className, email, phone } = req.body;

    if (!fullName || !parentName || !studentAge || !className || !email || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await RegisterModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const user = new RegisterModel({ fullName, parentName,relation,previousSchool,siblings, studentAge, className, email, phone });
    await user.save();

    // ✅ Send confirmation email to student
    await sendEmail(
        email,
      "🎉 Registration Successful - Vidhyardhi School",
  `
  <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9;">
    <div style="text-align: center;">
      <img src="https://res.cloudinary.com/demj86hzs/image/upload/v1746683193/logo5_vtqy9w.png" alt="Vidhyardhi School Logo" style="max-width: 120px; margin-bottom: 20px;" />
      <h2 style="color: #2c3e50;">🎉 Registration Successful</h2>
    </div>
    <p>Dear <strong>${fullName}</strong>,</p>
    <p>Thank you for registering with <strong>Vidhyardhi School</strong>. We have received your details and will get in touch with you soon.</p>
    <div style="background: #ffffff; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p><strong>👤 Student Name:</strong> ${fullName}</p>
      <p><strong>👨‍👩‍👧 Parent's Name:</strong> ${parentName}</p>
      <p><strong>🔗 Relation:</strong> ${relation}</p>
      <p><strong>🎓 Class:</strong> ${className}</p>
       <p><strong>👥 Siblings:</strong> ${siblings}</p>
      <p><strong>🏫 Previous School:</strong> ${previousSchool}</p>
      <p><strong>📞 Phone:</strong> ${phone}</p>
      <p><strong>📧 Email:</strong> ${email}</p>
     
      
  
    </div>
    <p style="color: #777;">📅 Submitted on: ${new Date().toLocaleString()}</p>
    <p style="text-align: center; margin-top: 30px; color: #999;">This is an automated confirmation from Vidhyardhi School.</p>
  </div>
  `
    );

    // ✅ Send alert email to admin
    const adminEmail = process.env.ADMIN_EMAIL || "darkdevil7032@gmail.com";
    await sendEmail(
        adminEmail,
        "📩 New Student Registration Alert",
        `
        <div style="max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; font-family: Arial, sans-serif; background-color: #fdfdfd;">
          <div style="text-align: center;">
            <img src="https://res.cloudinary.com/demj86hzs/image/upload/v1746683193/logo5_vtqy9w.png" alt="Vidhyardhi Logo" style="height: 80px; margin-bottom: 20px;" />
            <h2 style="color: #e67e22;">📩 New Registration Alert</h2>
          </div>
         <p><strong>👤 Student Name:</strong> ${fullName}</p>
         <p><strong>👨‍👩‍👧 Parent's Name:</strong> ${parentName}</p>
        <p><strong>🔗 Relation:</strong> ${relation}</p>
        <p><strong>🎓 Class:</strong> ${className}</p>
         <p><strong>👥 Siblings:</strong> ${siblings}</p>
         <p><strong>🏫 Previous School:</strong> ${previousSchool}</p>
          <p><strong>📞 Phone:</strong> ${phone}</p>
           <p><strong>📧 Email:</strong> ${email}</p>
          <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
        </div>
        `
    );

    // ✅ Emit socket alert to admin
    //  const io = getIO();
    //  io.emit("new-registration", user); // frontend should listen to this event

    res.status(201).json({ message: "Registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await RegisterModel.find().sort({ timestamp: -1 });
    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch registrations." });
  }
};

// DELETE registration by ID
export const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    await RegisterModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Registration deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete registration." });
  }
};
