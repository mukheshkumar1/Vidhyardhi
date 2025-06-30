import { useEffect, useState } from "react";
import { format, isSameDay, getMonth, getYear } from "date-fns";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../../../index.css';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type HolidayEvent = {
  _id: string;
  title: string;
  date: string;
  type: "Holiday" | "Special Day";
  description?: string;
};

export default function AdminHolidayCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<HolidayEvent[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    type: "Holiday",
    description: "",
  });

  const fetchEvents = async (month: number, year: number) => {
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/holiday/events/by-month?month=${month + 1}&year=${year}`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error("Fetch error", err);
      toast.error("Failed to load events");
    }
  };

  useEffect(() => {
    const month = getMonth(selectedDate);
    const year = getYear(selectedDate);
    fetchEvents(month, year);
  }, [selectedDate]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.date) {
      toast.error("Please fill in title and date");
      return;
    }
    try {
      const res = await fetch("https://vidhyardhi.onrender.com/api/holiday/admin/holiday-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Event added successfully!");
        setFormData({ title: "", date: "", type: "Holiday", description: "" });
        fetchEvents(getMonth(selectedDate), getYear(selectedDate));
      } else {
        toast.error(data.error || "Failed to add event.");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Error adding event");
    }
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <motion.h2
        className="text-2xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        📅 Admin Special Days & Holiday Calendar
      </motion.h2>

      <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
        <div >
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date as Date)}
            inline
            calendarStartDay={1}
            dayClassName={(date) => {
              const match = events.find((e) => isSameDay(new Date(e.date), date));
              return match ? (match.type === "Holiday" ? "bg-red-200 rounded-full" : "bg-blue-200 rounded-full") : "";
            }}
          />
        </div>

        <div className="w-full md:w-1/3 bg-transparent">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg">
                ➕ Add Holiday/Special Day
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-transparent">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <Input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Holiday">Holiday</option>
                  <option value="Special Day">Special Day</option>
                </select>
                <Textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button onClick={handleSubmit} className="bg-blue-600 text-white">
                  Save Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">
          Events in {format(selectedDate, "MMMM yyyy")}
        </h3>
        {sortedEvents.length === 0 ? (
          <p className="text-white">No holidays or special days this month.</p>
        ) : (
          <ul className="space-y-3">
            {sortedEvents.map((event) => {
              const parsedDate = new Date(event.date);
              if (isNaN(parsedDate.getTime())) return null;
              return (
                <li
                  key={event._id}
                  className={`p-3 rounded-md shadow border-l-4 bg-transparent ${
                    event.type === "Holiday"
                      ? "border-red-500 bg-red-100"
                      : "border-blue-500 bg-blue-100"
                  }`}
                >
                  <span className="font-bold">{format(parsedDate, "do MMM yyyy")}:</span>{" "}
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
