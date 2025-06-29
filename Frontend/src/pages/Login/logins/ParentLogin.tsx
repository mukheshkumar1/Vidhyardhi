import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudentLogin } from "@/hooks/useStudentLogin";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const StudentLogin = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const { login, loading, error } = useStudentLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      setFormError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!password.trim()) {
      setFormError("Password cannot be empty");
      return;
    }

    login({ mobileNumber, password });
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-[#3a86ff] to-[#8338ec] px-4 overflow-hidden">
      {/* Decorative Balloons */}
      <img
        src="../../src/assets/images/balloon.png"
        alt="Balloons Top"
        className="absolute top-0 left-0 w-24 sm:w-32 animate-float"
      />
      <img
        src="../../src/assets/images/balloon.png"
        alt="Balloons Bottom"
        className="absolute bottom-0 right-0 w-20 sm:w-28 animate-float delay-1000"
      />

      {/* Student cartoon */}
      <img
        src="../../src/assets/images/student.png"
        alt="Student Cartoon"
        className="hidden md:block absolute -left-20 bottom-6 w-24 sm:w-28 lg:w-32 animate-float-slow"
      />

      <Card className="relative w-full max-w-md bg-white bg-opacity-40 backdrop-blur-xl shadow-xl text-white p-4 sm:p-6">
        <img
          src="../../src/assets/images/cap.png"
          alt="Graduation Cap"
          className="absolute top-2 right-2 w-10 sm:w-12 drop-shadow-lg"
        />

        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-col items-center space-y-4">
            <img
              src="../../src/assets/images/logo5.jpg"
              alt="School Logo"
              className="w-32 sm:w-40 shadow-md bg-white p-1"
            />
            <CardTitle className="text-2xl text-center text-blue-200 dark:text-blue-300">
              Student Login
            </CardTitle>
            <CardDescription className="text-center text-white/70">
              Access your student portal
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {(formError || error) && (
              <p className="text-sm text-red-500 text-center">
                {formError || error}
              </p>
            )}

            <Input
              type="text"
              placeholder="Mobile Number"
              value={mobileNumber}
              pattern="[6-9]{1}[0-9]{9}"
              maxLength={10}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full shadow-xl"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full shadow-xl pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-white/70 hover:text-white"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgotpasswordstudent")}
                className="text-sm text-blue-100 hover:text-blue-300 underline"
              >
                Forgot Password?
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 mt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-xs text-white/70 text-center">
              Student credentials required for access.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default StudentLogin;
