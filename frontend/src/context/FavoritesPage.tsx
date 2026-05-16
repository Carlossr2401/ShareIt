import React, { useEffect, useState } from "react";
import { Container, Typography, Grid, CircularProgress, Box, Card, CardContent, Chip, Button, CardActions } from "@mui/material";
import { MeetingRoom, Laptop, Tv, DirectionsCar, Brush, Visibility } from "@mui/icons-material";
import { useI18n } from "../context/I18nContext";
import { useNavigate } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";

const typeIcons: Record<string, React.ReactNode> = {
  Room: <MeetingRoom />, Laptop: <Laptop />, Projector: <Tv />, Vehicle: <DirectionsCar />, Whiteboard: <Brush />,
};

const typeColors: Record<string, string> = {
  Room: "#7C4DFF", Laptop: "#00E5FF", Projector: "#FFD740", Vehicle: "#69F0AE", Whiteboard: "#FF80AB",
};

const FavoritesPage = () => {
  const { t } = useI18n();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // Añadido para la navegación
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const res = await fetch(`${API_URL}/resources/favorites/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setFavorites(data);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          {t("favorites.title")}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)} // Botón para volver a la página anterior
          sx={{ borderRadius: 2 }}
        >
          Volver
        </Button>
      </Box>

      {favorites.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t("favorites.noFavorites")}
          </Typography>
          <Button variant="contained" onClick={() => navigate("/resources")} sx={{ mt: 2 }}>
            {t("nav.resources")}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((resource: any) => {
            const rType = resource.category || "Room";
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} component="div" key={resource.resourceId}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: `0 8px 24px ${typeColors[rType]}22` } }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 2.5, display: "flex", alignItems: "center", justifyContent: "center", background: `${typeColors[rType]}18`, color: typeColors[rType], overflow: "hidden" }}>
                        {resource.photoUrls && resource.photoUrls.length > 0 ? (
                          <img src={resource.photoUrls[0]} alt={resource.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          typeIcons[rType] || typeIcons.Room
                        )}
                      </Box>
                      <Chip label="Available" size="small" sx={{ backgroundColor: "rgba(105,240,174,0.12)", color: "#69F0AE", fontWeight: 600 }} />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>{resource.name}</Typography>
                    <Typography variant="body2" color="grey.500" sx={{ mb: 1 }}>{resource.location}</Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", mt: 1 }}>
                      <Chip label={rType} size="small" variant="outlined" sx={{ borderColor: typeColors[rType], color: typeColors[rType] }} />
                      <Typography variant="body2" color="primary.light" fontWeight={600}>€{resource.price || 0}</Typography>
                      <Typography variant="caption" color="grey.500">(+€{resource.deposit || 0} deposit)</Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2, justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: "50%" }}>
                      <FavoriteButton resourceId={resource.resourceId} initialIsFavorite={true} />
                    </Box>
                    <Button variant="contained" startIcon={<Visibility />} onClick={() => navigate(`/resources/${resource.resourceId}`)} sx={{ borderRadius: 2 }}>
                      {t("resources.viewBook")}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default FavoritesPage;