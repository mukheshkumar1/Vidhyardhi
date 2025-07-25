import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Loader2,
  GraduationCap,
  Download,
  History,
  BarChart2,
  School,
  Trophy,
} from "lucide-react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineContent,
} from "@mui/lab";
import { Typography } from "@mui/material";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoDesktop from "@/assets/images/logo.png";
import logoMobile from "@/assets/images/logo.png";

// Interfaces
interface TermPerformance {
  subjects?: { [subject: string]: number };
  total?: number;
  percentage?: number;
  grade?: string;
}

interface Performance {
  average?: number;
  formativeAssessment1?: TermPerformance | null;
  formativeAssessment2?: TermPerformance | null;
  formativeAssessment3?: TermPerformance | null;
  formativeAssessment4?: TermPerformance | null;
  summativeAssessment1?: TermPerformance | null;
  summativeAssessment2?: TermPerformance | null;
}

interface ClassHistoryRecord {
  className: string;
  performance?: Performance | null;
}

interface AcademicDetails {
  studentDetails: {
    fullName: string;
    className: string;
    dob: string;
    fatherName: string;
    motherName: string;
    phone: string;
    email: string;
  };
  classHistory: ClassHistoryRecord[];
  currentPerformance: Performance | null;
}

interface ExtraActivity {
  activityName: string;
  scored: number;
  outOf: number;
}

