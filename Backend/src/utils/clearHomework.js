import cron from 'node-cron';
import Student from '../models/student.model.js'; // adjust path as needed

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const students = await Student.find({});

    for (const student of students) {
      const originalLength = student.homework.length;

      // Filter out homeworks submitted more than 7 days ago
      student.homework = student.homework.filter(hw => {
        if (!hw.submittedAt) return true;
        return new Date(hw.submittedAt) > oneWeekAgo;
      });

      if (student.homework.length !== originalLength) {
        await student.save();
        console.log(`Cleaned up homework for student: ${student.fullName}`);
      }
    }
  } catch (err) {
    console.error('Error cleaning up old homework:', err);
  }
});
