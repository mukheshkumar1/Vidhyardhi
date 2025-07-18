import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/authContext";
import { toast } from "sonner";

interface LoginPayload {
  mobileNumber: string;
  password: string;
}

export const useStaffLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();

  async function login({ mobileNumber, password }: LoginPayload) {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("https://vidhyardhi.onrender.com/api/auth/login/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobileNumber, password }),
      });

      const status = response.status;

      // Check response failure
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          status === 401 || status === 403
            ? "Invalid credentials. Please check your mobile number and password."
            : errorData.message || "Only authorized staff can log in.";

        setError(message);
        toast.error(message);
        return;
      }

      // Parse response body
      const data = await response.json();

      if (!data.token || !data.name || data.role !== "staff") {
        setError("Unauthorized: Only staff members are allowed.");
        toast.error("Unauthorized access. Staff login only.");
        return;
      }

      const staffUser = {
        role: "staff",
        name: data.name,
        token: data.token,
        ...data,
      };

      setAuthUser(staffUser);
      localStorage.setItem("auth-user", JSON.stringify(staffUser));
      localStorage.setItem("staffId", data.user?._id ?? data._id ?? "");
      localStorage.setItem("token", data.token);

      toast.success("Login successful!");
      navigate("/staff/dashboard");

    } catch (err) {
      console.error("Login error:", err);
      const message = "Network error or server not reachable.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
};