export default function ReportCard({ studentId }: { studentId: string }) {
  const [data, setData] = useState<AcademicDetails | null>(null);
  const [extraActivities, setExtraActivities] = useState<ExtraActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch academic details
  useEffect(() => {
    async function fetchAcademicDetails() {
      try {
        setLoading(true);
        const res = await fetch(
          `https://vidhyardhi.onrender.com/api/student/${studentId}/academic-details`,
          { method: "GET", credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch academic details");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        toast.error("Unable to load academic details.");
      } finally {
        setLoading(false);
      }
    }

    if (studentId) fetchAcademicDetails();
  }, [studentId]);

  // Fetch extra-curricular
  useEffect(() => {
    async function fetchExtraActivities() {
      try {
        const res = await fetch(
          `https://vidhyardhi.onrender.com/api/student/${studentId}`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch extra-curricular");
        const json = await res.json();
        setExtraActivities(json.extraCurricular || []);
      } catch (error) {
        console.error("Extra activity fetch error:", error);
        toast.error("Unable to load extra curricular activities.");
      }
    }

    if (studentId) fetchExtraActivities();
  }, [studentId]);

  function renderPerformanceTable(performance: TermPerformance) {
    const { subjects, total, percentage, grade } = performance;
    if (!subjects || Object.keys(subjects).length === 0) {
      return <p className="text-muted-foreground italic">No data available</p>;
    }

    return (
      <>
        <table className="w-full text-sm border rounded overflow-hidden mb-2 border-collapse bg-gray-50">
          <thead className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <tr>
              <th className="text-left p-2 border">📘 Subject</th>
              <th className="text-left p-2 border">✏️ Marks</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(subjects).map(([subject, mark]) => (
              <tr key={subject} className="hover:bg-purple-100">
                <td className="p-2 border font-semibold">{subject}</td>
                <td className="p-2 border font-medium">{mark}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-sm text-gray-700 mb-4">
          <p>
            📊 <strong>Total:</strong> {total ?? "-"} /{" "}
            {Object.keys(subjects).length * 100}
          </p>
          <p>
            🎯 <strong>Percentage:</strong> {percentage ?? "-"}%
          </p>
          <p>
            🏅 <strong>Grade:</strong> {grade ?? "-"}
          </p>
        </div>
      </>
    );
  }

  function renderTermWisePerformance(performance?: Performance | null) {
    if (!performance) return null;

    const terms = Object.entries(performance).filter(
      ([key, value]) =>
        key !== "average" &&
        value !== null &&
        typeof value === "object" &&
        "subjects" in value!
    ) as [keyof Performance, TermPerformance][];

    return terms.map(([term, termData]) => {
      if (termData.subjects && Object.keys(termData.subjects).length > 0) {
        return (
          <div key={term} className="mb-4">
            <h4 className="text-base font-semibold capitalize mb-2 flex items-center gap-2 text-purple-600">
              <BarChart2 size={18} />
              {term.replace(/([A-Z])/g, " $1")} Exams
            </h4>
            {renderPerformanceTable(termData)}
          </div>
        );
      }
      return null;
    });
  }

  async function handleDownloadPDF() {
    const element = reportRef.current;
    if (!element || !data) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pdfHeight);
    pdf.save(`${data.studentDetails.fullName.replace(" ", "_")}_ReportCard.pdf`);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No academic data found for this student.
      </div>
    );
  }

  const { fullName, className } = data.studentDetails;

  return (
    <div className="relative px-4 sm:px-0">
      <div className="flex justify-start mb-4">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:brightness-110 transition"
        >
          <Download size={18} />
          Download Report PDF
        </button>
      </div>

      <Card
        ref={reportRef}
        className="shadow-xl border border-gray-300 rounded-2xl p-6 bg-white text-black"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="block sm:hidden mb-4 text-center">
            <img
              src={logoMobile}
              alt="School Logo"
              className="h-36 w-auto object-contain mx-auto"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2 text-purple-700">
                <GraduationCap />
                {fullName}
              </CardTitle>
              <CardDescription className="text-gray-700 mt-1">
                🎓 Current Class:{" "}
                <strong className="text-indigo-600">{className}</strong>
              </CardDescription>
            </div>

            <img
              src={logoDesktop}
              alt="School Logo"
              className="h-48 w-auto object-contain hidden sm:block"
            />
          </div>
        </div>

        {/* Academic Performance */}
        <CardContent className="mt-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-indigo-700">
            <School size={20} />
            Current Academic Performance
          </h3>
          {renderTermWisePerformance(data.currentPerformance)}
        </CardContent>

        {/* Extra Curricular */}
        {extraActivities.length > 0 && (
          <CardContent className="mt-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-700">
              <Trophy size={20} />
              Extra Curricular Performance
            </h3>
            <table className="w-full text-sm border rounded overflow-hidden mb-2 border-collapse bg-green-50">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="text-left p-2 border">🎯 Activity</th>
                  <th className="text-left p-2 border">Scored</th>
                  <th className="text-left p-2 border">Out Of</th>
                  <th className="text-left p-2 border">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {extraActivities
                  .sort(
                    (a, b) =>
                      (b.scored / b.outOf) * 100 - (a.scored / a.outOf) * 100
                  )
                  .map((activity, idx) => (
                    <tr key={idx} className="hover:bg-green-100">
                      <td className="p-2 border font-medium">
                        {activity.activityName}
                      </td>
                      <td className="p-2 border text-center">{activity.scored}</td>
                      <td className="p-2 border text-center">{activity.outOf}</td>
                      <td className="p-2 border text-center">
                        {((activity.scored / activity.outOf) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        )}

        {/* Class History */}
        <CardContent className="mt-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-purple-700">
            <History size={20} />
            Class History
          </h3>
          {data.classHistory.length === 0 ? (
            <p className="text-muted-foreground italic">
              No class history available
            </p>
          ) : (
            <Timeline position="right">
              {data.classHistory.map((record, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body1" className="font-bold">
                      Class: {record.className}
                    </Typography>
                    <div className="mt-2">
                      {record.performance?.average !== undefined ? (
                        <p className="text-gray-700">
                          📊 <strong>Average Score:</strong>{" "}
                          {record.performance.average}%
                        </p>
                      ) : (
                        <p className="text-muted-foreground italic">
                          No performance data available for this class.
                        </p>
                      )}
                    </div>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
