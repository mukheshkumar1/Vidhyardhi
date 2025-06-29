import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { useAuthContext } from "@/context/authContext";
import { toast } from "sonner";

interface LoginPayload {
  mobileNumber: string;
  password: string;
}

export const useStudentLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();

  async function login({ mobileNumber, password }: LoginPayload) {
    setError(null);
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login/student", {
        mobileNumber,
        password,
      });

      const data = res.data;
      console.log("Login response:", data); // Debug response shape

      // Assuming your API returns student info inside `data.student`
     

   

      setAuthUser({
        role: "student",
        name: data.name,
        token: data.token,
        ...data,
      });

      toast.success("Login successful!");
      navigate("/student/dashboard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const status = err.response?.status;
      const message =
        status === 401 || status === 403
          ? "Invalid credentials. Please check your mobile number and password."
          : err.response?.data?.message || "Login failed. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
};
