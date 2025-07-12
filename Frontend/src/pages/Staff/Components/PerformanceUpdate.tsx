/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

const subjects = ["Telugu", "Hindi", "English", "Maths", "Science", "Social Studies"];
const classOptions = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];

const getEmptyMarks = () =>
  subjects.reduce((acc, subject) => ({ ...acc, [subject]: 0 }), {} as Record<string, number>);

const PerformanceUpdateForm = () => {
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [marks, setMarks] = useState({
    quarterly: getEmptyMarks(),
    halfYearly: getEmptyMarks(),
    annual: getEmptyMarks(),
  });
  const [activeExam, setActiveExam] = useState<"quarterly" | "halfYearly" | "annual">("quarterly");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!className) return;

    const fetchStudents = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/staff/class/${className}`, {
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
        const res = await fetch(`http://localhost:5000/api/staff/${selectedStudentId}/grades`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch marks");
        setMarks({
          quarterly: data.marks?.quarterly?.subjects || getEmptyMarks(),
          halfYearly: data.marks?.halfYearly?.subjects || getEmptyMarks(),
          annual: data.marks?.annual?.subjects || getEmptyMarks(),
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
      const res = await fetch(`http://localhost:5000/api/staff/${selectedStudentId}/grades`, {
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
            <Tabs defaultValue="quarterly" className="w-full" onValueChange={(val) => setActiveExam(val as any)}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                <TabsTrigger value="halfYearly">Half-Yearly</TabsTrigger>
                <TabsTrigger value="annual">Annual</TabsTrigger>
              </TabsList>

              {(["quarterly", "halfYearly", "annual"] as const).map((exam) => (
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
