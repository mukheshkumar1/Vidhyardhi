/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type StudentType = {
  _id: string;
  fullName: string;
  className: string;
  profilePicture?: { imageUrl: string };
};

const SetClassLeaderCandidates = () => {
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<StudentType[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleClassChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = e.target.value;
    setClassName(selectedClass);
    setLoading(true);
    setSelectedIds([]);
    setSearchTerm("");

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/students/${selectedClass}`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch students.");
      const data = await res.json();
      if (Array.isArray(data.students)) {
        setStudents(data.students);
      } else {
        toast.error("Invalid response from server.");
        setStudents([]);
      }
    } catch (err) {
      toast.error("Failed to fetch students.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCandidate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submitCandidates = async () => {
    if (!className || selectedIds.length === 0) {
      return toast.warning("Select a class and at least one student.");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/select-classleader", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ className, candidateIds: selectedIds }),
      });

      if (!res.ok) throw new Error("Failed to set candidates.");
      toast.success("Candidates assigned successfully.");
      setSelectedIds([]); // Reset after success
    } catch (err) {
      toast.error("Failed to set candidates.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="max-w-4xl mx-auto mt-6 p-4 rounded-2xl border backdrop-blur-md bg-white/70 shadow-xl">
      <CardHeader>
        <CardTitle className="text-purple-800 text-xl font-bold">👤 Select Class Leader Candidates</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <select
          onChange={handleClassChange}
          value={className}
          className="border p-2 rounded-xl w-full bg-white/80 text-black font-medium shadow"
        >
          <option value="">🎓 Select Class</option>
          {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"].map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>

        {students.length > 0 && (
          <Input
            placeholder="🔍 Search student by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl bg-white/80 text-black font-medium shadow"
          />
        )}

        {loading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="animate-spin text-purple-500" />
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredStudents.map((student) => (
              <label
                key={student._id}
                className="flex items-center gap-3 backdrop-blur-md bg-white/70 border border-gray-300 shadow-md p-3 rounded-xl cursor-pointer transition hover:scale-[1.01]"
              >
                <Checkbox
                  checked={selectedIds.includes(student._id)}
                  onCheckedChange={() => toggleCandidate(student._id)}
                />
                <img
                  src={student.profilePicture?.imageUrl || "/default-avatar.png"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                />
                <span className="font-medium text-gray-800">{student.fullName}</span>
              </label>
            ))}
          </div>
        ) : (
          className && (
            <p className="text-center text-gray-500">No students found in this class.</p>
          )
        )}

        <Button
          onClick={submitCandidates}
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl shadow hover:opacity-90"
        >
          {loading ? "Submitting..." : "✅ Set as Candidates"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SetClassLeaderCandidates;
