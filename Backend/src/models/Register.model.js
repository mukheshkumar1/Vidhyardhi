import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
  fullName: String,
  parentName: String,
  relation: String,
  previousSchool: String,
  siblings: String,
  studentAge: String,
  className: String,

  email: { type: String, unique: true },
  phone: String,
  date: { type: Date, default: Date.now },
});

export const RegisterModel = mongoose.model("Register", registerSchema);
