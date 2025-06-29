import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  amount: Number,
  mode: String,
  transactionId: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);
