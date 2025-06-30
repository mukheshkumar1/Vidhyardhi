/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Staff/Components/PerformanceUpdate.tsx
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

const subjects = ["Telugu", "Hindi", "English", "Maths", "Science", "Social Studies"];

type Marks = Record<string, number>;

type PerformanceUpdateFormProps = {
  studentId: string;
};

const getEmptyMarks = (): Marks =>
  subjects.reduce((acc, subject) => ({ ...acc, [subject]: 0 }), {} as Marks);

const PerformanceUpdateForm: React.FC<PerformanceUpdateFormProps> = ({ studentId }) => {
  const [loading, setLoading] = useState(false);
  const [marks, setMarks] = useState({
    quarterly: getEmptyMarks(),
    halfYearly: getEmptyMarks(),
    annual: getEmptyMarks(),
  });

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!studentId) return;
      try {
        const res = await fetch(`https://vidhyardhi.onrender.com/api/staff/${studentId}/grades`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch marks");
        setMarks(data.marks || {
          quarterly: getEmptyMarks(),
          halfYearly: getEmptyMarks(),
          annual: getEmptyMarks(),
        });
      } catch (err: any) {
        toast.error(err.message || "Error fetching student performance");
      }
    };

    fetchPerformance();
  }, [studentId]);

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

  const isFormValid = Object.values(marks).every((examMarks) =>
    subjects.every((subject) => typeof examMarks[subject] === "number")
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/staff/${studentId}/grades`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(marks),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update performance");

      toast.success("Performance updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md rounded-xl">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Pencil className="w-5 h-5" />
          Update Performance
        </h2>

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
                    <label className="block text-sm font-medium mb-1">{subject}</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Marks out of 100"
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
          disabled={loading || !isFormValid}
          className="w-full mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 w-4 h-4" />
              Saving...
            </>
          ) : (
            "Save Performance"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PerformanceUpdateForm;
