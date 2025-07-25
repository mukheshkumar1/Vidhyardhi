/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

const subjects = ["Telugu", "Hindi", "English", "Maths", "Science", "Social Studies", "computer"];
const classOptions = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];

const getEmptyMarks = () =>
  subjects.reduce((acc, subject) => ({ ...acc, [subject]: 0 }), {} as Record<string, number>);

const PerformanceUpdateForm = () => {
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [marks, setMarks] = useState({
    formativeAssessment1: getEmptyMarks(),
    formativeAssessment2: getEmptyMarks(),
    formativeAssessment3: getEmptyMarks(),
    formativeAssessment4: getEmptyMarks(),
    summativeAssessment1: getEmptyMarks(),
    summativeAssessment2: getEmptyMarks(),
  });
  const [activeExam, setActiveExam] = useState<"formativeAssessment1" | "formativeAssessment2" | "formativeAssessment3" | "formativeAssessment4" | "summativeAssessment1" | "summativeAssessment2">("formativeAssessment1");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!className) return;

    const fetchStudents = async () => {
      try {
        const res = await fetch(`https://vidhyardhi.onrender.com/api/staff/class/${className}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch students");
        setStudents(data.students);
      } catch (err: any) {
        toast.error(err.message || "Error fetching students");
      }
    };

    fetchStudents();
  }, [className]);

  useEffect(() => {
    if (!selectedStudentId) return;

    const fetchMarks = async () => {
      try {
        const res = await fetch(`https://vidhyardhi.onrender.com/api/staff/${selectedStudentId}/grades`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch marks");
        setMarks({
          formativeAssessment1: data.marks?.formativeAssessment1?.subjects || getEmptyMarks(),
          formativeAssessment2: data.marks?.formativeAssessment2?.subjects || getEmptyMarks(),
          formativeAssessment3: data.marks?.formativeAssessment3?.subjects || getEmptyMarks(),
          formativeAssessment4: data.marks?.formativeAssessment4?.subjects || getEmptyMarks(),
          summativeAssessment1: data.marks?.summativeAssessment1?.subjects || getEmptyMarks(),
          summativeAssessment2: data.marks?.summativeAssessment2?.subjects || getEmptyMarks(),
        });
      } catch (err: any) {
        toast.error(err.message || "Error fetching marks");
      }
    };

    fetchMarks();
  }, [selectedStudentId]);

  const handleChange = (
    exam: keyof typeof marks,
    subject: string,
    value: string
  ) => {
    setMarks((prev) => ({
      ...prev,
      [exam]: {
        ...prev[exam],
        [subject]: Number(value),
      },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/staff/${selectedStudentId}/grades`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          [activeExam]: marks[activeExam],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success("Performance updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md rounded-xl max-w-5xl mx-auto mt-4">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-teal-700">
          <Pencil className="w-5 h-5" />
          Update Student Performance
        </h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Class</label>
          <select
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              setSelectedStudentId("");
            }}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">-- Select Class --</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {students.length > 0 && (
          <div className="mb-6">
            <label className="block mb-1 font-medium">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="border px-3 py-2 rounded w-full"
            >
              <option value="">-- Select Student --</option>
              {students.map((stu) => (
                <option key={stu._id} value={stu._id}>
                  {stu.fullName}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedStudentId && (
          <>
            <Tabs defaultValue="formativeAssessment1" className="w-full" onValueChange={(val) => setActiveExam(val as any)}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="formativeAssessment1">Formative Assessment 1</TabsTrigger>
                <TabsTrigger value="formativeAssessment2">Formative Assessment 2</TabsTrigger>
                <TabsTrigger value="formativeAssessment3">Formative Assessment 3</TabsTrigger>
                <TabsTrigger value="formativeAssessment4">Formative Assessment 4</TabsTrigger>
                <TabsTrigger value="summativeAssessment1">Summative Assessment 1</TabsTrigger>
                <TabsTrigger value="summativeAssessment2">Summative Assessment 2</TabsTrigger>
              </TabsList>

              {(["formativeAssessment1", "formativeAssessment2", "formativeAssessment3", "formativeAssessment4", "summativeAssessment1", "summativeAssessment2"] as const).map((exam) => (
                <TabsContent value={exam} key={exam}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {subjects.map((subject) => (
                      <div key={subject}>
                        <label className="block text-sm font-medium mb-1">{subject}</label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={marks[exam][subject]}
                          onChange={(e) => handleChange(exam, subject, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : (
                "Save Performance"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceUpdateForm;
