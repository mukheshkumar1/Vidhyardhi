/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const classOptions = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Old Students"
];

const defaultFeeStructureByClass: Record<string, any> = {
      "Grade 1": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 2": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 3": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 4": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 5": { tuition: 55000, transport: 0, kit: 15000 },
      "Grade 6": { tuition: 75000, transport: 0, kit: 15000 },
      "Grade 7": { tuition: 75000, transport: 0, kit: 15000 },
};

const PromoteStudent = () => {
  const [currentClass, setCurrentClass] = useState("");
  const [nextClass, setNextClass] = useState("");
  const [feeStructure, setFeeStructure] = useState({ tuition: 0, transport: 0, kit: 0 });

  const [studentsInClass, setStudentsInClass] = useState<
    { _id: string; fullName: string; attendance: { percentage: number } }[]
  >([]);
  const [transportOptedIds, setTransportOptedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (nextClass && nextClass !== "Old Students") {
      const defaults = defaultFeeStructureByClass[nextClass] || { tuition: 0, transport: 0, kit: 0 };
      setFeeStructure(defaults);
    } else {
      setFeeStructure({ tuition: 0, transport: 0, kit: 0 });
    }
  }, [nextClass]);

  useEffect(() => {
    if (currentClass) {
      fetch(`https://vidhyardhi.onrender.com/api/admin/students/by-class?className=${encodeURIComponent(currentClass)}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setStudentsInClass(data.students || []))
        .catch((err) => {
          console.error(err);
          setStudentsInClass([]);
        });
    } else {
      setStudentsInClass([]);
    }
  }, [currentClass]);

  const totalFee = feeStructure.tuition + feeStructure.transport + feeStructure.kit;

  const handleFeeChange = (field: string, value: string) => {
    setFeeStructure((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const toggleTransportOpt = (id: string) => {
    setTransportOptedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handlePromotion = async () => {
    if (!currentClass || !nextClass) {
      return toast.error("Please fill in all fields.");
    }

    if (currentClass === nextClass) {
      return toast.error("Next class must be different from current class.");
    }

    setLoading(true);
    try {
      const res = await fetch("https://vidhyardhi.onrender.com/api/admin/students/promote", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentClass,
          nextClass,
          updatedFees: nextClass !== "Old Students" ? feeStructure : {},
          transportOptedIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Promotion failed.");

      toast.success(data.message);
      setCurrentClass("");
      setNextClass("");
      setFeeStructure({ tuition: 0, transport: 0, kit: 0 });
      setTransportOptedIds([]);
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to promote students.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
          Promote Students
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-white/10 border border-white/20 backdrop-blur-md text-white">
        <DialogHeader>
          <DialogTitle className="text-blue-300">Promote Students to Next Grade</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="block mb-1">Current Class</Label>
            <select
              value={currentClass}
              onChange={(e) => setCurrentClass(e.target.value)}
              className="w-full p-2 bg-black rounded-md border border-white/10 text-white"
            >
              <option value="">Select class</option>
              {classOptions.filter(c => c !== "Old Students").map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="block mb-1">Next Class</Label>
            <select
              value={nextClass}
              onChange={(e) => setNextClass(e.target.value)}
              className="w-full p-2 bg-black rounded-md border border-white/10 text-white"
            >
              <option value="">Select class</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {nextClass !== "Old Students" && ["tuition", "transport", "kit"].map((field) => (
            <div key={field}>
              <Label className="capitalize block mb-1">{field} Fee</Label>
              <Input
                type="number"
                value={feeStructure[field as keyof typeof feeStructure]}
                onChange={(e) => handleFeeChange(field, e.target.value)}
                placeholder={`Enter ${field} fee`}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          ))}

          <div>
            <Label className="block mb-1 font-semibold text-blue-300">Total Fee</Label>
            <div className="p-2 bg-white/5 rounded-md border border-white/10 text-white">
              ₹ {totalFee}
            </div>
          </div>

          {studentsInClass.length > 0 && (
            <div className="mt-4 border border-white/10 p-3 rounded-md bg-white/5">
              <h3 className="text-blue-300 font-semibold mb-2">
                Students in {currentClass} (Select Transport Opt-in)
              </h3>
              <ul className="space-y-2 max-h-48 overflow-y-auto text-sm">
                {studentsInClass.map((student) => (
                  <li key={student._id} className="flex justify-between items-center">
                    <span className="text-white/90">{student.fullName}</span>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={transportOptedIds.includes(student._id)}
                        onChange={() => toggleTransportOpt(student._id)}
                      />
                      Transport
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={handlePromotion}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500"
          >
            {loading ? "Promoting..." : "Confirm Promotion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteStudent;
