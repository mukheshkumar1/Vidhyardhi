import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteEventButtonProps {
  eventId: string;
  onDelete: () => void;
}

export default function DeleteEventButton({ eventId, onDelete }: DeleteEventButtonProps) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/${eventId}/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Event deleted successfully");
        onDelete(); // Trigger parent refresh
      } else {
        toast.error("Failed to delete event");
        console.error("Delete failed");
      }
    } catch (error) {
      toast.error("Error deleting event");
      console.error("Error deleting event:", error);
    }
  };

  return (
    <span title="Delete Event">
      <Trash2
        className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
      />
    </span>
  );
}
