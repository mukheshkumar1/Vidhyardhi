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


interface TermPerformance {
  [subject: string]: string | number | null | undefined | object;
}

interface Performance {
  quarterly?: TermPerformance | null;
  halfYearly?: TermPerformance | null;
  annual?: TermPerformance | null;
}

interface ClassHistoryRecord {
  className: string;
  performance?: Performance | null;
}

interface AcademicDetails {
  fullName: string;
  currentClass: string;
  fromClass: string;
  performance?: Performance | null;
  classHistory: ClassHistoryRecord[];
}

export default function ReportCard({ studentId }: { studentId: string }) {
  const [data, setData] = useState<AcademicDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAcademicDetails() {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/student/${studentId}/academic-details`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`Failed to fetch data`);
        const json: AcademicDetails = await res.json();
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

  function renderPerformanceTable(performance?: TermPerformance | null) {
    if (!performance || Object.keys(performance).length === 0) {
      return <p className="text-muted-foreground italic">No data available</p>;
    }

    return (
      <table className="w-full text-sm border rounded overflow-hidden mb-4 border-collapse bg-gray-50">
        <thead className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <tr>
            <th className="text-left p-2 border">📘 Subject</th>
            <th className="text-left p-2 border">✏️ Marks</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(performance).map(([subject, mark]) => (
            <tr key={subject} className="hover:bg-purple-100">
              <td className="p-2 border font-semibold">{subject}</td>
              <td className="p-2 border">
                {typeof mark === "object" && mark !== null ? (
                  <ul className="list-disc list-inside">
                    {Object.entries(mark).map(([k, v]) => (
                      <li key={k}>
                        {k}: <span className="font-medium">{v ?? "-"}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="font-medium">{mark ?? "-"}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function renderTermWisePerformance(performance?: Performance | null) {
    if (!performance) return null;
    const terms: (keyof Performance)[] = ["quarterly", "halfYearly", "annual"];
    return terms.map((term) => {
      const termData = performance[term];
      if (!termData || Object.keys(termData).length === 0) return null;

      return (
        <div key={term} className="mb-4">
          <h4 className="text-base font-semibold capitalize mb-2 flex items-center gap-2 text-purple-600">
            <BarChart2 size={18} />
            {term} Exams
          </h4>
          {renderPerformanceTable(termData)}
        </div>
      );
    });
  }

  async function handleDownloadPDF() {
    const element = reportRef.current;
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${data?.fullName.replace(" ", "_")}_ReportCard.pdf`);
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

  return (
    <div className="relative px-4 sm:px-0">
      {/* Download button */}
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-purple-700">
              <GraduationCap />
              {data.fullName}
            </CardTitle>
            <CardDescription className="text-gray-700 mt-1">
              🎓 Current Class:{" "}
              <strong className="text-indigo-600">{data.currentClass}</strong>{" "}
              | Promoted from:{" "}
              <strong className="text-indigo-600">{data.fromClass}</strong>
            </CardDescription>
          </div>

          {/* Responsive logo switch */}
          <img
            src={logoDesktop}
            alt="School Logo Desktop"
            className="h-16 w-auto object-contain hidden sm:block"
          />
       <div className="block sm:hidden ml-auto">
  <img
    src={logoMobile}
    alt="School Logo Mobile"
    className="h-16 w-auto object-contain"
  />
</div>
        </div>

        {/* Current performance */}
        <CardContent className="mt-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-indigo-700">
            <School size={20} />
            Current Academic Performance
          </h3>
          {renderTermWisePerformance(data.performance)}
        </CardContent>

        {/* Class history */}
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
                      {record.performance ? (
                        renderTermWisePerformance(record.performance)
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
