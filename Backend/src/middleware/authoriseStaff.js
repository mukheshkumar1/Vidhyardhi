import jwt from "jsonwebtoken";
import Staff from "../models/user.model.js"; // or "staff.model.js" if separated

export const requireStaff = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Staff.findById(decoded.userId);

    if (!user || user.role !== "staff") {
      return res.status(403).json({ error: "Access denied. Staff only." });
    }

    // Optional: only allow staff who are permitted to edit students
    if (!user.permissions?.canEditStudents) {
      return res.status(403).json({ error: "Access denied. Permission required." });
    }

    req.user = user; // attach user to request for later use
    next();
  } catch (err) {
    console.error("requireStaff Middleware Error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
