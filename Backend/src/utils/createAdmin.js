import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/user.model.js';

const createAdmin = async () => {
  await mongoose.connect('MONGODB_URI');

  const hashedPassword = await bcrypt.hash('Suneetha@123', 12);
  const admin = new User({
    fullName: "Mukhesh",
    email: "darkdevil7032@gmail.com",
    mobileNumber: "7989727273",
    password: hashedPassword,
    gender: "Other",
    role: "admin"
  });

  await admin.save();
  console.log("Admin user created");
  process.exit();
};

createAdmin();
