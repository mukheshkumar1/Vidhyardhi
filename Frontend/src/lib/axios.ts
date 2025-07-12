import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://vidhyardhi.onrender.com", // or your API URL
  withCredentials: true,
});

