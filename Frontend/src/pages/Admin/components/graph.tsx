// ./graph.tsx
import  { useEffect, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StudentPerformanceCharts = ({ studentId }: { studentId: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStudent = async () => {
        const res = await fetch(`http://localhost:5000/api/admin/students/${studentId}/details`, {
          credentials: "include", // ✅ Proper placement
        });
        const json = await res.json();
        setData(json);
      };
      if (studentId) fetchStudent();
    }, [studentId]);

  if (!data) return <p>Loading chart...</p>;

  const attendanceLabels = Object.keys(data.attendance?.monthly || {});
  const attendanceData = Object.values(data.attendance?.monthly || {});

  const performanceLabels = Object.keys(data.performance || {});
  const performanceData = Object.values(data.performance || {});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yearlyLabels = data.yearlyPerformance?.map((e: any) => e.year) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yearlyData = data.yearlyPerformance?.map((e: any) => e.percentage) || [];

  return (
    <div className="space-y-8 py-4">
      <div style={{ maxWidth: 400 }}>
        <h4 className="font-semibold mb-2 text-blue-300">Monthly Attendance</h4>
        <Bar
          data={{
            labels: attendanceLabels,
            datasets: [
              {
                label: "Attendance",
                data: attendanceData,
                backgroundColor: "rgba(75,192,192,0.6)",
              },
            ],
          }}
        />
      </div>

      <div style={{ maxWidth: 400 }}>
        <h4 className="font-semibold mb-2 text-green-300">Current Performance</h4>
        <Doughnut
          data={{
            labels: performanceLabels,
            datasets: [
              {
                label: "Performance",
                data: performanceData,
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
              },
            ],
          }}
        />
      </div>

      <div style={{ maxWidth: 400 }}>
        <h4 className="font-semibold mb-2 text-purple-300">Yearly Performance</h4>
        <Line
          data={{
            labels: yearlyLabels,
            datasets: [
              {
                label: "Yearly Performance",
                data: yearlyData,
                borderColor: "#4bc0c0",
                backgroundColor: "#4bc0c0",
              },
            ],
          }}
        />
      </div>
    </div>
  );
};

export default StudentPerformanceCharts;
