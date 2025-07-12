import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { CalendarCheck2, Clock4 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Attendance = {
  totalDays: number;
  presentDays: number;
};

type HistoryItem = {
  className: string;
  attendance: Attendance;
};

type MonthlyAttendance = {
  workingDays: number;
  presentDays: number;
  percentage: number;
};

type DailyAttendance = {
  [date: string]: "Present" | "Absent" | "Leave";
};

type MonthlyDataMap = {
  [month: string]: MonthlyAttendance;
};

// ✅ Correct formatDate to local date instead of UTC
const formatDate = (date: Date): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance>({});
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyDataMap>({});
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await fetch("https://vidhyardhi.onrender.com/api/student/attendance", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        const currentYearly = data.attendance?.current?.yearly || {
          workingDays: 0,
          presentDays: 0,
        };

        setAttendance({
          totalDays: currentYearly.workingDays,
          presentDays: currentYearly.presentDays,
        });

        const rawDaily = data.attendance?.current?.daily || {};
        const mappedDaily: DailyAttendance = {};
        for (const [date, status] of Object.entries(rawDaily)) {
          if (status === "true") mappedDaily[date] = "Present";
          else if (status === "false") mappedDaily[date] = "Absent";
          else if (status === "holiday") mappedDaily[date] = "Leave";
        }
        setDailyAttendance(mappedDaily);

        const monthly = data.attendance?.current?.monthly || {};
        setMonthlyAttendance(monthly);

        const months = Object.keys(monthly);
        if (months.length > 0) {
          setSelectedMonth(months.sort().reverse()[0]);
        }

        if (data.attendance?.previous) {
          const previous: HistoryItem = {
            className: data.attendance.previous.className,
            attendance: {
              totalDays: 0,
              presentDays: Math.round(
                (data.attendance.previous.yearly?.percentage / 100) * 200
              ),
            },
          };
          setHistory([previous]);
        }
      } catch (err) {
        console.error("Failed to load attendance:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAttendance();
  }, []);

  const renderProgress = (label: string, value: Attendance) => {
    const percentage =
      value.totalDays === 0
        ? 0
        : Math.round((value.presentDays / value.totalDays) * 100);

    return (
      <Card key={label}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-green-600" />
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm mb-1">
            <span>
              {value.presentDays} / {value.totalDays} Days Present
            </span>
            <Badge
              className={percentage >= 75 ? "bg-green-500" : "bg-yellow-500"}
            >
              {percentage}%
            </Badge>
          </div>
          <Progress value={percentage} />
        </CardContent>
      </Card>
    );
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const dateStr = formatDate(date);
    const status = dailyAttendance[dateStr];
    if (status === "Present") return "present-day";
    if (status === "Absent") return "absent-day";
    if (status === "Leave") return "leave-day";
    return "";
  };

  const renderCalendar = () => {
    if (!selectedMonth) return null;
    const [year, month] = selectedMonth.split("-");
    const calendarDate = new Date(Number(year), Number(month) - 1);

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          Daily Attendance - {selectedMonth}
        </h3>
        <Calendar
          value={calendarDate}
          view="month"
          tileClassName={tileClassName}
        />
        <div className="text-sm flex gap-4 mt-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded" /> Present
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded" /> Absent
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-500 rounded" /> Leave
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <Clock4 className="w-6 h-6 text-primary" />
        Attendance Overview
      </h2>

      {/* ✅ Daily Calendar First */}
      <div className="mt-6">{renderCalendar()}</div>

      {/* 📅 Monthly Attendance */}
      <div>
        <label className="block text-sm mb-1 mt-6">Select Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2 border rounded"
        >
          {Object.keys(monthlyAttendance)
            .sort()
            .reverse()
            .map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
        </select>

        {selectedMonth && monthlyAttendance[selectedMonth] && (
          <div className="mt-4">
            <h3 className="font-semibold mb-1">
              Monthly Attendance Stats - {selectedMonth}
            </h3>
            {renderProgress(`Month ${selectedMonth}`, {
              totalDays: monthlyAttendance[selectedMonth].workingDays,
              presentDays: monthlyAttendance[selectedMonth].presentDays,
            })}
          </div>
        )}
      </div>

      {/* 📈 Yearly Attendance */}
      <div className="grid gap-4 md:grid-cols-2 mt-8">
        {attendance && renderProgress("Current Year", attendance)}
      </div>

      {/* 📘 Previous Years */}
      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">
            Previous Class Attendance
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {history.map((item) =>
              renderProgress(`Class ${item.className}`, item.attendance)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
