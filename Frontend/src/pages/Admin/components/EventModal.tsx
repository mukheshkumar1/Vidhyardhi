import { useState, useEffect, SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EventModal({ open, onOpenChange, event, refresh }: any) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(new Date(event.date).toISOString().substring(0, 10));
      setDescription(event.description || "");
    } else {
      setTitle("");
      setDate("");
      setDescription("");
    }
  }, [event]);

  const handleSubmit = async () => {
    if (!title || !date) return;

    const payload = { title, date, description };
    const options = {
      method: event?._id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    };

    try {
      const url = event?._id
        ? `http://localhost:5000/api/admin/${event._id}/update`
    : "http://localhost:5000/api/admin/addevents";

      const response = await fetch(url, options);

      if (!response.ok) throw new Error("Failed to submit event");

      refresh();
      onOpenChange(false);
    } catch (err) {
      console.error("Event submission error:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent  className="
    bg-white/20  
    backdrop-blur-md  
    border border-white/30  
    shadow-lg shadow-black/40  
    rounded-xl
    text-white
    p-6
  ">
        <DialogHeader>{event ? "Edit Event" : "Add Event"}</DialogHeader>
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e: { target: { value: SetStateAction<string> } }) =>
            setDescription(e.target.value)
          }
        />
        <Button onClick={handleSubmit}>
          {event ? "Update" : "Add"} Event
        </Button>
      </DialogContent>
    </Dialog>
  );
}
