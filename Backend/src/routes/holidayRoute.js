// routes/holidayEvent.routes.js
import express from "express";
import {
  addHolidayEvent,
  getEventsByMonth,
  getAllEvents
} from "../controllers/holiday.controller.js";

const router = express.Router();

router.post("/admin/holiday-event", addHolidayEvent);
router.get("/events", getAllEvents);
router.get("/events/by-month", getEventsByMonth);

export default router;
