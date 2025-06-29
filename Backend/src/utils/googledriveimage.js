// src/utils/uploadImageToDrive.js
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import  googleauth from './auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KEYFILEPATH = path.join(__dirname, '../../apikey.json');

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

export const uploadImageToDrive = async (filePath, fileName, folderId) => {
  const drive = google.drive({ version: 'v3', auth });

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
  };
};