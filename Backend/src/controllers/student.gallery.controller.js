import Student from "../models/student.model.js";
import fs from "fs";
import path from "path";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// 📤 UPLOAD MULTIPLE IMAGES TO CLOUDINARY
export const uploadStudentGalleryImages = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!req.files || !req.files.images) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const uploadedImages = [];

    for (const file of files) {
      const tempPath = path.join("uploads", `${Date.now()}_${file.name}`);
      await file.mv(tempPath);

      const result = await uploadToCloudinary(tempPath, `student_gallery/${studentId}`);
      fs.unlinkSync(tempPath); // delete local file

      const newImage = {
        imageUrl: result.secure_url,
        thumbnail: result.secure_url.replace("/upload/", "/upload/w_300,c_scale/"),
        uploadedAt: new Date(),
        publicId: result.public_id,
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

// ❌ DELETE MULTIPLE IMAGES FROM CLOUDINARY
export const deleteStudentGalleryImages = async (req, res) => {
  try {
    const { imageUrls } = req.body;
    const { studentId } = req.params;

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ message: "imageUrls should be a non-empty array" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const imagesToDelete = student.gallery.filter(img => imageUrls.includes(img.imageUrl));

    for (const img of imagesToDelete) {
      try {
        if (!img.publicId) {
          console.warn(`No publicId for image: ${img.imageUrl}`);
          continue;
        }

        await deleteFromCloudinary(img.publicId);
      } catch (e) {
        console.warn(`Failed to delete image ${img.imageUrl}:`, e.message);
      }
    }

    // Filter out deleted images
    student.gallery = student.gallery.filter(img => !imageUrls.includes(img.imageUrl));
    await student.save();

    res.status(200).json({ message: "Selected images deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: "Failed to delete images", error: err.message });
  }
};

// 🔎 Utility to extract public_id from URL if missing
function getPublicIdFromUrl(url) {
  const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return matches && matches[1] ? matches[1] : null;
}
