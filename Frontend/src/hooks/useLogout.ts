import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/authContext";
import toast from "react-hot-toast";

const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();
  const navigate = useNavigate();

  const logout = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://vidhyardhi.onrender.com/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // include cookies if used in session
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      localStorage.removeItem("auth-user"); // or your localStorage key
      setAuthUser(null);
      toast.success("Logged out successfully");
      navigate("/"); // Redirect to login page (adjust as needed)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return { loading, logout };
};

export default useLogout;
