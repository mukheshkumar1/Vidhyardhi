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

const defaultFeeStructureByClass: Record<string, { tuition: number; transport: number }> = {
  "Grade 1": { tuition: 55000, transport: 0 },
  "Grade 2": { tuition: 55000, transport: 0 },
  "Grade 3": { tuition: 55000, transport: 0 },
  "Grade 4": { tuition: 55000, transport: 0 },
  "Grade 5": { tuition: 55000, transport: 0 },
  "Grade 6": { tuition: 75000, transport: 0 },
  "Grade 7": { tuition: 75000, transport: 0 },
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
  const [loading, setLoading] = useState(false);

  const isOldStudent = currentClass === "Old Students";
  const isGraduating = currentClass === "Grade 7" || nextClass === "Old Students";

  useEffect(() => {
    if (isOpen) {
      setNextClass("");
      setTuition("");
      setTransport("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (nextClass && nextClass !== "Old Students") {
      const defaults = defaultFeeStructureByClass[nextClass] || { tuition: 30000, transport: 0 };
      setTuition(defaults.tuition.toString());
      setTransport(defaults.transport.toString());
    } else {
      setTuition("");
      setTransport("");
    }
  }, [nextClass]);

  const handlePromote = async () => {
    if (!nextClass.trim()) {
      toast.error("Please enter the next class.");
      return;
    }

    if (isOldStudent) {
      toast.error("This student is already marked as an Old Student.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/students/${studentId}/promote`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentClass,
            nextClass,
            updatedFees:
              nextClass !== "Old Students"
                ? {
                    tuition: tuition ? parseInt(tuition) : undefined,
                    transport: transport ? parseInt(transport) : undefined,
                  }
                : {},
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
              <Input
                placeholder="e.g., Grade 7 or Old Students"
                value={nextClass}
                onChange={(e) => setNextClass(e.target.value)}
              />
            </div>

            {!isGraduating && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tuition Fee</label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={tuition}
                    onChange={(e) => setTuition(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Transport Fee</label>
                  <Input
                    type="number"
                    placeholder="Optional"
                    value={transport}
                    onChange={(e) => setTransport(e.target.value)}
                  />
                </div>
              </div>
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
