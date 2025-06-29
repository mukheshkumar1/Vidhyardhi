import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res, role = "staff") => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "15d"
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
};

export default generateTokenAndSetCookie;
