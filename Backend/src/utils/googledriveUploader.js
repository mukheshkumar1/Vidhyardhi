// src/utils/uploadPDFToDrive.js
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mime from 'mime-types';
import { fileURLToPath } from 'url';
import googleauth from './auth.js'; // ✅ Your OAuth2-based auth

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadPDFToDrive = async (filePath, fileName, folderId) => {
  try {
    const drive = google.drive({ version: 'v3', auth: googleauth });

    const mimeType = mime.lookup(fileName) || 'application/pdf';

    if (!mimeType.startsWith('application/pdf')) {
      throw new Error('Only PDF files are allowed');
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

    // Make file publicly readable
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const result = await drive.files.get({
      fileId,
      fields: 'webViewLink',
    });

    return {
      fileId,
      webViewLink: result.data.webViewLink,
      directDownload: `https://drive.google.com/uc?id=${fileId}&export=download`,
    };
  } catch (err) {
    console.error('Drive PDF Upload Error:', err.message);
    throw new Error('Failed to upload PDF to Google Drive');
  }
};
