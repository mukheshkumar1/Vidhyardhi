import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res, role = "staff") => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "15d"
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true,
    secure: true,               // 🔒 Important for HTTPS (Render uses HTTPS)
    sameSite: "None",  
  });
};

export default generateTokenAndSetCookie;
