// hooks/useStudentDelete.ts
import { useCallback } from "react";
import toast from "react-hot-toast";

interface UseStudentDeleteOptions {
  onSuccess?: (deletedId: string) => void;
}

const useStudentDelete = ({ onSuccess }: UseStudentDeleteOptions = {}) => {
  const deleteStudent = useCallback(async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/student/${id}/delete`, { 
        method: "DELETE", 
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete student");

      toast.success("Student deleted successfully");
      onSuccess?.(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Deletion failed");
    }
  }, [onSuccess]);

  return deleteStudent;
};

export default useStudentDelete;
