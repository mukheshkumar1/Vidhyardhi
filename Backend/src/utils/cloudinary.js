import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// ✅ Store separate configs
const config1 = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

const config2 = {
  cloud_name: process.env.CLOUDINARY_CLOUD1_NAME,
  api_key: process.env.CLOUDINARY_API1_KEY,
  api_secret: process.env.CLOUDINARY_API1_SECRET,
};

// ✅ Switch to config1 and upload image
export const uploadToCloudinary = async (filePath, folder = 'default_folder') => {
  try {
    cloudinary.config(config1); // switch to account 1
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
    });
    return result;
  } catch (error) {
    console.error('Image Upload Error:', error);
    throw new Error('Failed to upload image');
  }
};

// ✅ Switch to config2 and upload PDF
export const uploadPDFToCloudinary = async (filePath, folder = 'homework_submissions') => {
  try {
    cloudinary.config(config2); // switch to account 2
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      access_mode: 'public',
      folder,
      format: 'pdf',
      use_filename: true,
      unique_filename: false,
    });
    return result;
  } catch (error) {
    console.error('PDF Upload Error:', error);
    throw new Error('Failed to upload PDF');
  }
};

// ✅ Delete image from primary account
export const deleteFromCloudinary = async (publicId) => {
  try {
    cloudinary.config(config1); // switch to account 1
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Delete Image Error:', error);
    throw new Error('Failed to delete image');
  }
};

// ✅ Delete PDF from secondary account
export const deletePDFfromCloudinary = async (publicId) => {
  try {
    cloudinary.config(config2); // switch to account 2
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
    });
    return result;
  } catch (error) {
    console.error('Delete PDF Error:', error);
    throw new Error('Failed to delete PDF');
  }
};
