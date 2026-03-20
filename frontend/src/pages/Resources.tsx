import { useState } from "react";
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  type SelectChangeEvent,
} from "@mui/material";
import { Search, MeetingRoom, Laptop, Tv, DirectionsCar, Brush, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

const resources = [
  { id: 1, name: "Conference Room A", type: "Room", location: "Building 1, Floor 2", available: true, fee: "€2.00" },
  { id: 2, name: "Conference Room B", type: "Room", location: "Building 1, Floor 3", available: false, fee: "€2.00" },
  { id: 3, name: "Laptop Dell #7", type: "Laptop", location: "IT Office", available: true, fee: "€1.50" },
  { id: 4, name: "Laptop HP #3", type: "Laptop", location: "IT Office", available: true, fee: "€1.50" },
  { id: 5, name: "Projector Epson #1", type: "Projector", location: "Storage Room A", available: true, fee: "€1.00" },
  { id: 6, name: "Projector Epson #2", type: "Projector", location: "Storage Room A", available: false, fee: "€1.00" },
  { id: 7, name: "Van Mercedes", type: "Vehicle", location: "Parking Lot B", available: true, fee: "€5.00" },
  { id: 8, name: "Whiteboard Mobile #2", type: "Whiteboard", location: "Building 2, Hallway", available: true, fee: "€0.50" },
  { id: 9, name: "Classroom 101", type: "Room", location: "Building 3, Floor 1", available: true, fee: "€3.00" },
];

const typeIcons: Record<string, React.ReactNode> = {
  Room: <MeetingRoom />, Laptop: <Laptop />, Projector: <Tv />, Vehicle: <DirectionsCar />, Whiteboard: <Brush />,
};
const typeColors: Record<string, string> = {
  Room: "#7C4DFF", Laptop: "#00E5FF", Projector: "#FFD740", Vehicle: "#69F0AE", Whiteboard: "#FF80AB",
};
const typeKeys: Record<string, string> = {
  Room: "resources.room", Laptop: "resources.laptop", Projector: "resources.projector", Vehicle: "resources.vehicle", Whiteboard: "resources.whiteboard",
};

export default function Resources() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = resources.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t("resources.title")}</Typography>
      <Typography variant="body1" color="grey.500" sx={{ mb: 3 }}>{t("resources.subtitle")}</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField placeholder={t("resources.search")} value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ minWidth: 260 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: "grey.600" }} /></InputAdornment> } }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t("resources.type")}</InputLabel>
          <Select value={typeFilter} label={t("resources.type")} onChange={(e: SelectChangeEvent) => setTypeFilter(e.target.value)}>
            <MenuItem value="All">{t("resources.allTypes")}</MenuItem>
            {Object.keys(typeKeys).map((k) => <MenuItem key={k} value={k}>{t(typeKeys[k])}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {filtered.map((resource) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={resource.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: `0 8px 24px ${typeColors[resource.type]}22` } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: 2.5, display: "flex", alignItems: "center", justifyContent: "center", background: `${typeColors[resource.type]}18`, color: typeColors[resource.type] }}>{typeIcons[resource.type]}</Box>
                  <Chip label={resource.available ? t("resources.available") : t("resources.inUse")} size="small" sx={{ backgroundColor: resource.available ? "rgba(105,240,174,0.12)" : "rgba(255,82,82,0.12)", color: resource.available ? "#69F0AE" : "#FF5252", fontWeight: 600 }} />
                </Box>
                <Typography variant="h6" sx={{ mb: 0.5 }}>{resource.name}</Typography>
                <Typography variant="body2" color="grey.500" sx={{ mb: 1 }}>{resource.location}</Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Chip label={t(typeKeys[resource.type])} size="small" variant="outlined" sx={{ borderColor: typeColors[resource.type], color: typeColors[resource.type] }} />
                  <Typography variant="body2" color="grey.400">{t("resources.deposit")}: {resource.fee}</Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button fullWidth variant={resource.available ? "contained" : "outlined"} startIcon={<Visibility />} disabled={!resource.available} onClick={() => navigate(`/resources/${resource.id}`)}>
                  {resource.available ? t("resources.viewBook") : t("resources.unavailable")}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
