import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, BarChart2, UserCheck } from "lucide-react";

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
      res.ok ? setMonthly(data) : toast.error(data.message);
    } catch {
      toast.error("Failed to fetch monthly report");
    }
  };

  useEffect(() => {
    fetchMonthly(selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-300";
      case "absent":
        return "bg-red-100 text-red-800 border-red-300";
      case "holiday":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-4xl font-bold text-center text-indigo-700 mb-6">🗓️ Staff Attendance Report</h2>

      {/* Month Picker */}
      <Card className="border border-indigo-300 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700 text-lg">
            <CalendarDays className="w-5 h-5" /> Select Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DatePicker
            selected={selectedMonth}
            onChange={(date) => date && setSelectedMonth(date)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            className="p-2 border rounded w-full bg-indigo-50 text-indigo-800 font-semibold"
          />
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      {monthly && (
        <>
          <Card className="border-l-4 border-indigo-500 bg-indigo-50 shadow-md">
            <CardHeader>
              <CardTitle className="text-indigo-800 text-xl font-semibold flex items-center gap-2">
                <BarChart2 className="w-5 h-5" /> {monthly.month} Monthly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-green-200 text-green-800 p-4 rounded-xl shadow-inner">
                  <div className="text-lg font-bold">✅ Present</div>
                  <div className="text-2xl">{monthly.summary.present}</div>
                </div>
                <div className="bg-red-200 text-red-800 p-4 rounded-xl shadow-inner">
                  <div className="text-lg font-bold">❌ Absent</div>
                  <div className="text-2xl">{monthly.summary.absent}</div>
                </div>
                <div className="bg-yellow-200 text-yellow-800 p-4 rounded-xl shadow-inner">
                  <div className="text-lg font-bold">🏖️ Holiday</div>
                  <div className="text-2xl">{monthly.summary.holiday}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4">
                {monthly.dailyRecords.map((rec) => (
                  <div
                    key={rec.date}
                    className={`rounded-lg px-3 py-2 text-center text-sm font-medium border ${getStatusColor(
                      rec.status
                    )} shadow`}
                  >
                    <div className="font-mono">{rec.date}</div>
                    <div className="capitalize">{rec.status}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Yearly Summary */}
          <Card className="border-l-4 border-teal-500 bg-teal-50 shadow-md">
            <CardHeader>
              <CardTitle className="text-teal-800 text-xl font-semibold flex items-center gap-2">
                <UserCheck className="w-5 h-5" /> Yearly Attendance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-teal-200 text-teal-900 p-4 rounded-xl shadow-inner">
                <div className="text-md font-semibold">📆 Working Days</div>
                <div className="text-xl">{monthly.yearly.workingDays}</div>
              </div>
              <div className="bg-blue-200 text-blue-900 p-4 rounded-xl shadow-inner">
                <div className="text-md font-semibold">✅ Present Days</div>
                <div className="text-xl">{monthly.yearly.presentDays}</div>
              </div>
              <div className="bg-purple-200 text-purple-900 p-4 rounded-xl shadow-inner">
                <div className="text-md font-semibold">📊 Attendance %</div>
                <div className="text-xl">{monthly.yearly.percentage}%</div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
