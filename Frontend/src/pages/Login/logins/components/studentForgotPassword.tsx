import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const StudentForgotPassword = () => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const isValid = /^[6-9]\d{9}$/.test(phone);
    if (!isValid) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    try {
      const res = await fetch("https://vidhyardhi.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("OTP sent to registered email.");
        setTimeout(() => {
          navigate("/resetpasswordstudent", { state: { phone } });
        }, 1000);
      } else {
        setError(data.error || "Failed to send OTP.");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#80cb2e] to-[#69306d] px-4">
      <Card className="w-full max-w-md bg-white/30 backdrop-blur-md shadow-xl text-white">
        <form onSubmit={handleSendOtp}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-yellow-400">Forgot Password</CardTitle>
            <CardDescription className="text-white/70">
              Enter your mobile number to receive an OTP
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-400 text-sm text-center">{success}</p>}

            <Input
              type="text"
              placeholder="Mobile Number"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-full"
              required
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
              Send OTP
            </Button>
            <Button
              variant="link"
              className="text-white/80 text-sm"
              onClick={() => navigate("/login/student")}
            >
              ← Back to Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default StudentForgotPassword;
