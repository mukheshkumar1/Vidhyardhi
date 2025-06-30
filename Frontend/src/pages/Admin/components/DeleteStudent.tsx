// components/DeleteStudent.tsx
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface DeleteStudentProps {
  studentId: string;
  studentName: string;
  onDeleted: (deletedId: string) => void;
}

const DeleteStudent: React.FC<DeleteStudentProps> = ({ studentId, studentName, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${studentName}?`);
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/admin/student/${studentId}/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete student");
      }

      toast.success("Student deleted successfully");
      onDeleted(studentId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Error deleting student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
      title="Delete Student"
    >
      <Trash2 className="w-5 h-5" />
      Delete
    </button>
  );
};

export default DeleteStudent;
