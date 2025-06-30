/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  CreditCard, CalendarCheck, IndianRupee, FileDown
} from "lucide-react";

interface StudentFeeDetailsProps {
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface FeeTerm {
  amount: number;
  status: string;
  paidAmount: number;
}

interface FeeSummary {
  total: number;
  paid: number;
  balance: number;
  tuition: {
    firstTerm: FeeTerm;
    secondTerm: FeeTerm;
  };
  transport: FeeTerm;
}

interface FeePayment {
  date: string;
  amount: number;
  mode: string;
  remarks?: string;
}

const StudentFeeDetails: React.FC<StudentFeeDetailsProps> = ({
  studentId, isOpen, onClose
}) => {
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState<{ [key: string]: number }>({});
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const fetchFeeDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/admin/students/${studentId}/fees`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch fee details");
      setFeeSummary(json.feeSummary);
      setFeePayments(json.feePayments);
      setStudentName(json.fullName);
    } catch (err: any) {
      toast.error(err.message || "Error fetching fee details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchFeeDetails();
  }, [isOpen]);

  const handleBreakdownChange = (component: string, value: string) => {
    const amt = parseInt(value, 10);
    setPaymentBreakdown((prev) => ({
      ...prev,
      [component]: isNaN(amt) ? 0 : amt,
    }));
  };

  const handleManualPayment = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/admin/students/${studentId}/fee-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          paymentBreakdown,
          paymentMethod: (paymentMode ?? "").toUpperCase(),
          mode: paymentMode,
        }),
      });
      const blobOrJson = await res.blob().catch(() => null);
      if (res.ok && blobOrJson instanceof Blob) {
        const url = window.URL.createObjectURL(blobOrJson);
        setReceiptUrl(url);
        toast.success("Payment recorded. Receipt downloaded.");
        setPaymentBreakdown({});
        setPaymentMode(null);
        setShowPaymentDialog(false);
        fetchFeeDetails();
      } else {
        const jsonErr = await res.json().catch(() => null);
        throw new Error(jsonErr?.error || "Payment failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Error recording payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl rounded-xl bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">
            Fee Details — {studentName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : feeSummary ? (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 bg-blue-50 border rounded-lg">
                <h3 className="font-semibold text-blue-800">Summary</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <p>Paid: ₹{feeSummary.paid}</p>
                  <p>Balance: ₹{feeSummary.balance}</p>
                </div>
              </div>

              {/* Tuition & Transport */}
              <div className="p-4 bg-sky-100 border rounded-lg">
                <h3 className="font-semibold text-sky-800">Tuition Fee</h3>
                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                  {["firstTerm", "secondTerm"].map((t) => (
                    <div key={t} className="border p-3 bg-white rounded shadow">
                      <h4 className="font-semibold text-blue-600">
                        {t === "firstTerm" ? "First Term" : "Second Term"}
                      </h4>
                      <p>Amount: ₹{feeSummary.tuition[t as "firstTerm" | "secondTerm"].amount}</p>
                      <p>Status: {feeSummary.tuition[t as "firstTerm" | "secondTerm"].status}</p>
                      <p>Paid: ₹{feeSummary.tuition[t as "firstTerm" | "secondTerm"].paidAmount}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 border rounded-lg">
                <h3 className="font-semibold text-yellow-700">Transport Fee</h3>
                <p>Amount: ₹{feeSummary.transport.amount}</p>
                <p>Status: {feeSummary.transport.status}</p>
                <p>Paid: ₹{feeSummary.transport.paidAmount}</p>
              </div>

              {/* Previous Payments */}
              <div className="p-4 bg-gray-100 border rounded-lg">
                <h3 className="font-semibold text-green-700">Previous Payments</h3>
                {feePayments.length === 0 ? (
                  <p className="text-gray-500">No transactions.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {feePayments.map((p, i) => (
                      <li key={i} className="flex items-start gap-3 border-b pb-2">
                        <CalendarCheck className="text-green-500" />
                        <div>
                          <p>Date: {new Date(p.date).toLocaleDateString()}</p>
                          <p>Amount: ₹{p.amount}</p>
                          <p>Mode: {p.mode}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Make Payment Button */}
              <div className="text-center mt-4">
                <Button onClick={() => setShowPaymentDialog(true)}>
                  <CreditCard className="mr-2" /> Make Payment
                </Button>
              </div>

              {/* Receipt Download */}
              {receiptUrl && (
                <div className="text-center mt-3">
                  <a href={receiptUrl} download={`Receipt-${studentName}.pdf`}>
                    <FileDown className="inline mr-1" />
                    Download Receipt
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-red-500">No data available.</p>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>

        {/* Payment Dialog */}
        {showPaymentDialog && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
              <h3 className="mb-4 text-lg font-bold">Manual Payment</h3>
              <RadioGroup value={paymentMode ?? ""} onValueChange={(v) => setPaymentMode(v as any)} className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
              </RadioGroup>

              <div className="space-y-3 mb-4">
                {feeSummary?.tuition.firstTerm.status === "Pending" && (
                  <div>
                    <Label>First Term Amount</Label>
                    <Input type="number" onChange={(e) => handleBreakdownChange("tuition.firstTerm", e.target.value)} />
                  </div>
                )}
                {feeSummary?.tuition.secondTerm.status === "Pending" && (
                  <div>
                    <Label>Second Term Amount</Label>
                    <Input type="number" onChange={(e) => handleBreakdownChange("tuition.secondTerm", e.target.value)} />
                  </div>
                )}
                {feeSummary?.transport.status === "Pending" && (
                  <div>
                    <Label>Transport Amount</Label>
                    <Input type="number" onChange={(e) => handleBreakdownChange("transport", e.target.value)} />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
                <Button onClick={() => setShowConfirm(true)} disabled={isSubmitting}>
                  <IndianRupee className="mr-1" /> Submit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-sm">
              <h3 className="mb-2 text-lg font-bold">Confirm Payment</h3>
              <p className="mb-4">Record payment of ₹{Object.values(paymentBreakdown).reduce((a, b) => a + b, 0)} via {paymentMode?.toUpperCase()}?</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                <Button onClick={handleManualPayment} disabled={isSubmitting}>Yes, Record</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentFeeDetails;
