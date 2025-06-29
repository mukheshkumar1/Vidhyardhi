// utils/razorpayConfig.js
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const razorpayInstance = razorpay;
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID; // For frontend
