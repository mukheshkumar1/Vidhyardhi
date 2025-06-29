import mongoose from "mongoose";

const holidayEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ["Holiday", "Special Day"],
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

export default mongoose.model("HolidayEvent", holidayEventSchema);
