import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import Dropzone from "react-dropzone";
import { FaCamera, FaTimes } from "react-icons/fa";
import { toast } from "sonner";

interface StudentProfileImageProps {
  studentId: string;
  currentImage: string;
}

const StudentProfileImage: React.FC<StudentProfileImageProps> = ({ studentId, currentImage }) => {
  const editorRef = useRef<AvatarEditor>(null);
  const [image, setImage] = useState<File | null>(null);
  const [scale, setScale] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [showPreviewModal, setShowPreviewModal] = useState(false); // New state

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setImage(acceptedFiles[0]);
      setShowEditor(true);
    }
  };

  const getBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
    new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/jpeg");
    });

  const handleUpload = async () => {
    if (!editorRef.current) return;

    try {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const blob = await getBlob(canvas);
      if (!blob) throw new Error("Failed to get image blob");

      const formData = new FormData();
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
      formData.append("image", file);

      setUploading(true);

      const res = await fetch(`https://vidhyardhi.onrender.com/api/admin/students/${studentId}/update-profile-picture`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setPreview(data.imageUrl);
      setShowEditor(false);
      setImage(null);
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Upload error", error);
      toast.error("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-40 h-40 mx-auto">
      <img
        src={preview}
        alt="Profile"
        className="w-full h-full rounded-full object-cover border-4 border-white shadow cursor-pointer"
        onClick={() => setShowPreviewModal(true)}
      />
      <button
        onClick={() => setShowEditor(true)}
        className="absolute bottom-0 right-0 bg-black bg-opacity-60 rounded-full p-2 hover:scale-110 transition"
      >
        <FaCamera className="text-white text-lg" />
      </button>

      {/* Image Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="relative bg-white/20 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/30">

            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
            >
              <FaTimes className="text-xl" />
            </button>
            <img src={preview} alt="Preview"   
            className="w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] max-h-[80vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90vw] max-w-md text-center">
            {!image ? (
              <Dropzone onDrop={handleDrop} accept={{ "image/*": [] }}>
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-400 p-6 rounded-lg cursor-pointer"
                  >
                    <input {...getInputProps()} />
                    <p className="text-gray-500">Drag & drop or click to select an image</p>
                  </div>
                )}
              </Dropzone>
            ) : (
              <>
                <AvatarEditor
                  ref={editorRef}
                  image={image}
                  width={200}
                  height={200}
                  border={40}
                  borderRadius={125}
                  scale={scale}
                  className="mx-auto"
                />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full mt-4"
                />
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={() => {
                      setShowEditor(false);
                      setImage(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {uploading ? "Uploading..." : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfileImage;
