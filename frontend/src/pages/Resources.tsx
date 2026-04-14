import { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  type SelectChangeEvent,
} from "@mui/material";
import { Search, MeetingRoom, Laptop, Tv, DirectionsCar, Brush, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

const typeIcons: Record<string, React.ReactNode> = {
  Room: <MeetingRoom />, Laptop: <Laptop />, Projector: <Tv />, Vehicle: <DirectionsCar />, Whiteboard: <Brush />,
};

const typeColors: Record<string, string> = {
  Room: "#7C4DFF", Laptop: "#00E5FF", Projector: "#FFD740", Vehicle: "#69F0AE", Whiteboard: "#FF80AB",
};

export default function Resources() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("http://localhost:3000/resources");
        if (res.ok) {
          const data = await res.json();
          setResources(data);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };
    fetchResources();
  }, []);

  const filtered = resources.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || r.category === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t("resources.title") || "Resources"}</Typography>
      <Typography variant="body1" color="grey.500" sx={{ mb: 3 }}>Browse and book available resources</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ minWidth: 260 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: "grey.600" }} /></InputAdornment> }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select value={typeFilter} label="Type" onChange={(e: SelectChangeEvent) => setTypeFilter(e.target.value)}>
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Room">Room</MenuItem>
            <MenuItem value="Laptop">Laptop</MenuItem>
            <MenuItem value="Projector">Projector</MenuItem>
            <MenuItem value="Vehicle">Vehicle</MenuItem>
            <MenuItem value="Whiteboard">Whiteboard</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {filtered.map((resource) => {
          const rType = resource.category || "Room";
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={resource.resourceId}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: `0 8px 24px ${typeColors[rType]}22` } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2.5, display: "flex", alignItems: "center", justifyContent: "center", background: `${typeColors[rType]}18`, color: typeColors[rType], overflow: "hidden" }}>
                      {resource.photoUrls ? (
                        Array.isArray(resource.photoUrls) ? (
                          resource.photoUrls[0] ? <img src={resource.photoUrls[0]} alt={resource.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : typeIcons[rType] || typeIcons.Room
                        ) : (
                          <img src={resource.photoUrls} alt={resource.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )
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
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button fullWidth variant="contained" startIcon={<Visibility />} onClick={() => navigate(`/resources/${resource.resourceId}`)}>
                    View & Book
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  );
}
