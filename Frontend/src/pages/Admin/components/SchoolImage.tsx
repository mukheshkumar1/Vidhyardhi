/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

interface SchoolImage {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
}

const ManageSchoolImages: React.FC = () => {
  const [images, setImages] = useState<SchoolImage[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch images
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("http://localhost:5000/api/admin/school-images", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch images");
      const data = await res.json();
      setImages(data);
    } catch (err: any) {
      setError(err.message || "Error fetching images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle image file select
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Upload image form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !imageFile) {
      setError("Please provide both a title and an image.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create form data
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", imageFile);

      const res = await fetch("http://localhost:5000/api/admin/school-images/add", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to upload image");
      }

      // Refresh image list
      await fetchImages();

      // Reset form
      setTitle("");
      setDescription("");
      setImageFile(null);
    } catch (err: any) {
      setError(err.message || "Upload error");
    } finally {
      setLoading(false);
    }
  };

  // Delete image handler
  const handleDelete = async (_id: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`http://localhost:5000/api/admin/school-images/${_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to delete image");
      }

      // Refresh image list
      await fetchImages();
    } catch (err: any) {
      setError(err.message || "Delete error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Manage School Images
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        mb={4}
        sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}
      >
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={2}
        />
        <Button variant="outlined" component="label">
          {imageFile ? imageFile.name : "Select Image"}
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </Button>

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Uploading..." : "Upload Image"}
        </Button>
      </Box>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {loading && !images.length && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress color="inherit" />
        </Box>
      )}

      {/* Image list container */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
        }}
      >
        {images.map(({ _id, title, description, imageUrl }) => (
          <Card
            key={_id}
            sx={{
              width: { xs: "100%", sm: 300, md: 320 },
              position: "relative",
              flexShrink: 0,
            }}
          >
            <CardMedia
              component="img"
              height="180"
              image={imageUrl}
              alt={title}
              sx={{ objectFit: "cover" }}
            />
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {title}
              </Typography>
              {description && (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              )}
            </CardContent>
            <Button
              variant="outlined"
              color="error"
              size="small"
              sx={{ position: "absolute", top: 8, right: 8 }}
              onClick={() => handleDelete(_id)}
              disabled={loading}
            >
              Delete
            </Button>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ManageSchoolImages;
