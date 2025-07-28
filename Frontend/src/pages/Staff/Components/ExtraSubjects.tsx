/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

const classOptions = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4",
  "Grade 5", "Grade 6", "Grade 7"
];

const gradeOptions = ["A+", "A", "B+", "B", "C+", "C"];

const ExtraCurricularForm = () => {
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [activityName, setActivityName] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch students when class changes
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

  const handleSubmit = async () => {
    if (!selectedStudentId || !activityName || !grade) {
      toast.error("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/staff/add/${selectedStudentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ activityName, grade }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit activity");

      toast.success("Extra-curricular grade added!");
      setActivityName("");
      setGrade("");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md rounded-xl max-w-3xl mx-auto mt-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-700">
          <Plus className="w-5 h-5" />
          Add Extra-Curricular Grade
        </h2>

        {/* Class Select */}
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

        {/* Student Select */}
        {students.length > 0 && (
          <div className="mb-4">
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

        {/* Activity Name and Grade */}
        {selectedStudentId && (
          <div className="grid gap-4">
            <div>
              <label className="block mb-1 font-medium">Activity Name</label>
              <Input
                type="text"
                placeholder="e.g., Debate Competition"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="">-- Select Grade --</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Add Activity Grade"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtraCurricularForm;
