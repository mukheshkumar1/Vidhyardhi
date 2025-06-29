import { useEffect, useState, useCallback } from "react";
import axios from "axios";

interface Student {
  _id: string;
  fullName: string;
  class: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  profilePicture?: {
    imageUrl: string;
  };
  performance?: {
    [key: string]: Record<string, number>;
  };
  attendance?: {
    yearly: {
      presentDays: number;
      workingDays: number;
      percentage: number;
    };
  };
  feeStructure?: {
    total: number;
    paid: number;
    balance: number;
  };
}

const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/students", { withCredentials: true }); // 👈 include credentials
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStudent = async (studentId: string) => {
    try {
      await axios.delete(`/api/admin/students/${studentId}`, { withCredentials: true }); // 👈 include credentials
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const refreshStudents = () => {
    fetchStudents();
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    deleteStudent,
    refreshStudents,
  };
};

export default useStudents;
