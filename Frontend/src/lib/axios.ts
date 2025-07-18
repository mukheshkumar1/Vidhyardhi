import axios from "axios";

// Create an instance
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://vidhyardhi.onrender.com",
  withCredentials: true, // Send cookies if needed (for sessions)
});

// Attach token from localStorage if present
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const storedUser = localStorage.getItem("auth-user");
      if (storedUser) {
        const { token } = JSON.parse(storedUser);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error("Failed to parse auth-user or attach token", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
