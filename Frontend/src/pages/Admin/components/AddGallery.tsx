import React, { useEffect, useState } from "react";
import DeleteGalleryImage from "./DeleteGallery";
import { toast } from "sonner";

interface GalleryImage {
  name: string;
  description: string;
  imageUrl: string;
  publicId: string;
}

interface Props {
  isAdmin: boolean;
}

const GalleryAdmin: React.FC<Props> = ({ isAdmin }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setFetching(true);
      const res = await fetch("http://localhost:5000/api/admin/gallery");
      const data = await res.json();

      if (Array.isArray(data)) {
        setImages(data);
      } else {
        console.error("Unexpected response format:", data);
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setNames([]);
    setDescriptions([]);
  };

  const handleNameChange = (index: number, value: string) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const handleDescChange = (index: number, value: string) => {
    const updated = [...descriptions];
    updated[index] = value;
    setDescriptions(updated);
  };

  const handleUpload = async () => {
    if (!files) return toast.error("No files selected");
    const formData = new FormData();

    Array.from(files).forEach((file, i) => {
      formData.append("images", file);
      formData.append("names", names[i] || "");
      formData.append("descriptions", descriptions[i] || "");
    });

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/gallery/add", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Upload failed");

      await fetchGallery();
      toast.success("Images uploaded successfully!");
      setFiles(null);
    } catch (error) {
      console.error("Error uploading:", error);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-red-500 text-xl">
        You do not have admin access.
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-700 text-white">
      <h2 className="text-3xl font-bold mb-6">🖼️ Gallery Admin Panel</h2>

      {/* Upload Section */}
      <div className="mb-10 bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Add Images</h3>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="mb-4 block text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 hover:file:bg-green-600"
        />

        {files &&
          Array.from(files).map((file, i) => (
            <div key={i} className="mb-4">
              <p className="text-sm text-gray-300 mb-1">📁 {file.name}</p>
              <input
                type="text"
                placeholder="Image Name"
                value={names[i] || ""}
                onChange={(e) => handleNameChange(i, e.target.value)}
                className="p-2 mr-2 mb-2 bg-gray-900 border border-gray-600 rounded w-full sm:w-1/3"
              />
              <input
                type="text"
                placeholder="Description"
                value={descriptions[i] || ""}
                onChange={(e) => handleDescChange(i, e.target.value)}
                className="p-2 bg-gray-900 border border-gray-600 rounded w-full sm:w-2/3"
              />
            </div>
          ))}

        {files && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Images"}
          </button>
        )}
      </div>

      {/* Gallery Display */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">Gallery Images</h3>
        {fetching ? (
          <p>Loading gallery...</p>
        ) : images.length === 0 ? (
          <p className="text-gray-400">No images available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center"
              >
                <img
                  src={img.imageUrl}
                  alt={img.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h4 className="font-bold text-lg">{img.name}</h4>
                <p className="text-sm text-gray-400">{img.description}</p>
                <DeleteGalleryImage
                  publicId={img.publicId}
                  onDeleteSuccess={fetchGallery}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryAdmin;
