import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventModal from "./EventModal";
import DeleteEventButton from "../components/DeleteEvent";
import { toast } from "sonner";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function Calendar({ isAdmin }: { isAdmin?: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const [showAllCurrentMonthEvents, setShowAllCurrentMonthEvents] = useState(false);
  const [showAllUpcomingEvents, setShowAllUpcomingEvents] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/getevents");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Called after adding/editing an event in the modal
  const handleRefresh = async () => {
    try {
      await fetchEvents();
      toast.success("Event saved successfully");
      setOpenModal(false);
    } catch {
      toast.error("Failed to refresh events after saving");
    }
  };

  const today = new Date();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentMonthEvents = events.filter((event: any) => {
    const date = new Date(event.date);
    return date.getFullYear() === selectedYear && date.getMonth() === currentMonth;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upcomingEvents = events.filter((event: any) => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate.getFullYear() === selectedYear;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Events Calendar</h2>

        <div className="flex gap-4 items-center">
          <select
            className="border rounded px-2 py-1 text-sm bg-background"
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setShowAllCurrentMonthEvents(false);
              setShowAllUpcomingEvents(false);
            }}
          >
            {years.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>

          {isAdmin && (
            <Button onClick={() => { setSelectedEvent(null); setOpenModal(true); }}>
              + Add Event
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          Events in {months[currentMonth]} {selectedYear}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {(showAllCurrentMonthEvents ? currentMonthEvents : currentMonthEvents.slice(0, 3)).length > 0 ? 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (showAllCurrentMonthEvents ? currentMonthEvents : currentMonthEvents.slice(0, 3)).map((event: any) => (
            <motion.div
              key={event._id}
              layout
              whileHover={{ scale: 1.02 }}
              className="bg-card p-4 rounded-lg shadow-md border relative cursor-pointer"
              onClick={() => {
                if (!isAdmin) {
                  setSelectedEvent(event);
                  setOpenModal(true);
                }
              }}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  {event.title}
                </h3>
                {isAdmin && (
                  <DeleteEventButton
                    eventId={event._id}
                    onDelete={() => {
                      fetchEvents();
                      if (selectedEvent?._id === event._id) {
                        setSelectedEvent(null);
                        setOpenModal(false);
                      }
                    }}
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(event.date).toDateString()}
              </p>
              {event.description && (
                <p className="mt-2 text-sm">{event.description}</p>
              )}
            </motion.div>
          )) : (
            <p className="text-muted-foreground italic">No events this month.</p>
          )}
        </div>
        {currentMonthEvents.length > 3 && (
          <Button
            variant="link"
            className="mt-2 px-0"
            onClick={() => setShowAllCurrentMonthEvents(!showAllCurrentMonthEvents)}
          >
            {showAllCurrentMonthEvents ? "Show Less" : `See All ${currentMonthEvents.length} Events`}
          </Button>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {(showAllUpcomingEvents ? upcomingEvents : upcomingEvents.slice(0, 3)).length > 0 ? 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (showAllUpcomingEvents ? upcomingEvents : upcomingEvents.slice(0, 3)).map((event: any) => (
            <motion.div
              key={`upcoming-${event._id}`}
              layout
              whileHover={{ scale: 1.02 }}
              className="bg-muted p-4 rounded-lg shadow-sm border cursor-pointer"
              onClick={() => {
                if (!isAdmin) {
                  setSelectedEvent(event);
                  setOpenModal(true);
                }
              }}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-md font-medium flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  {event.title}
                </h3>
                {isAdmin && (
                  <DeleteEventButton
                    eventId={event._id}
                    onDelete={() => {
                      fetchEvents();
                      if (selectedEvent?._id === event._id) {
                        setSelectedEvent(null);
                        setOpenModal(false);
                      }
                    }}
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{new Date(event.date).toDateString()}</p>
            </motion.div>
          )) : (
            <p className="text-muted-foreground italic">No upcoming events.</p>
          )}
        </div>
        {upcomingEvents.length > 3 && (
          <Button
            variant="link"
            className="mt-2 px-0"
            onClick={() => setShowAllUpcomingEvents(!showAllUpcomingEvents)}
          >
            {showAllUpcomingEvents ? "Show Less" : `See All ${upcomingEvents.length} Events`}
          </Button>
        )}
      </div>

      <EventModal
        open={openModal}
        onOpenChange={setOpenModal}
        event={selectedEvent}
        refresh={handleRefresh}  // <== show toast on add/edit inside modal
      />
    </div>
  );
}
