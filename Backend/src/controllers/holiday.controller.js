// controllers/holidayEvent.controller.js
import HolidayEvent from "../models/holiday.model.js";

// Add holiday or special day
export const addHolidayEvent = async (req, res) => {
  try {
    const { title, date, type, description } = req.body;

    const newEvent = new HolidayEvent({ title, date, type, description });
    await newEvent.save();

    res.status(201).json({ message: "Event added successfully", event: newEvent });
  } catch (err) {
    res.status(500).json({ error: "Failed to add event", details: err.message });
  }
};

// Get all events (optional: by month)
export const getEventsByMonth = async (req, res) => {
  try {
    const { month, year } = req.query;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const events = await HolidayEvent.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events", details: err.message });
  }
};

// Get all events (for full calendar rendering)
export const getAllEvents = async (req, res) => {
  try {
    const events = await HolidayEvent.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all events", details: err.message });
  }
};
