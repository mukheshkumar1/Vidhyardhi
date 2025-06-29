import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import googleauth from "./auth.js"

dotenv.config();

// Recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to service account key
const KEYFILEPATH = path.join(__dirname, '../../apikey.json');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

export const uploadToDrive = async (filePath, fileName, folderId) => {
  const driveService = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: 'application/pdf',
    body: fs.createReadStream(filePath),
  };

  const file = await driveService.files.create({
    resource: fileMetadata,
    media,
    fields: 'id',
  });

  const fileId = file.data.id;

  // Make the file public
  await driveService.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // Get public URL
  const result = await driveService.files.get({
    fileId,
    fields: 'webViewLink',
  });

  return result.data.webViewLink;
};
