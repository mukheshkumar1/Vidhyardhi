/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  CreditCard,
  CalendarCheck,
  IndianRupee,
  FileDown,
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
  studentId,
  isOpen,
  onClose,
}) => {
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState<{
    [key: string]: number;
  }>({});
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const fetchFeeDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/student/${studentId}/fees`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch fee details");
      const data = await res.json();
      setFeeSummary(data.feeSummary);
      setFeePayments(data.feePayments);
      setStudentName(data.fullName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Error fetching fee details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchFeeDetails();
  }, [isOpen]);

  const renderStatus = (status: string) =>
    status === "Paid" ? (
      <span className="text-green-500 font-semibold">✅ Paid</span>
    ) : (
      <span className="text-red-500 font-semibold">❌ Pending</span>
    );

  const handleBreakdownChange = (component: string, value: string) => {
    const amount = parseInt(value, 10);
    setPaymentBreakdown((prev) => ({
      ...prev,
      [component]: isNaN(amount) ? 0 : amount,
    }));
  };

  const handleManualPayment = async () => {
    setShowConfirm(false);
    try {
      setIsSubmitting(true);
      const res = await fetch(
        `http://localhost:5000/api/admin/students/${studentId}/fee-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            paymentBreakdown,
            paymentMethod: paymentMode?.toUpperCase(),
            mode: paymentMode,
          }),
        }
      );
      if (!res.ok) throw new Error("Payment failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setReceiptUrl(url);
      toast.success("Payment recorded and receipt downloaded");
      setPaymentBreakdown({});
      setPaymentMode(null);
      setShowPaymentDialog(false);
      fetchFeeDetails();
    } catch {
      toast.error("Error recording payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl rounded-xl bg-white shadow-lg border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center">
            Fee Details - {studentName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : feeSummary ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-blue-700 mb-2">💼 Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p>Paid: ₹{feeSummary.paid}</p>
                  <p>Balance: ₹{feeSummary.balance}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gradient-to-br from-sky-100 to-white">
                <h3 className="font-semibold text-sky-700 mb-3">🎓 Tuition Fee</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {["firstTerm", "secondTerm"].map((term) => (
                    <div
                      key={term}
                      className="bg-white p-3 rounded border shadow"
                    >
                      <h4 className="font-semibold text-blue-600">
                        {term === "firstTerm" ? "First Term" : "Second Term"}
                      </h4>
                      <p>
                        Amount: ₹
                        {feeSummary.tuition[term as "firstTerm" | "secondTerm"]
                          .amount}
                      </p>
                      <p>
                        Status:{" "}
                        {renderStatus(
                          feeSummary.tuition[
                            term as "firstTerm" | "secondTerm"
                          ].status
                        )}
                      </p>
                      <p>
                        Paid: ₹
                        {
                          feeSummary.tuition[
                            term as "firstTerm" | "secondTerm"
                          ].paidAmount
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-yellow-700 mb-2">
                  🚌 Transport Fee
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p>Amount: ₹{feeSummary.transport.amount}</p>
                  <p>Status: {renderStatus(feeSummary.transport.status)}</p>
                  <p>Paid: ₹{feeSummary.transport.paidAmount}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gray-100">
                <h3 className="font-semibold text-green-700 mb-2">
                  📜 Previous Payments
                </h3>
                {feePayments.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No transactions available.
                  </p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {feePayments.map((pay, idx) => (
                      <li
                        key={idx}
                        className="border-b pb-2 flex items-start gap-3"
                      >
                        <CalendarCheck className="text-green-500 mt-1" size={18} />
                        <div>
                          <p>
                            <strong>Date:</strong>{" "}
                            {new Date(pay.date).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Amount:</strong> ₹{pay.amount}
                          </p>
                          <p>
                            <strong>Mode:</strong> {pay.mode}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="text-center mt-6">
                <Button
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold shadow-lg px-6 py-2"
                  onClick={() => setShowPaymentDialog(true)}
                >
                  <CreditCard className="mr-2" size={18} /> Make Payment
                </Button>
              </div>

              {receiptUrl && (
                <div className="text-sm text-center mt-3">
                  <a
                    href={receiptUrl}
                    download={`FeeReceipt-${studentName}.pdf`}
                    className="text-blue-600 underline inline-flex items-center gap-1"
                  >
                    <FileDown size={16} /> Download Last Receipt
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-red-500">No data found.</p>
          )}
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>

        {/* Manual Payment Dialog */}
        {showPaymentDialog && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="backdrop-blur-md bg-white/10 border  text-white rounded-xl shadow-xl p-6 w-[90%] max-w-lg">
              <h3 className="text-lg font-bold mb-4">Manual Fee Payment</h3>

              <RadioGroup
                value={paymentMode ?? ""}
                onValueChange={(val) => setPaymentMode(val as "cash" | "upi")}
                className="flex gap-6 mb-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">💵 Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">📱 UPI</Label>
                </div>
              </RadioGroup>

              <div className="grid gap-4 mb-4">
                {feeSummary?.tuition.firstTerm.status === "Pending" && (
                  <div>
                   <Label className=" text-violet-900"><strong>First Term Tuition Fee</strong></Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Enter amount"
                      onChange={(e) =>
                        handleBreakdownChange("tuition.firstTerm", e.target.value)
                      }
                    />
                  </div>
                )}
                {feeSummary?.tuition.secondTerm.status === "Pending" && (
                  <div>
                    <Label className=" text-violet-900"><strong>Second Term Tuition Fee</strong></Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Enter amount"
                      onChange={(e) =>
                        handleBreakdownChange("tuition.secondTerm", e.target.value)
                      }
                    />
                  </div>
                )}
                {feeSummary?.transport.status === "Pending" && (
                  <div>
                    <Label className=" text-violet-900"><strong>Transport Fee</strong></Label>
                    <Input
                      type="number"
                      className="rounded-xl "
                      min={0}
                      placeholder="Enter amount"
                      onChange={(e) =>
                        handleBreakdownChange("transport", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                   className="bg-red-500 hover:bg-red-500 text-white rounded-xl shadow-lg 
             hover:animate-bounceOnce active:scale-95 transition-transform duration-150"
                  onClick={() => setShowPaymentDialog(false)}
                >
                  Cancel
                </Button>
                <Button
             className="bg-blue-500 hover:bg-green-500 text-white rounded-xl shadow-lg 
             hover:animate-bounceOnce active:scale-95 transition-transform duration-150"
             onClick={() => setShowConfirm(true)}
             disabled={isSubmitting}
              >
                  <IndianRupee size={18} className="mr-2" /> Submit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-[90%]">
              <h3 className="text-lg font-bold mb-2">Confirm Payment</h3>
              <p className="mb-4 text-sm">
                Are you sure you want to record payment of ₹
                {Object.values(paymentBreakdown).reduce((a, b) => a + b, 0)} via{" "}
                {paymentMode?.toUpperCase()}?
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleManualPayment} disabled={isSubmitting}>
                  Yes, Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudentFeeDetails;
