import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Camera } from "lucide-react";

interface Admin {
  _id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  salary: string;
  role: string;
  profilePicture: {
    imageUrl: string;
  };
  createdAt: string;
}

const AdminProfile: React.FC = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    gender: "",
    salary: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    fetch("https://vidhyardhi.onrender.com/api/admin/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setAdmin(data);
        setForm({
          fullName: data.fullName,
          email: data.email,
          mobileNumber: data.mobileNumber,
          gender: data.gender,
          salary: data.salary,
        });
      })
      .catch(() => toast.error("Failed to fetch profile"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async () => {
    const res = await fetch("https://vidhyardhi.onrender.com/api/admin/admin/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok) {
      setAdmin(data.admin);
      toast.success("Profile updated successfully");
      setEditMode(false);
    } else {
      toast.error(data.error || "Failed to update profile");
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return toast.warning("No image selected");

    const formData = new FormData();
    formData.append("image", selectedImage);

    const res = await fetch("https://vidhyardhi.onrender.com/api/admin/admin/image", {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) {
      setAdmin((prev) => prev && { ...prev, profilePicture: { imageUrl: data.imageUrl } });
      toast.success("Profile image updated");
    } else {
      toast.error(data.error || "Image upload failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 mt-6">
      <div className="relative bg-transparent h-48 rounded-xl">
        <div className="absolute -bottom-20 sm:-bottom-16 left-4 sm:left-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative group">
            <img
              src={admin?.profilePicture?.imageUrl || "/default-avatar.png"}
              alt="Admin"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover shadow-lg"
            />
            <label
              htmlFor="imageUpload"
              className="absolute bottom-1 right-1 bg-black/60 p-1 rounded-full text-white cursor-pointer hover:scale-110 transition"
            >
              <Camera size={18} />
            </label>
            <input
              type="file"
              id="imageUpload"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedImage(file);
                  handleImageUpload();
                }
              }}
            />
          </div>

          <div className="text-white mt-2 sm:mt-10">
            <h2 className="text-2xl sm:text-3xl font-bold">{admin?.fullName}</h2>
            <p className="text-sm sm:text-base">{admin?.email}</p>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">{admin?.role}</span>
          </div>
        </div>
      </div>

      <div className="mt-32 rounded-xl shadow-lg p-6 bg-white/10 backdrop-blur-md border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Profile Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "Full Name", name: "fullName" },
            { label: "Email", name: "email" },
            { label: "Phone", name: "mobileNumber" },
            { label: "Salary", name: "salary" },
          ].map((field) => (
            <div key={field.name}>
              <Label className="text-white text-base">{field.label}</Label>
              <Input
                name={field.name}
                value={(form as any)[field.name]}
                onChange={handleChange}
                disabled={!editMode}
                className={`transition-all duration-300 text-lg ${
                  editMode
                    ? "bg-white text-black border border-gray-300"
                    : "bg-transparent text-white border-none cursor-default"
                }`}
              />
            </div>
          ))}

          <div>
            <Label className="text-white text-base">Gender</Label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={!editMode}
              className={`w-full p-2 rounded-md transition-all duration-300 text-lg ${
                editMode
                  ? "bg-white text-black border border-gray-300"
                  : "bg-transparent text-white border-none cursor-default"
              }`}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <Label className="text-white text-base">Joined On</Label>
            <Input
              value={new Date(admin?.createdAt || "").toLocaleDateString()}
              disabled
              className="bg-transparent text-white border-none cursor-default text-lg"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleProfileUpdate}>Save Changes</Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
