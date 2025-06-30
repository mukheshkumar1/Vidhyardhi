import { useState, useRef } from "react";
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
import { toast } from "sonner"; // Toast notifications

const checkStrength = (password: string) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[\W]/.test(password)) score++;
  return score;
};

const StudentResetPassword = () => {
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Helper for setting ref
  const setRef = (index: number) => (el: HTMLInputElement | null) => {
    otpRefs.current[index] = el;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);

    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (!value && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      toast.error("Enter a valid 6-digit OTP.");
      return;
    }

    try {
      const res = await fetch("https://vidhyardhi.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phone, otp, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Password reset successful!");
        toast.success("Password reset successfully!");
        setTimeout(() => navigate("/login/student"), 2000);
      } else {
        setError(data.error || "Reset failed.");
        toast.error(data.error || "Password reset failed.");
      }
    } catch {
      setError("Something went wrong.");
      toast.error("Server error. Try again later.");
    }
  };

  const strength = checkStrength(newPassword);
  const strengthColors = ["bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#80cb2e] to-[#69306d] px-4">
      <Card className="w-full max-w-md bg-white/30 backdrop-blur-md shadow-xl text-white">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-yellow-400">Reset Password</CardTitle>
            <CardDescription className="text-white/70">
              Enter the OTP sent to your phone and set a new password.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-400 text-sm text-center">{success}</p>}

            <Input
              type="text"
              maxLength={10}
              placeholder="Registered Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="bg-white/10 border border-white/20 rounded-full"
            />

            <div className="flex justify-between gap-2 mt-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={setRef(index)}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-10 h-10 md:w-12 md:h-12 text-center text-lg md:text-xl bg-white/20 text-white border border-white/30 rounded-md outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
              ))}
            </div>

            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="bg-white/10 border border-white/20 rounded-full mt-3"
            />

            <div className="flex items-center space-x-2 mt-1">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-2 transition-all ${strengthColors[strength - 1] ?? ""}`}
                  style={{ width: `${(strength / 4) * 100}%` }}
                ></div>
              </div>
              {newPassword && (
                <span className="text-sm text-white/70">
                  {strengthLabels[strength - 1] ?? "Very Weak"}
                </span>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 mt-4">
            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
              Reset Password
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => navigate("/login/student")}
              className="text-white/70 text-sm"
            >
              ← Back to Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default StudentResetPassword;
