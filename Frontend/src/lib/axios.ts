import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://vidhyardhi.onrender.com/api", // or your API URL
  withCredentials: true,
});

