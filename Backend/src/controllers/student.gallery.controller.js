import Student from "../models/student.model.js";
import fs from "fs";
import path from "path";
import { uploadImageToDrive } from "../utils/googledriveimage.js";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), "apikey.json"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });


// 📤 UPLOAD MULTIPLE IMAGES
export const uploadStudentGalleryImages = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!req.files || !req.files.images) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const folderId = process.env.GOOGLE_DRIVE_GALLERY_FOLDER_ID;
    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

    const uploadedImages = [];

    for (const file of files) {
      const tempPath = path.join("uploads", `${Date.now()}_${file.name}`);
      await file.mv(tempPath);

      const { imageUrl, thumbnail } = await uploadImageToDrive(tempPath, file.name, folderId);

      fs.unlinkSync(tempPath); // clean up

      const newImage = {
        imageUrl,
        thumbnail: thumbnail?.replace("=s220", "=s300"),
        uploadedAt: new Date(),
      };

      student.gallery.push(newImage);
      uploadedImages.push(newImage);
    }

    await student.save();
    res.status(200).json({ message: "Images uploaded", gallery: uploadedImages });
  } catch (err) {
    console.error("Gallery Upload Error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};


// 🖼️ FETCH GALLERY
export const getStudentGallery = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.status(200).json({ gallery: student.gallery });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch gallery", error: err.message });
  }
};


// ❌ DELETE MULTIPLE IMAGES
export const deleteStudentGalleryImages = async (req, res) => {
  try {
    const { imageUrls } = req.body;
    const { studentId } = req.params; // ✅ Get from URL

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res
        .status(400)
        .json({ message: "imageUrls should be a non-empty array" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    for (const imageUrl of imageUrls) {
      const fileIdMatch = imageUrl.match(/id=([^&]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        const fileId = fileIdMatch[1];
        try {
          await drive.files.delete({ fileId });
        } catch (e) {
          console.warn(`Failed to delete file ${fileId} from Drive`, e.message);
        }
      }
    }

    // Remove matching image URLs from DB
    student.gallery = student.gallery.filter(
      (img) => !imageUrls.includes(img.imageUrl)
    );
    await student.save();

    res.status(200).json({ message: "Selected images deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Failed to delete images", error: err.message });
  }
};
