/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Banknote, CalendarCheck2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type FeeStructure = {
  firstTerm: number;
  secondTerm: number;
  transport: number;
  paid: number;
  balance: number;
  paidComponents?: Record<string, number>;
};

type FeePayment = {
  amount: number;
  mode: string;
  transactionId: string;
  breakdown: Record<string, number>;
  date: string;
  term?: string;
  paidFor?: {
    tuition?: boolean;
    transport?: boolean;
  };
};

interface StudentFeeDetailsProps {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentContact: string;
}

export default function StudentFeeDetails({
  studentId,
  studentName,
  studentEmail,
  studentContact,
}: StudentFeeDetailsProps) {
  const [feeStructure, setFeeStructure] = useState<FeeStructure | null>(null);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/student/${studentId}/academic-details`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setFeeStructure(data.feeStructure);
        setFeePayments(data?.feePayments || []); // <-- Direct from backend
      })
      .catch(() => toast.error("Failed to load fee details."))
      .finally(() => setLoading(false));
  }, [studentId]);

  const handlePay = async (component: string, amount: number) => {
    try {
      const breakdown: Record<string, number> = { [component]: amount };

      const res = await fetch(`http://localhost:5000/api/student/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ breakdown }),
      });

      const data = await res.json();
      if (!res.ok || !data?.order?.id || !data?.key) {
        throw new Error(data.error || "Order creation failed");
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "Vidhyardhi School",
        image: "https://res.cloudinary.com/demj86hzs/image/upload/v1746683193/logo5_vtqy9w.png",
        description: "Fee Payment",
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`http://localhost:5000/api/student/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                paymentBreakdown: breakdown,
                paymentMethod: response.method || "razorpay",
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error);

            toast.success("Payment successful!");
            setFeeStructure((prev) =>
              prev
                ? {
                    ...prev,
                    paid: prev.paid + amount,
                    balance: Math.max(0, prev.balance - amount),
                    paidComponents: {
                      ...prev.paidComponents,
                      [component]: (prev.paidComponents?.[component] || 0) + amount,
                    },
                  }
                : null
            );
          } catch (err: any) {
            toast.error(err.message || "Verification failed.");
          }
        },
        prefill: {
          name: studentName,
          email: studentEmail,
          contact: studentContact,
        },
        theme: {
          color: "#69306d",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to initiate payment");
    }
  };

  const isPaid = (key: string, full: number) =>
    (feeStructure?.paidComponents?.[key] || 0) >= full;

  if (loading || !feeStructure) {
    return (
      <div
        className="flex justify-center items-center h-40"
        style={{ backgroundColor: "#e3bdea", minHeight: "100vh", padding: "1rem" }}
      >
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      style={{ backgroundColor: "#e3bdea", minHeight: "100vh", padding: "1rem" }}
    >
      {/* Fee Structure */}
      <Card className="bg-background shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Banknote className="w-5 h-5" /> Fee Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {["firstTerm", "secondTerm", "transport"].map((key) => {
            const displayName = key.replace("Term", " Term");
            const fullAmount = (feeStructure as any)[key];
            const componentKey = key === "transport" ? "transport" : `tuition.${key}`;

            return (
              <div key={key} className="flex justify-between items-center">
                <span className="capitalize">{displayName}</span>
                <span>₹{fullAmount}</span>
                <Button
                  className="ml-4"
                  disabled={isPaid(componentKey, fullAmount)}
                  onClick={() => handlePay(componentKey, fullAmount)}
                >
                  {isPaid(componentKey, fullAmount) ? "Paid" : "Pay"}
                </Button>
              </div>
            );
          })}
          <hr />
          <div className="flex justify-between font-semibold">
          </div>
          <div className="flex justify-between text-green-600">
            <span>Paid</span>
            <span>₹{feeStructure.paid}</span>
          </div>
          <div className="flex justify-between text-red-500 font-semibold">
            <span>Balance</span>
            <span>₹{feeStructure.balance}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center text-purple-700">
            <CalendarCheck2 className="w-5 h-5" /> Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {feePayments.length === 0 && <p>No past payments.</p>}
          {feePayments.map((p, index) => (
            <div
              key={index}
              className="flex justify-between border-b py-2 text-sm"
            >
              <div>
                ₹{p.amount}{" "}
                <Badge variant="outline" className="ml-2 capitalize">
                  {p.mode}
                </Badge>
                {p.paidFor?.tuition && (
                  <Badge className="ml-2" variant="secondary">
                    Tuition {p.term ? `- ${p.term}` : ""}
                  </Badge>
                )}
                {p.paidFor?.transport && (
                  <Badge className="ml-2" variant="secondary">
                    Transport
                  </Badge>
                )}
              </div>
              <div className="text-gray-500">
                {new Date(p.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
