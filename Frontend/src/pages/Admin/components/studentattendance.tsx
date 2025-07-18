import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  studentId: string;
}

interface MonthlyAttendance {
  [month: string]: {
    workingDays: number;
    presentDays: number;
    percentage: number;
  };
}

interface DailyAttendance {
  [date: string]: string; // Present or Absent
}

interface YearlyAttendance {
  workingDays: number;
  presentDays: number;
  percentage: number;
}

export default function StudentAttendanceDialog({ studentId }: Props) {
  const [open, setOpen] = useState(false);
  const [monthly, setMonthly] = useState<MonthlyAttendance>({});
  const [yearly, setYearly] = useState<YearlyAttendance>({
    workingDays: 0,
    presentDays: 0,
    percentage: 0,
  });
  const [daily, setDaily] = useState<DailyAttendance>({});

  useEffect(() => {
    if (open) fetchAttendance();
  }, [open]);

  const fetchAttendance = async () => {
    try {
      const res = await fetch(
        `https://vidhyardhi.onrender.com/api/admin/student/${studentId}/attendance`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setMonthly(data.monthly || {});
      setYearly(data.yearly || {});
      setDaily(data.daily || {});
    } catch (err) {
      toast.error("Failed to load attendance");
    }
  };

  const chartData = Object.entries(monthly).map(([month, stats]) => ({
    month,
    present: stats.presentDays,
    absent: stats.workingDays - stats.presentDays,
  }));

  const dailyData = Object.entries(daily).map(([date, status]) => ({
    date,
    Present: status === "Present" ? 1 : 0,
    Absent: status === "Absent" ? 1 : 0,
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
          📊 View Attendance
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-4xl p-6 bg-white text-black overflow-y-auto"
        style={{ maxHeight: "90vh" }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-blue-700">
            Student Attendance Overview
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Yearly Summary */}
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <strong>Yearly Working Days:</strong> {yearly.workingDays}
            </p>
            <p>
              <strong>Present Days:</strong> {yearly.presentDays}
            </p>
            <p>
              <strong>Percentage:</strong>{" "}
              <span
                className={
                  yearly.percentage < 75 ? "text-red-500" : "text-green-600"
                }
              >
                {yearly.percentage}%
              </span>
            </p>
          </div>

          {/* Monthly Chart */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Monthly Attendance
            </h3>
            {chartData.length === 0 ? (
              <p className="text-gray-500">No monthly attendance available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Bar dataKey="present" fill="#4ade80" name="Present Days" />
                  <Bar dataKey="absent" fill="#f87171" name="Absent Days" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Daily Chart */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Daily Attendance
            </h3>
            {dailyData.length === 0 ? (
              <p className="text-gray-500">No daily attendance available</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Bar dataKey="Present" fill="#4ade80" />
                  <Bar dataKey="Absent" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly Breakdown with Present/Absent Dates */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Daily Attendance Breakdown by Month
            </h3>
            {Object.entries(monthly).length === 0 ? (
              <p className="text-gray-500">No monthly data to display.</p>
            ) : (
              Object.entries(monthly).map(([month, stats]) => {
                const datesInMonth = Object.entries(daily).filter(([date]) =>
                  new Date(date).toLocaleString("default", { month: "long" }) ===
                  month
                );

                const presentDates = datesInMonth
                  .filter(([_, status]) => status === "Present")
                  .map(([d]) => d);
                const absentDates = datesInMonth
                  .filter(([_, status]) => status === "Absent")
                  .map(([d]) => d);

                return (
                  <div
                    key={month}
                    className="border p-4 rounded-md mb-4 bg-gray-50 shadow"
                  >
                    <h4 className="text-md font-semibold text-indigo-600 mb-2">
                      {month}
                    </h4>
                    <p>
                      ✅ Present Days: <strong>{stats.presentDays}</strong>
                    </p>
                    <p>
                      📅 Working Days: <strong>{stats.workingDays}</strong>
                    </p>
                    <p>
                      ❌ Absent Days:{" "}
                      <strong>{stats.workingDays - stats.presentDays}</strong>
                    </p>

                    <div className="mt-2">
                      {presentDates.length > 0 && (
                        <>
                          <p className="text-green-600 font-medium mt-2">
                            ✔️ Present Dates:
                          </p>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {presentDates.map((date) => (
                              <li key={date}>
                                {new Date(date).toDateString()}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      {absentDates.length > 0 && (
                        <>
                          <p className="text-red-600 font-medium mt-4">
                            ❌ Absent Dates:
                          </p>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {absentDates.map((date) => (
                              <li key={date}>
                                {new Date(date).toDateString()}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
