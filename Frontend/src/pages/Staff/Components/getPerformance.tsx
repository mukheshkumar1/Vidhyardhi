import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  ChevronDown,
  Check,
  UserPlus,
  Download,
} from "lucide-react";
import * as Select from "@radix-ui/react-select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const subjects = ["Telugu", "Hindi", "English", "Maths", "Science", "Social Studies"];

const getGrade = (percentage: number): string => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
};

const classOptions = [
  "Nursery", "LKG", "UKG",
  "Grade 1", "Grade 2", "Grade 3",
  "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10",
];

export default function Results() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [students, setStudents] = useState<any[]>([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("quarterly");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStudents = async () => {
    if (!className) {
      toast.warning("Please select a class");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/staff/results/${className}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students);
      } else {
        toast.error(data.error || "Failed to fetch students");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students
    .filter((student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const totalA = a.performance?.[activeTab]?.total || 0;
      const totalB = b.performance?.[activeTab]?.total || 0;
      return totalB - totalA;
    });

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Results - ${activeTab} - Class: ${className}`, 14, 15);
    const tableData = filteredStudents.map((student) => {
      const performance = student.performance?.[activeTab] || {};
      const marks = performance.marks || {};
      const total = performance.total || 0;
      const percentage = performance.percentage || 0;
      const grade = performance.grade || getGrade(percentage);

      return [
        student.fullName,
        ...subjects.map((subj) => (marks[subj] !== undefined ? marks[subj] : "-")),
        total,
        `${percentage.toFixed(2)}%`,
        grade,
      ];
    });

    autoTable(doc, {
      head: [["Name", ...subjects, "Total", "%", "Grade"]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 188, 156] },
    });

    doc.save(`performance-${className}-${activeTab}.pdf`);
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4 text-center sm:text-left text-teal-600">📊 Results</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
        <Select.Root value={className} onValueChange={setClassName}>
          <Select.Trigger
            aria-label="Select Class"
            className="flex items-center justify-between px-3 py-2 min-w-[200px] border rounded bg-white dark:bg-gray-900 shadow-sm"
          >
            <Select.Value placeholder="Select class" />
            <Select.Icon>
              <ChevronDown className="w-4 h-4" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content
              className="overflow-hidden rounded-md border border-gray-300 bg-white dark:bg-gray-800 shadow-md"
              position="popper"
              sideOffset={5}
            >
              <Select.Viewport className="p-1">
                {classOptions.map((cls) => (
                  <Select.Item
                    key={cls}
                    value={cls}
                    className="relative flex cursor-pointer select-none items-center rounded px-8 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-teal-500 hover:text-white"
                  >
                    <Select.ItemText>{cls}</Select.ItemText>
                    <Select.ItemIndicator className="absolute left-2">
                      <Check className="w-4 h-4" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <Button
          onClick={fetchStudents}
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white flex gap-2 items-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              Loading...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Load Students
            </>
          )}
        </Button>

        <Input
          placeholder="Search student"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow min-w-[150px]"
        />

        <Button
          variant="outline"
          onClick={downloadPDF}
          disabled={filteredStudents.length === 0}
          className="border-teal-600 text-teal-600 hover:bg-teal-50 flex gap-2 items-center"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
          <TabsTrigger value="halfYearly">Half-Yearly</TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card className="mt-4 shadow-md">
            <CardContent className="p-2 overflow-x-auto">
              <table className="w-full border text-sm text-left min-w-[700px]">
                <thead>
                  <tr className="bg-teal-100 dark:bg-gray-800 text-teal-900 dark:text-white">
                    <th className="px-3 py-2">Name</th>
                    {subjects.map((subj) => (
                      <th key={subj} className="px-2 py-2 text-center">
                        {subj}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center">Total</th>
                    <th className="px-3 py-2 text-center">%</th>
                    <th className="px-3 py-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-6 text-gray-500">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const performance = student.performance?.[activeTab] || {};
                      const marks = performance.marks || {};
                      const total = performance.total || 0;
                      const percentage = performance.percentage || 0;
                      const grade = performance.grade || getGrade(percentage);

                      return (
                        <tr key={student._id} className="border-t even:bg-gray-50 hover:bg-teal-50">
                          <td className="px-3 py-2">{student.fullName}</td>
                          {subjects.map((subj) => (
                            <td key={subj} className="px-2 py-2 text-center">
                              {marks[subj] !== undefined ? marks[subj] : "-"}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center font-medium">{total}</td>
                          <td className="px-3 py-2 text-center">{percentage.toFixed(2)}%</td>
                          <td className="px-3 py-2 text-center font-semibold text-teal-700">{grade}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
