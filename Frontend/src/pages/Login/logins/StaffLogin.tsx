import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStaffLogin } from "@/hooks/useStaffLogin";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Link } from "react-router-dom"; // ✅ Import Link

const StaffLogin = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const { login, loading, error } = useStaffLogin();

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#80cb2e] to-[#69306d] px-4">
      <Card className="w-full max-w-md bg-white bg-opacity-40 backdrop-blur-xl shadow-xl text-white">
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-col items-center space-y-4">
            <img
              src="../../src/assets/images/logo5.jpg"
              alt="School Logo"
              className="w-40 shadow-md bg-white p-1"
            />
            <CardTitle className="text-2xl text-center text-yellow-600 dark:text-yellow-400">
              Staff Login
            </CardTitle>
            <CardDescription className="text-center text-white/70">
              Enter your staff credentials to continue
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

            {/* ✅ Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgotpassword"
                className="text-sm text-yellow-300 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-xs text-white/70 text-center">
              Staff access only. Unauthorized use is prohibited.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default StaffLogin;
