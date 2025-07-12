/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, Download } from "lucide-react";
import { motion } from "framer-motion";

interface GalleryItem {
  imageUrl: string;
  thumbnail: string;
  uploadedAt: string;
}

interface Props {
  studentId: string;
}

export default function StudentGalleryView({ studentId }: Props) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [imageBlobs, setImageBlobs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    gallery.forEach((img) => {
      const fileId = extractDriveId(img.imageUrl);
      if (fileId && !imageBlobs[img.imageUrl]) {
        fetchImageBlob(fileId, img.imageUrl);
      }
    });
  }, [gallery]);

  const fetchGallery = async () => {
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/student/${studentId}/gallery`);
      const data = await res.json();
      setGallery(data.gallery || []);
    } catch {
      toast.error("Failed to load gallery");
    }
  };

  const extractDriveId = (url: string): string | null => {
    const match = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const fetchImageBlob = async (fileId: string, key: string) => {
    try {
      const res = await fetch(`https://vidhyardhi.onrender.com/api/proxy/proxy-drive-image?fileId=${fileId}`);
      const blob = await res.blob();
      const objectURL = URL.createObjectURL(blob);
      setImageBlobs((prev) => ({ ...prev, [key]: objectURL }));
    } catch {
      toast.error("Image load failed");
    }
  };

  const getDriveViewLink = (img: GalleryItem): string => {
    const fileId = extractDriveId(img.imageUrl);
    return fileId
      ? `https://drive.google.com/file/d/${fileId}/view`
      : img.imageUrl;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-700">
        <ImageIcon className="text-purple-500" />
        My Gallery
      </h2>

      {gallery.length === 0 ? (
        <p className="text-sm text-gray-500">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {gallery.map((img, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="relative group rounded-xl overflow-hidden shadow bg-white"
            >
              <a
                href={getDriveViewLink(img)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={imageBlobs[img.imageUrl] || ""}
                  alt={`Uploaded at ${new Date(img.uploadedAt).toLocaleString()}`}
                  className="w-full h-36 object-cover rounded-xl bg-gray-100"
                />
              </a>

              <a
                href={img.imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-purple-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                title="Download Image"
              >
                <Download className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
