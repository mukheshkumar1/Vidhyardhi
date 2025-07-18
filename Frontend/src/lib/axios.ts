import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://vidhyardhi.onrender.com",
  withCredentials: true, // Only needed for cookie-based sessions
});

// Attach Bearer token from localStorage to all requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

