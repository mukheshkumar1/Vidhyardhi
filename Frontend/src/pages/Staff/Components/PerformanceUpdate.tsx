import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

const subjects = ["Telugu", "Hindi", "English", "Maths", "Science", "Social Studies"];
const classes = [
  "Nursery", "LKG", "UKG", "Grade 1", "Grade 2", "Grade 3", "Grade 4",
  "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"
];

type Marks = Record<string, number>;

type Student = {
  _id: string;
  fullName: string;
};

const UpdatePerformance = () => {
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [marks, setMarks] = useState({
    quarterly: {} as Marks,
    halfYearly: {} as Marks,
    annual: {} as Marks,
  });

  useEffect(() => {
    const fetchStudents = async () => {
      if (!className) return;
      try {
        const res = await fetch(
          `http://localhost:5000/api/staff/class/${encodeURIComponent(className)}`,
          { credentials: "include" }
        );
        const data = await res.json();

        const studentList = Array.isArray(data) ? data : data.students || [];
        setStudents(studentList);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast.error("Failed to load students");
        setStudents([]);
      }
    };

    fetchStudents();
  }, [className]);

  const handleChange = (
    exam: "quarterly" | "halfYearly" | "annual",
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
    if (!selectedStudent) return toast.error("Please select a student");

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/staff/${selectedStudent._id}/grades`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(marks),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success(data.message || "Performance updated successfully");

      // ✅ Reset form after successful submission
      setSelectedStudent(null);
      setMarks({
        quarterly: {} as Marks,
        halfYearly: {} as Marks,
        annual: {} as Marks,
      });
      // If you want to reset className too, uncomment below
      //setClassName("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto mt-6 shadow-xl rounded-2xl">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Pencil className="w-5 h-5" />
          Update Student Performance
        </h2>

        {/* Select Class */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Class</label>
          <select
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              setSelectedStudent(null);
              setMarks({
                quarterly: {} as Marks,
                halfYearly: {} as Marks,
                annual: {} as Marks,
              });
            }}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Select Class --</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Select Student */}
        {className && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Select Student</label>
            <select
              value={selectedStudent?._id || ""}
              onChange={(e) =>
                setSelectedStudent(
                  students.find((s) => s._id === e.target.value) || null
                )
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Select Student --</option>
              {Array.isArray(students) &&
                students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.fullName}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Marks Tabs */}
        {selectedStudent && (
          <>
            <Tabs defaultValue="quarterly" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                <TabsTrigger value="halfYearly">Half Yearly</TabsTrigger>
                <TabsTrigger value="annual">Annual</TabsTrigger>
              </TabsList>

              {(["quarterly", "halfYearly", "annual"] as const).map((exam) => (
                <TabsContent value={exam} key={exam}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    {subjects.map((subject) => (
                      <div key={subject}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {subject}
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="Marks out of 100"
                          value={marks[exam][subject] || ""}
                          onChange={(e) =>
                            handleChange(exam, subject, e.target.value)
                          }
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
                  <Loader2 className="animate-spin mr-2 w-4 h-4" />
                  Saving...
                </>
              ) : (
                "Submit Performance"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UpdatePerformance;
