import jwt from "jsonwebtoken";
import Student from "../models/student.model.js";

const protectStudentRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized. No token found." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "student") {
      return res.status(403).json({ error: "Access denied. Student role required." });
    }

    const student = await Student.findById(decoded.userId).select("-password");
    if (!student) {
      return res.status(401).json({ error: "Unauthorized. Student not found." });
    }

    req.user = {
      ...student._doc,
      role: decoded.role
    };

    next();
  } catch (err) {
    console.error("Student Error:", err.message);
    return res.status(401).json({ error: "Unauthorized. Invalid token." });
  }
};

export default protectStudentRoute;
