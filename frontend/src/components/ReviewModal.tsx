import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { PhotoCamera, Close } from "@mui/icons-material";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  reservationId: string;
  role: "OWNER" | "TENANT"; // Determine if the current user is evaluating as the owner or the tenant
  onSuccess: () => void;
}

export default function ReviewModal({ open, onClose, reservationId, role, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeholder = role === "OWNER" 
    ? "Describe el estado de devolución del producto..." 
    : "Describe cómo recibiste y utilizaste el producto...";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    if (!rating || rating === 0) {
      setError("Por favor, proporciona una calificación (estrellas).");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("reservationId", reservationId);
    formData.append("rating", rating.toString());
    formData.append("comment", comment);
    
    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      const res = await fetch("http://localhost:3000/reviews", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setRating(0);
        setComment("");
        setImages([]);
      } else {
        const data = await res.json();
        setError(data.error || "Ocurrió un error al enviar la reseña.");
      }
    } catch (err) {
      setError("Error de red al intentar enviar la reseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>
        {role === "OWNER" ? "Evaluar al Arrendatario" : "Evaluar el Recurso y Arrendador"}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          <Box>
            <Typography component="legend" fontWeight={700} gutterBottom>
              Calificación General
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
            />
          </Box>

          <TextField
            label="Comentario"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            placeholder={placeholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Box>
            <Typography variant="body2" fontWeight={700} gutterBottom>
              Adjuntar Evidencia (Fotos)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
            >
              Seleccionar Imágenes
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            
            {images.length > 0 && (
              <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {images.map((img, idx) => (
                  <Box key={idx} sx={{ position: "relative" }}>
                    <img
                      src={URL.createObjectURL(img)}
                      alt="preview"
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", top: -8, right: -8, bgcolor: "rgba(0,0,0,0.6)", color: "white" }}
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          variant="contained" 
          color="primary"
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar Reseña"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
