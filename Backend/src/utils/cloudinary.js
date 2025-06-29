import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folder = 'default_folder') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,  // folder name passed as argument
    });
    return result;
  } catch (error) {
    console.error("Error in uploadToCloudinary", error);
    throw new Error("Error uploading to cloudinary");
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error in deleteFromCloudinary", error);
    throw new Error("Error deleting from cloudinary");
  }
};
