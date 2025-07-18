/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface PromoteStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  currentClass: string;
}

const classOptions = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Old Students",
];

const defaultFeeStructureByClass: Record<string, { tuition: number; transport: number; kit: number }> = {
  "Grade 1": { tuition: 55000, transport: 0, kit: 15000 },
  "Grade 2": { tuition: 55000, transport: 0, kit: 15000 },
  "Grade 3": { tuition: 55000, transport: 0, kit: 15000 },
  "Grade 4": { tuition: 55000, transport: 0, kit: 15000 },
  "Grade 5": { tuition: 55000, transport: 0, kit: 15000 },
  "Grade 6": { tuition: 75000, transport: 0, kit: 15000 },
  "Grade 7": { tuition: 75000, transport: 0, kit: 15000 },
};

const PromoteStudentDialog: React.FC<PromoteStudentDialogProps> = ({
  isOpen,
  onClose,
  studentId,
  currentClass,
}) => {
  const [nextClass, setNextClass] = useState("");
  const [tuition, setTuition] = useState("");
  const [transport, setTransport] = useState("");
  const [kit, setKit] = useState("");
  const [loading, setLoading] = useState(false);

  const isOldStudent = currentClass === "Old Students";
  const isGraduating = currentClass === "Grade 7" || nextClass === "Old Students";

  useEffect(() => {
    if (isOpen) {
      setNextClass("");
      setTuition("");
      setTransport("");
      setKit("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (nextClass && nextClass !== "Old Students") {
      const defaults = defaultFeeStructureByClass[nextClass] || {
        tuition: 30000,
        transport: 0,
        kit: 0,
      };
      setTuition(defaults.tuition.toString());
      setTransport(defaults.transport.toString());
      setKit(defaults.kit.toString());
    } else {
      setTuition("");
      setTransport("");
      setKit("");
    }
  }, [nextClass]);

  const handlePromote = async () => {
    if (!nextClass.trim()) {
      toast.error("Please select the next class.");
      return;
    }

    if (isOldStudent) {
      toast.error("This student is already marked as an Old Student.");
      return;
    }

    setLoading(true);
    try {
      const updatedFees =
        nextClass !== "Old Students"
          ? {
              tuition: tuition ? parseInt(tuition) : undefined,
              transport: transport ? parseInt(transport) : undefined,
              kit: kit ? parseInt(kit) : undefined,
            }
          : {};

      const response = await fetch(
        `https://vidhyardhi.onrender.com/api/admin/students/${studentId}/promote`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentClass,
            nextClass,
            updatedFees,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to promote student.");
      }

      toast.success(data.message);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to promote student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Promote Student
          </DialogTitle>
        </DialogHeader>

        {isOldStudent ? (
          <div className="text-red-600 text-center font-medium py-6">
            This student is already marked as <strong>Old Student</strong>. Promotion is not allowed.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Class</label>
              <Input disabled value={currentClass} />
            </div>

            <div>
              <label className="text-sm font-medium">Next Class</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={nextClass}
                onChange={(e) => setNextClass(e.target.value)}
              >
                <option value="">Select class</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {!isGraduating && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tuition Fee</label>
                    <Input
                      type="number"
                      placeholder="Tuition"
                      value={tuition}
                      onChange={(e) => setTuition(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Transport Fee</label>
                    <Input
                      type="number"
                      placeholder="Transport"
                      value={transport}
                      onChange={(e) => setTransport(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Kit Fee</label>
                    <Input
                      type="number"
                      placeholder="Kit Fee"
                      value={kit}
                      onChange={(e) => setKit(e.target.value)}
                    />
                  </div>
                </div>

                <div className="text-right text-sm text-gray-600 mt-2">
                  <strong>Total: ₹
                    {[
                      parseInt(tuition || "0"),
                      parseInt(transport || "0"),
                      parseInt(kit || "0"),
                    ].reduce((a, b) => a + b, 0)}
                  </strong>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handlePromote} disabled={loading || isOldStudent}>
            {loading ? "Promoting..." : isGraduating ? "Mark as Old Student" : "Promote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteStudentDialog;
