import mongoose from 'mongoose';

const schoolImageSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g. "Classes", "Environment"
  description: { type: String },
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true }, // Cloudinary public_id for deletion
  createdAt: { type: Date, default: Date.now },
});

const SchoolImage = mongoose.model('SchoolImage', schoolImageSchema);

export default SchoolImage;
