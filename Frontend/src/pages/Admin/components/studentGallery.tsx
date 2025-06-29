/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UploadCloud,
  GalleryHorizontalEnd,
  LoaderCircle,
  X,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Props {
  studentId: string;
  studentName: string;
  open: boolean;
  onClose: () => void;
}

interface GalleryItem {
  imageUrl: string;
  thumbnail: string;
  uploadedAt: string;
}

export default function StudentGalleryUploader({
  studentId,
  studentName,
  open,
  onClose,
}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageBlobs, setImageBlobs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) fetchGallery();
  }, [open]);

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
      const res = await fetch(
        `http://localhost:5000/api/student/${studentId}/gallery`
      );
      const data = await res.json();
      setGallery(data.gallery || []);
      setSelectedUrls([]);
    } catch (err) {
      toast.error("Failed to load gallery");
    }
  };

  const extractDriveId = (url: string): string | null => {
    const match = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const fetchImageBlob = async (fileId: string, key: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/proxy/proxy-drive-image?fileId=${fileId}`
      );
      const blob = await res.blob();
      const objectURL = URL.createObjectURL(blob);
      setImageBlobs((prev) => ({ ...prev, [key]: objectURL }));
    } catch {
      toast.error("Image load failed");
      setImageBlobs((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  const handleUpload = async () => {
    if (files.length === 0) return toast.warning("Select at least one image");

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/students/${studentId}/gallery`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Images uploaded!");
        setFiles([]);
        fetchGallery();
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch {
      toast.error("Server error during upload");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedUrls.length === 0)
      return toast.warning("Select at least one image to delete");

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/student/gallery/${studentId}/delete`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            imageUrls: selectedUrls,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("Selected images deleted!");
        fetchGallery();
      } else {
        toast.error(data.message || "Deletion failed");
      }
    } catch {
      toast.error("Server error during deletion");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (url: string) => {
    setSelectedUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-5xl rounded-2xl shadow-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-700 flex items-center gap-2">
            <GalleryHorizontalEnd className="text-purple-500" />
            Gallery for{" "}
            <span className="underline text-purple-800">{studentName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Box */}
          <div className="bg-gray-100 p-4 rounded-xl border-2 border-dashed border-purple-300">
            <label className="flex flex-col items-center cursor-pointer">
              <UploadCloud className="w-10 h-10 text-purple-500 mb-2" />
              <p className="text-sm font-medium">
                Click or drag to upload images
              </p>
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Preview Files Before Upload */}
          {files.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {files.map((file, i) => (
                <motion.div
                  key={i}
                  className="w-24 h-24 relative rounded-md overflow-hidden border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    className="object-cover w-full h-full"
                    alt={file.name}
                  />
                  <button
                    className="absolute top-0 right-0 bg-white bg-opacity-80 p-1 rounded-bl-md"
                    onClick={() =>
                      setFiles(files.filter((_, idx) => idx !== i))
                    }
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={handleUpload}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="animate-spin mr-2" />
              ) : (
                <UploadCloud className="mr-2" />
              )}
              Upload
            </Button>

            {selectedUrls.length > 0 && (
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <LoaderCircle className="animate-spin mr-2" />
                ) : (
                  <Trash2 className="mr-2" />
                )}
                Delete ({selectedUrls.length})
              </Button>
            )}
          </div>

          {/* Existing Gallery */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-purple-600">
              Uploaded Gallery
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.length === 0 && (
                <p className="text-sm text-gray-500">
                  No images uploaded yet.
                </p>
              )}
              {gallery.map((img, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className={`relative rounded-lg overflow-hidden shadow border-2 ${
                    selectedUrls.includes(img.imageUrl)
                      ? "border-red-500"
                      : "border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUrls.includes(img.imageUrl)}
                    onChange={() => toggleSelect(img.imageUrl)}
                    className="absolute top-2 left-2 z-10 w-4 h-4"
                  />
                  <a
                    href={img.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={
                        imageBlobs[img.imageUrl] ||
                        img.thumbnail ||
                        img.imageUrl
                      }
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = img.imageUrl;
                      }}
                      alt={`Image uploaded at ${new Date(
                        img.uploadedAt
                      ).toLocaleString()}`}
                      className="w-full h-36 object-cover bg-black rounded"
                    />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
