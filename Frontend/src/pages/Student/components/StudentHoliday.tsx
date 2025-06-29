import { useEffect, useState } from "react";
import { format, isSameDay, getMonth, getYear } from "date-fns";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type HolidayEvent = {
  _id: string;
  title: string;
  date: string;
  type: "Holiday" | "Special Day";
  description?: string;
};

export default function StudentHolidayCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleMonthDate, setVisibleMonthDate] = useState(new Date());
  const [events, setEvents] = useState<HolidayEvent[]>([]);

  const fetchEvents = async (month: number, year: number) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/holiday/events/by-month?month=${month + 1}&year=${year}`
      );
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  // 🔁 Fetch events when visible month changes
  useEffect(() => {
    const month = getMonth(visibleMonthDate);
    const year = getYear(visibleMonthDate);
    fetchEvents(month, year);
  }, [visibleMonthDate]);

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <motion.h2
        className="text-2xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        🎓 Student Holiday & Special Day Calendar
      </motion.h2>

      <div className="bg-white rounded shadow-md p-4">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            setSelectedDate(date as Date);
            setVisibleMonthDate(date as Date); // Also update visible month
          }}
          onMonthChange={(date) => setVisibleMonthDate(date)}
          onYearChange={(date) => setVisibleMonthDate(date)}
          inline
          calendarStartDay={1}
          dayClassName={(date) => {
            const match = events.find((e) => isSameDay(new Date(e.date), date));
            return match
              ? match.type === "Holiday"
                ? "bg-red-200 rounded-full"
                : "bg-blue-200 rounded-full"
              : "";
          }}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">
          Events in {format(visibleMonthDate, "MMMM yyyy")}
        </h3>
        {sortedEvents.length === 0 ? (
          <p className="text-gray-600">
            No holidays or special days this month.
          </p>
        ) : (
          <ul className="space-y-3">
            {sortedEvents.map((event) => {
              const parsedDate = new Date(event.date);
              if (isNaN(parsedDate.getTime())) return null;
              return (
                <li
                  key={event._id}
                  className={`p-3 rounded-md shadow border-l-4 ${
                    event.type === "Holiday"
                      ? "border-red-500 bg-red-100"
                      : "border-blue-500 bg-blue-100"
                  }`}
                >
                  <span className="font-bold">
                    {format(parsedDate, "do MMM yyyy")}:
                  </span>{" "}
                  {event.title}{" "}
                  <span
                    className={`text-sm font-medium ${
                      event.type === "Holiday" ? "text-red-500" : "text-blue-500"
                    }`}
                  >
                    ({event.type})
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
