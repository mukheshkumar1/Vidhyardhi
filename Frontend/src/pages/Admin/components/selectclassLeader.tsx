/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
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
    <Card className="max-w-3xl mx-auto mt-6 p-4 shadow-xl">
      <CardHeader>
        <CardTitle>Select Class Leader Candidates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <select
          onChange={handleClassChange}
          value={className}
          className="border p-2 rounded w-full text-black"
        >
          <option value="">Select Class</option>
          <option value="Grade 1">Class 1</option>
          <option value="Grade 2">Class 2</option>
          <option value="Grade 3">Class 3</option>
          <option value="Grade 4">Class 4</option>
          <option value="Grade 5">Class 5</option>
          <option value="Grade 6">Class 6</option>
          <option value="Grade 7">Class 7</option>
        </select>

        {students.length > 0 && (
          <Input
            placeholder="Search student by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-black"
          />
        )}

        {loading ? (
          <div className="flex justify-center my-8">
            <Loader2 className="animate-spin" />
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredStudents.map((student) => (
              <label
                key={student._id}
                className="flex items-center gap-3 border p-2 rounded cursor-pointer"
              >
                <Checkbox
                  checked={selectedIds.includes(student._id)}
                  onCheckedChange={() => toggleCandidate(student._id)}
                />
                <img
                  src={student.profilePicture?.imageUrl || "/default-avatar.png"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span>{student.fullName}</span>
              </label>
            ))}
          </div>
        ) : (
          className && (
            <p className="text-center text-gray-500">No students found in this class.</p>
          )
        )}

        <Button onClick={submitCandidates} disabled={loading}>
          {loading ? "Submitting..." : "Set as Candidates"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SetClassLeaderCandidates;
