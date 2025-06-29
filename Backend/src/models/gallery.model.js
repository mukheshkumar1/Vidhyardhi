import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  name: { type: String, required: false },
  description: { type: String, required: false },
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  
} ,
{ timestamps: true }
);


export default mongoose.model("Gallery", gallerySchema);
