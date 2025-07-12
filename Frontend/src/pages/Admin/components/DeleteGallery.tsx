import React, { useState } from "react";
import { toast } from "sonner";

interface DeleteGalleryImageProps {
  publicId: string;
  onDeleteSuccess: () => void;
}

const DeleteGalleryImage: React.FC<DeleteGalleryImageProps> = ({
  publicId,
  onDeleteSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      setLoading(true);
      const res = await fetch(
        `https://vidhyardhi.onrender.com/api/admin/gallery/delete?publicId=${encodeURIComponent(publicId)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete image");

      toast.success("Image deleted successfully!");
      onDeleteSuccess(); // Refresh gallery
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="mt-3 px-4 py-1 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
};

export default DeleteGalleryImage;
