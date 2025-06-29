// models/homework.js
import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema({
  title: String,
  className: String,
  subject: String,
  description: String,
  deadline: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  driveLink: String, // For PDF assignment
  studentSubmissions: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    fileUrl: String,
    status: { type: String, enum: ['submitted', 'checked'], default: 'submitted' },
    marks: Number,
    comments: String,
    submittedAt: Date
  }],
  fullyCheckedAt: Date, // 👈 used for auto-delete
}, { timestamps: true });

export default mongoose.model('Homework', homeworkSchema);
