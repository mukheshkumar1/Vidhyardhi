import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";

interface Props {
  studentId: string;
}

interface TermStats {
  marks: {
    [subject: string]: number;
  };
  total: number;
  percentage: number;
  grade: string;
}

interface Performance {
  quarterly: TermStats;
  halfYearly: TermStats;
  annual: TermStats;
}

interface HistoryItem {
  promotedAt: string;
  className: string;
  performance: {
    annual: TermStats;
  };
}

const subjects = ["Telugu", "Hindi", "English", "Maths", "Science", "Social Studies"];

export default function StudentPerformanceDialog({ studentId }: Props) {
  const [open, setOpen] = useState(false);
  const [performance, setPerformance] = useState<Performance>({
    quarterly: { marks: {}, total: 0, percentage: 0, grade: "F" },
    halfYearly: { marks: {}, total: 0, percentage: 0, grade: "F" },
    annual: { marks: {}, total: 0, percentage: 0, grade: "F" },
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (open) fetchPerformance();
  }, [open]);

  const fetchPerformance = async () => {
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/admin/student/${studentId}/performance`, {
        credentials: "include",
      });
      const data = await res.json();
      setPerformance(data.performance || {});
      setHistory(data.history || []);
    } catch (err) {
      toast.error("Failed to load performance");
    }
  };

  const buildChartData = (term: keyof Performance) => {
    const termData = performance[term]?.marks || {};
    return subjects.map((subject) => ({
      subject,
      marks: typeof termData[subject] === "number" ? termData[subject] : 0,
    }));
  };

  const buildHistoryChartData = () =>
    history.map((item) => {
      const marksObj = item.performance?.annual?.marks || {};
      const marks = subjects.map((subj) => marksObj[subj] ?? 0);
      const total = marks.reduce((sum, val) => sum + val, 0);
      const avgPercentage = marks.length ? (total / (marks.length * 100)) * 100 : 0;
      return {
        year: new Date(item.promotedAt).getFullYear(),
        className: item.className,
        average: parseFloat(avgPercentage.toFixed(2)),
      };
    });

  const renderTerm = (label: string, term: keyof Performance, color: string) => {
    const stats = performance[term];

    return (
      <div>
        <h3 className="font-semibold text-gray-800 mb-2">{label}</h3>
        {!stats || Object.keys(stats.marks || {}).length === 0 ? (
          <p className="text-gray-500">No data available</p>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Total:</strong> {stats.total} |{" "}
              <strong>Percentage:</strong>{" "}
              <span
                className={
                  stats.percentage < 75 ? "text-red-500" : "text-green-600"
                }
              >
                {stats.percentage.toFixed(2)}%
              </span>{" "}
              | <strong>Grade:</strong>{" "}
              <span className="text-teal-700 font-semibold">{stats.grade}</span>
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={buildChartData(term)}>
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <CartesianGrid strokeDasharray="3 3" />
                <Bar dataKey="marks" fill={color} name="Marks" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">📘 View Performance</Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-6 bg-white text-black overflow-y-auto" style={{ maxHeight: "90vh" }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-700">Student Performance Overview</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 mt-4">
          {renderTerm("📗 Quarterly Exam", "quarterly", "#34d399")}
          {renderTerm("📘 Half-Yearly Exam", "halfYearly", "#60a5fa")}
          {renderTerm("📙 Annual Exam", "annual", "#facc15")}

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">📈 Annual Performance Over Years</h3>
            {history.length === 0 ? (
              <p className="text-gray-500">No performance history found.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={buildHistoryChartData()}>
                  <XAxis dataKey="year" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Bar dataKey="average" fill="#a78bfa" name="Avg Annual Marks (%)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
