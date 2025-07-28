import { useEffect, useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  ChevronDown,
  UserPlus,
  Download,
} from "lucide-react";
import * as Select from "@radix-ui/react-select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const subjects = [
  "Telugu", "Hindi", "English", "Maths", "Science", "Social Studies", "computer"
];

const classOptions = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"
];

const assessments = [
  "formativeAssessment1", "formativeAssessment2", "formativeAssessment3",
  "formativeAssessment4", "summativeAssessment1", "summativeAssessment2"
];

const getGrade = (percentage: number) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
};

export default function Results() {
  const [students, setStudents] = useState<any[]>([]);
  const [extraStudents, setExtraStudents] = useState<any[]>([]);
  const [className, setClassName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("regular");
  const [selectedAssessment, setSelectedAssessment] = useState("formativeAssessment1");
  const [selectedActivity, setSelectedActivity] = useState("");

  const fetchStudents = async () => {
    if (!className) {
      toast.warning("Please select a class");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/staff/results/${className}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setStudents(data.students);
      else toast.error(data.error || "Failed to fetch students");
    } catch {
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const fetchExtraActivities = async () => {
    if (!className) return;
    try {
      const encodedClassName = encodeURIComponent(className);
      const res = await fetch(`https://vidhyardhi.onrender.com/api/staff/extraactivity/${encodedClassName}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setExtraStudents(data.students || []);
      } else {
        toast.error("Error fetching extra-curricular data");
      }
    } catch {
      toast.error("Server error during extra-curricular fetch");
    }
  };

  useEffect(() => {
    if (activeTab === "extra") {
      fetchExtraActivities();
    }
  }, [activeTab, className]);

  const filteredStudents = students
    .filter((s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      (b.performance?.[selectedAssessment]?.total || 0) -
      (a.performance?.[selectedAssessment]?.total || 0)
    );

  const availableActivities = Array.from(
    new Set(
      extraStudents.flatMap((s) =>
        s.extraCurricular?.map((a: any) => a.activityName)
      )
    )
  );

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Results - ${selectedAssessment} - ${className}`, 14, 15);

    const rows = filteredStudents.map((s) => {
      const perf = s.performance?.[selectedAssessment] || {};
      const marks = perf.marks || {};
      const total = perf.total || 0;
      const percentage = perf.percentage || 0;
      const grade = perf.grade || getGrade(percentage);
      return [
        s.fullName,
        ...subjects.map((sub) => marks[sub] ?? "-"),
        total,
        `${percentage.toFixed(2)}%`,
        grade,
      ];
    });

    autoTable(doc, {
      head: [["Name", ...subjects, "Total", "%", "Grade"]],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 128, 128] },
    });

    doc.save(`results-${className}-${selectedAssessment}.pdf`);
  };

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      <h1 className="text-2xl font-bold mb-4 text-teal-600">📊 Results</h1>

      <div className="flex flex-col lg:flex-row flex-wrap gap-3 mb-4 items-start lg:items-center">
        <Select.Root value={className} onValueChange={setClassName}>
          <Select.Trigger className="min-w-[150px] border rounded px-3 py-2 bg-white shadow-sm">
            <Select.Value placeholder="Select class" />
            <Select.Icon><ChevronDown className="w-4 h-4" /></Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="border rounded shadow bg-white">
              <Select.Viewport className="p-1">
                {classOptions.map((cls) => (
                  <Select.Item
                    key={cls}
                    value={cls}
                    className="px-4 py-2 text-sm hover:bg-teal-100 cursor-pointer"
                  >
                    <Select.ItemText>{cls}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        <Button
          onClick={fetchStudents}
          disabled={loading}
          className="flex gap-2 items-center bg-teal-600 text-white hover:bg-teal-700"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Load Students
        </Button>

        <Input
          placeholder="Search student"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="min-w-[200px]"
        />

        <Button
          variant="outline"
          onClick={downloadPDF}
          disabled={filteredStudents.length === 0}
          className="border-teal-600 text-teal-600"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2 overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="regular">Regular</TabsTrigger>
          <TabsTrigger value="extra">Extra-Curricular</TabsTrigger>
        </TabsList>

        <TabsContent value="regular">
          <div className="flex flex-wrap gap-2 mb-2">
            {assessments.map((key) => (
              <Button
                key={key}
                size="sm"
                variant={selectedAssessment === key ? "default" : "outline"}
                onClick={() => setSelectedAssessment(key)}
              >
                {key.replace("Assessment", " ").replace(/([A-Za-z])(\d)/g, "$1 $2")}
              </Button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <Card className="shadow-sm">
              <CardContent className="p-2">
                <table className="w-full text-sm border min-w-[600px]">
                  <thead className="bg-teal-100">
                    <tr>
                      <th className="px-2 py-2">Name</th>
                      {subjects.map((subj) => (
                        <th key={subj} className="px-2 py-2">{subj}</th>
                      ))}
                      <th className="px-2 py-2">Total</th>
                      <th className="px-2 py-2">%</th>
                      <th className="px-2 py-2">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan={subjects.length + 4} className="text-center py-6">No students</td></tr>
                    ) : (
                      filteredStudents.map((s) => {
                        const perf = s.performance?.[selectedAssessment] || {};
                        const marks = perf.marks || {};
                        const total = perf.total || 0;
                        const percentage = perf.percentage || 0;
                        const grade = perf.grade || getGrade(percentage);

                        return (
                          <tr key={s._id} className="border-t even:bg-gray-50">
                            <td className="px-2 py-2 whitespace-nowrap">{s.fullName}</td>
                            {subjects.map((subj) => (
                              <td key={subj} className="text-center px-1 py-2">
                                {marks[subj] ?? "-"}
                              </td>
                            ))}
                            <td className="text-center">{total}</td>
                            <td className="text-center">{percentage.toFixed(2)}%</td>
                            <td className="text-center text-teal-600 font-medium">{grade}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="extra">
          <div className="mb-2">
            <Select.Root value={selectedActivity} onValueChange={setSelectedActivity}>
              <Select.Trigger className="min-w-[200px] border rounded px-3 py-2 bg-white">
                <Select.Value placeholder="Select Activity" />
                <Select.Icon>
                  <ChevronDown className="w-4 h-4" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="border rounded bg-white shadow">
                  <Select.Viewport className="p-1">
                    {availableActivities.map((a) => (
                      <Select.Item key={a} value={a} className="px-4 py-2 hover:bg-teal-100">
                        <Select.ItemText>{a}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          <div className="overflow-x-auto">
            <Card className="shadow-sm">
              <CardContent className="p-2">
                <table className="w-full text-sm border min-w-[400px]">
                  <thead className="bg-purple-100 text-purple-800">
                    <tr>
                      <th className="px-2 py-2">Name</th>
                      <th className="px-2 py-2">Activity</th>
                      <th className="px-2 py-2 text-center">Grade</th>
                      <th className="px-2 py-2 text-center">Added At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extraStudents.length === 0 || !selectedActivity ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-gray-500">
                          No data
                        </td>
                      </tr>
                    ) : (
                      extraStudents.map((s) =>
                        (s.extraCurricular || [])
                          .filter((a: any) => a.activityName === selectedActivity)
                          .map((a: any, idx: number) => (
                            <tr key={`${s._id}-${idx}`} className="border-t even:bg-gray-50">
                              <td className="px-2 py-2 whitespace-nowrap">{s.fullName}</td>
                              <td className="px-2 py-2">{a.activityName}</td>
                              <td className="px-2 py-2 text-center font-medium text-purple-700">
                                {a.grade || "-"}
                              </td>
                              <td className="px-2 py-2 text-center text-gray-600">
                                {a.addedAt ? new Date(a.addedAt).toLocaleDateString() : "-"}
                              </td>
                            </tr>
                          ))
                      )
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
