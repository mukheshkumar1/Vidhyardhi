// components/DeleteStaff.tsx
import React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteStaffProps {
  staffId: string;
  role: string;
  onDeleted: () => void;
}

const DeleteStaff: React.FC<DeleteStaffProps> = ({ staffId, role, onDeleted }) => {
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this staff member?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/admin/staff/${staffId}/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      toast.success(data.message || "Staff deleted successfully");
      onDeleted();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  if (role === "admin") return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleDelete();
      }}
      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
      title="Delete Staff"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
};

export default DeleteStaff;
