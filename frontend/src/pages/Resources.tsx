
import { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  type SelectChangeEvent,
} from "@mui/material";
import { Search, MeetingRoom, Laptop, Tv, DirectionsCar, Brush, Visibility, Favorite } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import FavoriteButton from "../context/FavoriteButton";

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
  const [filterDate, setFilterDate] = useState("");
  const [filterStartTime, setFilterStartTime] = useState("");
  const [filterEndTime, setFilterEndTime] = useState("");

  const fetchResources = async (applyTimeFilter = false) => {
    try {
      let url = "http://localhost:3000/resources";
      if (applyTimeFilter && filterDate && filterStartTime && filterEndTime) {
        const params = new URLSearchParams({
          date: filterDate,
          startTime: filterStartTime,
          endTime: filterEndTime
        });
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleApplyFilter = () => {
    fetchResources(true);
  };

  const handleClearFilter = () => {
    setFilterDate("");
    setFilterStartTime("");
    setFilterEndTime("");
    // Call with false manually since state updates are asynchronous
    fetchResources(false);
  };

  const filtered = resources.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || r.category === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t("resources.title") || "Resources"}</Typography>
      <Typography variant="body1" color="grey.500" sx={{ mb: 3 }}>{t("resources.subtitle") || "Browse and book available resources"}</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField placeholder={t("resources.search") || "Search..."} value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ minWidth: 260 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: "grey.600" }} /></InputAdornment> }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t("resources.type") || "Type"}</InputLabel>
          <Select value={typeFilter} label={t("resources.type") || "Type"} onChange={(e: SelectChangeEvent) => setTypeFilter(e.target.value)}>
            <MenuItem value="All">{t("resources.allTypes") || "All Types"}</MenuItem>
            <MenuItem value="Room">{t("resources.room") || "Room"}</MenuItem>
            <MenuItem value="Laptop">{t("resources.laptop") || "Laptop"}</MenuItem>
            <MenuItem value="Projector">{t("resources.projector") || "Projector"}</MenuItem>
            <MenuItem value="Vehicle">{t("resources.vehicle") || "Vehicle"}</MenuItem>
            <MenuItem value="Whiteboard">{t("resources.whiteboard") || "Whiteboard"}</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Favorite />}
          onClick={() => navigate("/favorites")}
          sx={{ borderRadius: 2, ml: { xs: 0, sm: "auto" } }}
        >
          {t("nav.favorites")}
        </Button>
      </Box>

      {/* Date and Time Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap", alignItems: "center", backgroundColor: 'rgba(0, 0, 0, 0.02)', p: 2, borderRadius: 2 }}>
        <Typography variant="body2" fontWeight={600} color="textSecondary" sx={{ mr: 1 }}>{t("resources.filterAvailability") || "Filter Availability:"}</Typography>
        <TextField type="date" label={t("resources.date") || "Date"} size="small" InputLabelProps={{ shrink: true }} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t("resources.startTime") || "Start Time"}</InputLabel>
          <Select value={filterStartTime} label={t("resources.startTime") || "Start Time"} onChange={(e: SelectChangeEvent) => setFilterStartTime(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map((h) => (
              <MenuItem key={h} value={h}>{h}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t("resources.endTime") || "End Time"}</InputLabel>
          <Select value={filterEndTime} label={t("resources.endTime") || "End Time"} onChange={(e: SelectChangeEvent) => setFilterEndTime(e.target.value)}>
            {Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`).map((h) => (
              <MenuItem key={h} value={h}>{h}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleApplyFilter} disabled={!filterDate || !filterStartTime || !filterEndTime}>
          {t("resources.applyFilter") || "Apply Filter"}
        </Button>
        <Button variant="outlined" color="inherit" onClick={handleClearFilter} disabled={!filterDate && !filterStartTime && !filterEndTime}>
          {t("resources.clear") || "Clear"}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {filtered.map((resource) => {
          const rType = resource.category || "Room";
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={resource.resourceId}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: `0 8px 24px ${typeColors[rType]}22` } }}>
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
                    <Chip label={t("resources.available") || "Available"} size="small" sx={{ backgroundColor: "rgba(105,240,174,0.12)", color: "#69F0AE", fontWeight: 600 }} />
                  </Box>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>{resource.name}</Typography>
                  <Typography variant="body2" color="grey.500" sx={{ mb: 1 }}>{resource.location}</Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", mt: 1 }}>
                    <Chip label={t(`resources.${rType.toLowerCase()}`) || rType} size="small" variant="outlined" sx={{ borderColor: typeColors[rType], color: typeColors[rType] }} />
                    <Typography variant="body2" color="primary.light" fontWeight={600}>€{resource.price || 0}</Typography>
                    <Typography variant="caption" color="grey.500">(+€{resource.deposit || 0} {t("resources.deposit") || "deposit"})</Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: "50%" }}>
                    <FavoriteButton resourceId={resource.resourceId} initialIsFavorite={resource.isFavorite} />
                  </Box>
                  <Button variant="contained" startIcon={<Visibility />} onClick={() => navigate(`/resources/${resource.resourceId}`)} sx={{ borderRadius: 2 }}>
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
