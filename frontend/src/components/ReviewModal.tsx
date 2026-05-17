import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Rating, TextField, IconButton,
  CircularProgress, Alert
} from "@mui/material";
import { PhotoCamera, Close } from "@mui/icons-material";
import axios from "axios";
import { useI18n } from "../context/I18nContext";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  reservationId: string;
  targetId: string;
  role: "TENANT" | "OWNER";
  resourceName: string;
  onSuccess?: () => void;
}

export default function ReviewModal({
  open, onClose, reservationId, targetId, role, resourceName, onSuccess
}: ReviewModalProps) {
  const { t } = useI18n();
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 5) {
        setError("You can only upload up to 5 images.");
        return;
      }
      setImages((prev) => [...prev, ...selectedFiles]);
      setError(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please provide a rating.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("reservation_id", reservationId);
      formData.append("target_id", targetId);
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      formData.append("role", role);

      images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.post("http://localhost:3000/reviews", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === 201) {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setRating(0);
        setComment("");
        setImages([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to submit review. You might have already reviewed this reservation.");
    } finally {
      setLoading(false);
    }
  };

  const title = role === "TENANT" 
    ? `Review your experience with ${resourceName}` 
    : `Review the tenant for ${resourceName}`;
    
  const subtitle = role === "TENANT"
    ? "Rate the resource and the owner. Upload photos of the initial state if you'd like."
    : "Rate the tenant. Upload photos documenting the return status of your resource.";

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {subtitle}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Typography component="legend">{t("review.rating") || "Rating"}</Typography>
          <Rating
            name="reservation-rating"
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
          />
        </Box>

        <TextField
          label={t("review.comments") || "Comments (Optional)"}
          multiline
          rows={3}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box mb={2}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="review-image-upload"
            multiple
            type="file"
            onChange={handleImageChange}
            disabled={loading}
          />
          <label htmlFor="review-image-upload">
            <Button variant="outlined" component="span" startIcon={<PhotoCamera />} disabled={loading}>
              Upload Photos ({images.length}/5)
            </Button>
          </label>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          {images.map((img, index) => (
            <Box key={index} position="relative" width={60} height={60} border="1px solid #ccc" borderRadius={1}>
              <img
                src={URL.createObjectURL(img)}
                alt={`upload-${index}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }}
              />
              <IconButton
                size="small"
                sx={{ position: "absolute", top: -8, right: -8, bgcolor: "background.paper" }}
                onClick={() => handleRemoveImage(index)}
                disabled={loading}
              >
                <Close fontSize="small" color="error" />
              </IconButton>
            </Box>
          ))}
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !rating} variant="contained" color="primary">
          {loading ? <CircularProgress size={24} /> : "Submit Review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
