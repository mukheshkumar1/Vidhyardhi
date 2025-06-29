import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type AttendanceSummary = {
  present: number;
  absent: number;
  holiday: number;
};

type DailyRecord = {
  date: string;
  status: string;
};

type YearlyStats = {
  workingDays: number;
  presentDays: number;
  percentage: number;
};

type MonthlyReport = {
  month: string;
  summary: AttendanceSummary;
  dailyRecords: DailyRecord[];
  yearly: YearlyStats;
};

export default function StaffAttendanceReport({ staffId }: { staffId: string }) {
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const fetchMonthly = async (month: Date) => {
    try {
      const formattedMonth = format(month, "yyyy-MM");
      const res = await fetch(
        `http://localhost:5000/api/admin/staff/${staffId}/attendance/report?month=${formattedMonth}`,
        { credentials: "include" }
      );
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      res.ok ? setMonthly(data) : toast.error(data.message);
    } catch {
      toast.error("Failed to fetch monthly report");
    }
  };

  useEffect(() => {
    fetchMonthly(selectedMonth);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center">Staff Attendance Report</h2>

      {/* Date Picker for Month Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Month</CardTitle>
        </CardHeader>
        <CardContent>
          <DatePicker
            selected={selectedMonth}
            onChange={(date) => date && setSelectedMonth(date)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            showFullMonthYearPicker
            className="p-2 border rounded w-full bg-black text-white"
          />
        </CardContent>
      </Card>

      {/* Monthly + Yearly Report */}
      {monthly && (
        <Card>
          <CardHeader>
            <CardTitle>{monthly.month} Monthly & Yearly Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <h3 className="font-semibold">Monthly Summary</h3>
            <ul>
              <li>Present: {monthly.summary.present}</li>
              <li>Absent: {monthly.summary.absent}</li>
              <li>Holiday: {monthly.summary.holiday}</li>
            </ul>

            <h3 className="mt-4 font-semibold">Yearly Summary</h3>
            <ul>
              <li>Total Working Days: {monthly.yearly.workingDays}</li>
              <li>Days Present: {monthly.yearly.presentDays}</li>
              <li>Attendance Percentage: {monthly.yearly.percentage}%</li>
            </ul>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
              {monthly.dailyRecords.map((rec) => (
                <div
                  key={rec.date}
                  className="border rounded px-3 py-2 text-center bg-white/5 backdrop-blur-md"
                >
                  <div className="font-semibold">{rec.date}</div>
                  <div className="capitalize text-sm text-gray-300">{rec.status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
