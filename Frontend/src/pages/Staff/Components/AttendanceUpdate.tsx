import { useEffect, useState } from "react";

type AttendanceStatus = true | false | "holiday";
type AttendanceMap = Record<string, AttendanceStatus>;

type Student = {
  _id: string;
  fullName: string;
  className: string;
  attendance: {
    monthly?: Record<
      string,
      {
        presentDays: number;
        workingDays: number;
        percentage: number;
      }
    >;
    yearly?: {
      presentDays: number;
      workingDays: number;
      percentage: number;
    };
  };
};

const AttendanceManager = () => {
  const [classes] = useState<string[]>([
     "Grade 1", "Grade 2", "Grade 3",
    "Grade 4", "Grade 5", "Grade 6", "Grade 7", 
  ]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<AttendanceMap>({});
  const [monthlyData, setMonthlyData] = useState<Student[]>([]);
  const [yearlyData, setYearlyData] = useState<Student[]>([]);

  useEffect(() => {
    if (!selectedClass) return setStudents([]);
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `https://vidhyardhi.onrender.com/api/staff/class/${encodeURIComponent(selectedClass)}`,
          { credentials: "include" }
        );
        const data = await res.json();
        setStudents(data.students || []);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const handleAttendanceChange = (studentId: string, value: string) => {
    const status: AttendanceStatus =
      value === "present" ? true :
      value === "absent" ? false : "holiday";
    setDailyAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markDailyAttendance = async () => {
    if (!date || !selectedClass) return alert("Please select both class and date.");

    const records = Object.entries(dailyAttendance).map(([studentId, status]) => ({
      studentId,
      status: status === true ? "Present" : status === false ? "Absent" : "Holiday"
    }));

    if (records.length === 0) return alert("Please mark attendance for at least one student.");

    try {
      const res = await fetch(
        `https://vidhyardhi.onrender.com/api/staff/attendance/daily/${selectedClass}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ date, className: selectedClass, attendanceRecords: records })
        }
      );
      const data = await res.json();
      alert(data.message || "Attendance submitted.");
    } catch (err) {
      console.error("Daily attendance error:", err);
      alert("Failed to submit attendance.");
    }
  };

  const calculateMonthlyAndYearly = async () => {
    if (!selectedClass || !month) return alert("Select class and month.");

    try {
      const res = await fetch(
        `https://vidhyardhi.onrender.com/api/staff/attendance/monthly/${selectedClass}/${month}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        }
      );
      const data = await res.json();
      setMonthlyData(data.students || []);
      setYearlyData(data.students || []);
    } catch (err) {
      console.error("Calculation error:", err);
      alert("Failed to calculate attendance.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Attendance Manager</h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <select
          className="border p-2 rounded"
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <button
          onClick={markDailyAttendance}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Daily Attendance
        </button>
      </div>

      {/* Daily Table */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Class</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map(s => (
                <tr key={s._id}>
                  <td className="p-2 border">{s.fullName}</td>
                  <td className="p-2 border">{s.className}</td>
                  <td className="p-2 border">
                    <select
                      className="border p-1 rounded"
                      onChange={(e) => handleAttendanceChange(s._id, e.target.value)}
                    >
                      <option value="">--</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No students in this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Monthly & Yearly Section */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <input
          type="month"
          className="border p-2 rounded"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <button
          onClick={calculateMonthlyAndYearly}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Calculate Monthly & Yearly
        </button>
      </div>

      {/* Monthly Attendance Table */}
      {monthlyData.length > 0 && (
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-2">Monthly Attendance - {month}</h3>
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Present</th>
                <th className="p-2 border">Working</th>
                <th className="p-2 border">%</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(s => {
                const rec = s.attendance?.monthly?.[month];
                return (
                  <tr key={s._id}>
                    <td className="p-2 border">{s.fullName}</td>
                    <td className="p-2 border">{rec?.presentDays ?? 0}</td>
                    <td className="p-2 border">{rec?.workingDays ?? 0}</td>
                    <td className="p-2 border">{rec?.percentage ?? 0}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Yearly Attendance Table */}
      {yearlyData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Yearly Attendance</h3>
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Present</th>
                <th className="p-2 border">Working</th>
                <th className="p-2 border">%</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map(s => {
                const rec = s.attendance?.yearly;
                return (
                  <tr key={s._id}>
                    <td className="p-2 border">{s.fullName}</td>
                    <td className="p-2 border">{rec?.presentDays ?? 0}</td>
                    <td className="p-2 border">{rec?.workingDays ?? 0}</td>
                    <td className="p-2 border">{rec?.percentage ?? 0}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;
