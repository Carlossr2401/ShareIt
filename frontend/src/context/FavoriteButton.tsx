import React, { useState } from "react";
import { IconButton, CircularProgress } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

interface FavoriteButtonProps {
  resourceId: string;
  initialIsFavorite?: boolean;
}

const FavoriteButton = ({ resourceId, initialIsFavorite = false }: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el click active otros eventos del padre
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/resources/${resourceId}/favorite`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton
      onClick={handleToggle}
      disabled={loading}
      sx={{
        color: isFavorite ? "error.main" : "text.secondary",
        transition: "all 0.2s ease-in-out",
        "&:hover": { 
          transform: "scale(1.2)",
          color: isFavorite ? "error.dark" : "error.light"
        }
      }}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : (isFavorite ? <Favorite /> : <FavoriteBorder />)}
    </IconButton>
  );
};

export default FavoriteButton;