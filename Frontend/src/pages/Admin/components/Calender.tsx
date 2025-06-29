import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function Calendar() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showAllCurrentMonthEvents, setShowAllCurrentMonthEvents] = useState(false);
  const [showAllUpcomingEvents, setShowAllUpcomingEvents] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/getevents");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const today = new Date();

  const currentMonthEvents = events.filter((event) => {
    const date = new Date(event.date);
    return date.getFullYear() === selectedYear && date.getMonth() === currentMonth;
  });

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate.getFullYear() === selectedYear;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold text-white">Events Calendar</h2>
        </div>

        <select
          className="border rounded px-2 py-1 text-sm bg-background text-white"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(Number(e.target.value));
            setShowAllCurrentMonthEvents(false);
            setShowAllUpcomingEvents(false);
          }}
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Current Month Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg shadow-black/40 rounded-xl text-white p-6 mb-6"
      >
        <h3 className="text-lg font-semibold mb-4">
          Events in {months[currentMonth]} {selectedYear}
        </h3>

        {currentMonthEvents.length > 0 ? (
          <ul className="list-disc list-inside space-y-2">
            {(showAllCurrentMonthEvents ? currentMonthEvents : currentMonthEvents.slice(0, 3)).map(
              (event) => (
                <li key={event._id}>
                  <strong>{event.title}</strong> – {new Date(event.date).toDateString()}
                  {event.description && (
                    <p className="text-sm text-white/80 ml-4">{event.description}</p>
                  )}
                </li>
              )
            )}
          </ul>
        ) : (
          <p className="text-white/70 italic">No events this month.</p>
        )}

        {currentMonthEvents.length > 3 && (
          <Button
            variant="link"
            className="mt-2 px-0 text-white"
            onClick={() => setShowAllCurrentMonthEvents(!showAllCurrentMonthEvents)}
          >
            {showAllCurrentMonthEvents ? "Show Less" : `See All ${currentMonthEvents.length} Events`}
          </Button>
        )}
      </motion.div>

      {/* Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/20 backdrop-blur-md border border-white/30 shadow-lg shadow-black/40 rounded-xl text-white p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>

        {upcomingEvents.length > 0 ? (
          <ul className="list-disc list-inside space-y-2">
            {(showAllUpcomingEvents ? upcomingEvents : upcomingEvents.slice(0, 3)).map(
              (event) => (
                <li key={`upcoming-${event._id}`}>
                  <strong>{event.title}</strong> – {new Date(event.date).toDateString()}
                </li>
              )
            )}
          </ul>
        ) : (
          <p className="text-white/70 italic">No upcoming events.</p>
        )}

        {upcomingEvents.length > 3 && (
          <Button
            variant="link"
            className="mt-2 px-0 text-white"
            onClick={() => setShowAllUpcomingEvents(!showAllUpcomingEvents)}
          >
            {showAllUpcomingEvents ? "Show Less" : `See All ${upcomingEvents.length} Events`}
          </Button>
        )}
      </motion.div>
    </div>
  );
}
