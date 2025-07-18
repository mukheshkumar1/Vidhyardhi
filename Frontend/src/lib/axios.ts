import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://vidhyardhi.onrender.com",
});

// Automatically add Authorization token from localStorage
axiosInstance.interceptors.request.use((config) => {
  try {
    const storedUser = localStorage.getItem("auth-user");
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.error("Failed to attach token to request", err);
  }
  return config;
});


