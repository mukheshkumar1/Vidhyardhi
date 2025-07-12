import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface FeeStructure {
  total: number;
  tuition?: {
    firstTerm: number;
    secondTerm: number;
  };
  transport: number;
  kit: number;
  paid: number;
  balance: number;
}

interface Props {
  studentId: string;
  fullName: string;
  feeStructure: FeeStructure;
  onUpdateSuccess: () => void;
  open: boolean;
  setOpen: (val: boolean) => void;
}

const EditStudentProfile: React.FC<Props> = ({
  studentId,
  fullName,
  feeStructure: initialFee,
  onUpdateSuccess,
  open,
  setOpen,
}) => {
  const [fullNameState, setFullNameState] = useState(fullName);
  const [feeStructure, setFeeStructure] = useState<FeeStructure>({
    ...initialFee,
    tuition: {
      firstTerm: initialFee.tuition?.firstTerm ?? 0,
      secondTerm: initialFee.tuition?.secondTerm ?? 0,
    },
    kit: initialFee.kit ?? 0,
  });

  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const recalculateTotalAndBalance = (firstTerm: number, secondTerm: number, transport: number, kit: number, paid: number) => {
    const total = firstTerm + secondTerm + transport + kit;
    const balance = total - paid;
    setFeeStructure((prev) => ({
      ...prev,
      total,
      balance,
    }));
  };

  const handleTuitionChange = (value: number) => {
    const firstTerm = Math.floor(value / 2);
    const secondTerm = value - firstTerm;
    setFeeStructure((prev) => ({
      ...prev,
      tuition: { firstTerm, secondTerm },
    }));
    recalculateTotalAndBalance(firstTerm, secondTerm, feeStructure.transport, feeStructure.kit, feeStructure.paid);
  };

  const handleTransportChange = (value: number) => {
    setFeeStructure((prev) => ({
      ...prev,
      transport: value,
    }));
    recalculateTotalAndBalance(feeStructure.tuition!.firstTerm, feeStructure.tuition!.secondTerm, value, feeStructure.kit, feeStructure.paid);
  };

  const handleKitChange = (value: number) => {
    setFeeStructure((prev) => ({
      ...prev,
      kit: value,
    }));
    recalculateTotalAndBalance(feeStructure.tuition!.firstTerm, feeStructure.tuition!.secondTerm, feeStructure.transport, value, feeStructure.paid);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tuitionTotal = (feeStructure.tuition?.firstTerm ?? 0) + (feeStructure.tuition?.secondTerm ?? 0);
      const initialTuitionTotal = (initialFee.tuition?.firstTerm ?? 0) + (initialFee.tuition?.secondTerm ?? 0);

      const updatedFeeStructure: any = {};

      if (tuitionTotal !== initialTuitionTotal) {
        updatedFeeStructure.tuition = {
          firstTerm: feeStructure.tuition?.firstTerm ?? 0,
          secondTerm: feeStructure.tuition?.secondTerm ?? 0,
        };
      }

      if (feeStructure.transport !== initialFee.transport) {
        updatedFeeStructure.transport = feeStructure.transport;
      }

      if (feeStructure.kit !== initialFee.kit) {
        updatedFeeStructure.kit = feeStructure.kit;
      }

      const res = await fetch(`http://localhost:5000/api/admin/students/update/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullNameState !== fullName ? fullNameState : undefined,
          feeStructure: Object.keys(updatedFeeStructure).length > 0 ? updatedFeeStructure : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setSnackbar({ open: true, message: "Student updated successfully", severity: "success" });
      onUpdateSuccess();
      setOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: "Update failed", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px] px-6 py-6 bg-white text-black rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Student</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={fullNameState}
              onChange={(e) => setFullNameState(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Total Tuition Fee</label>
            <input
              type="number"
              value={(feeStructure.tuition?.firstTerm ?? 0) + (feeStructure.tuition?.secondTerm ?? 0)}
              onChange={(e) => handleTuitionChange(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">1st Term</label>
              <input
                type="number"
                value={feeStructure.tuition?.firstTerm ?? 0}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">2nd Term</label>
              <input
                type="number"
                value={feeStructure.tuition?.secondTerm ?? 0}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Transport Fee</label>
            <input
              type="number"
              value={feeStructure.transport}
              onChange={(e) => handleTransportChange(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Kit Fee</label>
            <input
              type="number"
              value={feeStructure.kit}
              onChange={(e) => handleKitChange(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Paid Amount</label>
            <input
              type="number"
              value={feeStructure.paid}
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Balance</label>
            <input
              type="number"
              value={feeStructure.balance}
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-between">
          <DialogClose asChild>
            <button className="px-4 py-2 border rounded-md hover:bg-gray-100">Cancel</button>
          </DialogClose>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Student"}
          </button>
        </DialogFooter>

        {snackbar.open && (
          <div className="mt-4">
            <div
              className={`rounded p-3 text-sm ${
                snackbar.severity === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {snackbar.message}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentProfile;
