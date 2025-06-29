// middleware/isAdmin.js
import jwt from "jsonwebtoken";
import Staff from "../models/user.model.js";

export const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Staff.findById(decoded.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    req.user = user; // attach user to request for optional use later
    next();
  } catch (err) {
    console.error("isAdmin Middleware Error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};



