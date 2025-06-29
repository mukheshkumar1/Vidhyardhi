// models/VotingPeriod.js
import mongoose from "mongoose";

const votingPeriodSchema = new mongoose.Schema({
  className: { type: String, required: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

export default mongoose.model("VotingPeriod", votingPeriodSchema);
