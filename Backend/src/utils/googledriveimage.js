// src/utils/uploadImageToDrive.js
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import googleauth from './auth.js'; // ✅ uses your auth.js

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImageToDrive = async (filePath, fileName, folderId) => {
  try {
    const drive = google.drive({ version: 'v3', auth: googleauth });

    const mimeType = mime.lookup(fileName);
    if (!mimeType || !mimeType.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType,
      body: fs.createReadStream(filePath),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
    });

    const fileId = file.data.id;

    // Make it publicly viewable
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      imageUrl: `https://drive.google.com/uc?id=${fileId}`,
      thumbnail: `https://lh3.googleusercontent.com/d/${fileId}=s800`,
      fileId,
    };
  } catch (err) {
    console.error('Drive Upload Error:', err);
    throw new Error('Failed to upload image to Drive');
  }
};
