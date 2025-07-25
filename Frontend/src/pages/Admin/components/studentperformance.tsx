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
    subjects: Record<string, number>;
  };
  total?: number;
  percentage?: number;
  grade?: string;
}

interface Performance {
  formativeAssessment1?: TermStats;
  formativeAssessment2?: TermStats;
  formativeAssessment3?: TermStats;
  formativeAssessment4?: TermStats;
  summativeAssessment1?: TermStats;
  summativeAssessment2?: TermStats;
  average?: null;
}

interface HistoryItem {
  promotedAt: string;
  className: string;
  performance: {
    summativeAssessment2: {
      marks: {
        subjects: Record<string, number>;
      };
      total: number;
      percentage: number;
      grade: string;
    };
  };
}

const subjects = [
  "Telugu",
  "Hindi",
  "English",
  "Maths",
  "Science",
  "Social Studies",
  "computer",
];

export default function StudentPerformanceDialog({ studentId }: Props) {
  const [open, setOpen] = useState(false);
  const [performance, setPerformance] = useState<Performance>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (open) {
      fetchPerformance();
    }
  }, [open]);

  const fetchPerformance = async () => {
    try {
      const res = await fetch(
        `https://vidhyardhi.onrender.com/api/admin/student/${studentId}/performance`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch performance");
      const data = await res.json();
      setPerformance(data.performance || {});
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load performance data.");
    }
  };

  const calculateStats = (marks: Record<string, number> = {}) => {
    const scores = subjects.map((subject) => Number(marks?.[subject] || 0));
    const total = scores.reduce((acc, val) => acc + val, 0);
    const percentage = (total / (subjects.length * 100)) * 100;

    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";

    return {
      total,
      percentage: parseFloat(percentage.toFixed(2)),
      grade,
    };
  };

  const buildChartData = (term: keyof Performance) => {
    const termData = performance[term];
    const marks = termData?.marks?.subjects || {};
    return subjects.map((subject) => ({
      subject,
      marks: typeof marks[subject] === "number" ? marks[subject] : 0,
    }));
  };

  const buildHistoryChartData = () =>
    history.map((item) => {
      const marksObj =
        item.performance?.summativeAssessment2?.marks?.subjects || {};
  
      const marks = subjects.map((subject) => Number(marksObj[subject] || 0));
      const total = marks.reduce((sum, val) => sum + val, 0);
      const avgPercentage =
        marks.length > 0 ? (total / (subjects.length * 100)) * 100 : 0;
  
      return {
        gradeLabel: item.className,
        className: item.className,
        average: parseFloat(avgPercentage.toFixed(2)),
      };
    });
  

  const renderTerm = (
    label: string,
    term: keyof Performance,
    color: string
  ) => {
    const stats = performance[term];
    const marks = stats?.marks?.subjects || {};
    const { total, percentage, grade } = calculateStats(marks);

    const hasData = Object.keys(marks).length > 0;

    return (
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">{label}</h3>
        {!hasData ? (
          <p className="text-gray-500 italic">No data available</p>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Total:</strong> {total} |{" "}
              <strong>Percentage:</strong>{" "}
              <span
                className={
                  percentage < 50 ? "text-red-500" : "text-green-600"
                }
              >
                {percentage.toFixed(2)}%
              </span>{" "}
              | <strong>Grade:</strong>{" "}
              <span className="text-purple-700 font-semibold">{grade}</span>
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
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          📘 View Performance
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-4xl p-6 bg-white text-black overflow-y-auto"
        style={{ maxHeight: "90vh" }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-700">
            Student Performance Overview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 mt-4">
          {renderTerm("📗 Formative Assessment 1", "formativeAssessment1", "#34d399")}
          {renderTerm("📗 Formative Assessment 2", "formativeAssessment2", "#34d399")}
          {renderTerm("📗 Formative Assessment 3", "formativeAssessment3", "#34d399")}
          {renderTerm("📗 Formative Assessment 4", "formativeAssessment4", "#34d399")}
          {renderTerm("📙 Summative Assessment 1", "summativeAssessment1", "#facc15")}
          {renderTerm("📙 Summative Assessment 2", "summativeAssessment2", "#facc15")}

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              📈 Average Performance Over Years
            </h3>
            {history.length === 0 ? (
              <p className="text-gray-500">No performance history found.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={buildHistoryChartData()}>
                  <XAxis dataKey="gradeLabel" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Bar
                    dataKey="average"
                    fill="#a78bfa"
                    name="Avg Annual Marks (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
