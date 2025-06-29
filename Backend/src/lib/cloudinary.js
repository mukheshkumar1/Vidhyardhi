// import cloudinary from 'cloudinary';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
// import multer from 'multer';
// import dotenv from "dotenv";


// dotenv.config();
// // Configure Cloudinary
// cloudinary.v2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Define the Cloudinary storage for Multer
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary.v2,
//   params: {
//     folder: 'profile-pics', // Folder in Cloudinary to store profile pictures
//     allowed_formats: ['jpeg', 'png', 'jpg'], // Allowed image formats
//     public_id: (req, file) => `${Date.now()}-${file.originalname}`, // File name
//   },
// });

// // Multer upload middleware with Cloudinary storage
// const upload = multer({ storage: storage });

// export { upload };

import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up storage configuration for multer using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'profile-pics',
    allowed_formats: ['jpeg', 'png', 'jpg'],
    public_id: (_req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage });

export { upload, cloudinary };
