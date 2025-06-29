import React, { useEffect, useState } from "react";

interface Student {
  _id: string;
  id: string;
  fullName: string;
  className: string;
  email?: string;
  phone?: string;
}

const StudentsByClassList: React.FC = () => {
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStudentsByClass = async () => {
    if (!className.trim()) {
      setStudents([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/staff/class/${encodeURIComponent(className)}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch students");
      setStudents(data.students);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsByClass();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className]);

  return (
    <div className="p-4 bg-white rounded shadow max-w-4xl">
      <h3 className="text-xl font-bold mb-4">Students by Class</h3>

      <input
        type="text"
        placeholder="Enter class name (e.g. 10A)"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        className="border rounded px-3 py-2 mb-4 w-60"
      />

      {loading && <p>Loading students...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && students.length === 0 && className.trim() !== "" && (
        <p>No students found in this class.</p>
      )}

      {students.length > 0 && (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1">Name</th>
              <th className="border border-gray-300 px-2 py-1">Class</th>
              {/* Add email and phone columns only if backend sends those fields */}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id || s._id}>
                <td className="border border-gray-300 px-2 py-1">{s.fullName}</td>
                <td className="border border-gray-300 px-2 py-1">{s.className}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentsByClassList;
