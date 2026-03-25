import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Button, IconButton, Tooltip,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Grid, Divider
} from "@mui/material";
import { Add, Edit, Delete, MeetingRoom, Laptop, Tv, DirectionsCar, Brush } from "@mui/icons-material";
import { useI18n } from "../context/I18nContext";
import { useUser } from "../context/UserContext";

const typeIcons: Record<string, React.ReactNode> = {
  Room: <MeetingRoom fontSize="small" />, Laptop: <Laptop fontSize="small" />,
  Projector: <Tv fontSize="small" />, Vehicle: <DirectionsCar fontSize="small" />,
  Whiteboard: <Brush fontSize="small" />,
};

const typeColors: Record<string, string> = {
  Room: "#7C4DFF", Laptop: "#00E5FF", Projector: "#FFD740", Vehicle: "#69F0AE", Whiteboard: "#FF80AB",
};

export default function AdminResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useI18n();
  const { role } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    category: "Room",
    location: "",
    deposit: 0,
    description: "",
    image: null as File | null
  });

  const [availabilities, setAvailabilities] = useState([
    { day_of_week: 1, start_time: "09:00:00", end_time: "18:00:00" }
  ]);

  const fetchResources = async () => {
    try {
      const endpoint = role === "admin" ? "http://localhost:3000/resources" : "http://localhost:3000/resources/me";
      const res = await fetch(endpoint, {
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

  const handleCreateResource = async () => {
    try {
      const formDataPayload = new FormData();
      formDataPayload.append("name", formData.name);
      formDataPayload.append("category", formData.category);
      formDataPayload.append("location", formData.location);
      formDataPayload.append("deposit", formData.deposit.toString());
      formDataPayload.append("description", formData.description);
      formDataPayload.append("availabilities", JSON.stringify(availabilities));
      if (formData.image) {
        formDataPayload.append("image", formData.image);
      }

      const res = await fetch("http://localhost:3000/resources", {
        method: "POST",
        credentials: "include",
        body: formDataPayload
      });

      if (res.ok) {
        setDialogOpen(false);
        setFormData({ name: "", category: "Room", location: "", deposit: 0, description: "", image: null });
        setAvailabilities([{ day_of_week: 1, start_time: "09:00:00", end_time: "18:00:00" }]);
        fetchResources(); // Refresh list
      }
    } catch (error) {
      console.error("Error creating resource:", error);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/resources/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const addAvailabilityRow = () => {
    setAvailabilities([...availabilities, { day_of_week: 1, start_time: "09:00:00", end_time: "18:00:00" }]);
  };

  const updateAvailability = (index: number, field: string, value: any) => {
    const updated = [...availabilities];
    updated[index] = { ...updated[index], [field]: value };
    setAvailabilities(updated);
  };

  const removeAvailabilityRow = (index: number) => {
    const updated = availabilities.filter((_, i) => i !== index);
    setAvailabilities(updated);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {role === "admin" ? (t("adminRes.title") || "All Platform Resources") : (t("adminRes.myListings") || "My Listings")}
          </Typography>
          <Typography variant="body1" color="grey.500">
            {role === "admin" ? (t("adminRes.subtitle") || "Add, edit or remove resources from the entire platform") : (t("adminRes.mySubtitle") || "Manage your items for rent")}
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<Add />} onClick={() => setDialogOpen(true)}
          sx={{ background: "linear-gradient(135deg, #7C4DFF, #00E5FF)", fontWeight: 600 }}>
          {t("adminRes.add") || "Post new item"}
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {["Resource", "Type", "Location", "Deposit", "Status"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: "grey.400" }}>{h}</TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 600, color: "grey.400" }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resources.map((r) => {
                  const rType = r.category || "Room";
                  return (
                    <TableRow key={r.resource_id} sx={{ "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}>
                      <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Box sx={{ color: typeColors[rType] || typeColors.Room }}>{typeIcons[rType] || typeIcons.Room}</Box>{r.name}</Box></TableCell>
                      <TableCell><Chip label={rType} size="small" variant="outlined" sx={{ borderColor: typeColors[rType] || typeColors.Room, color: typeColors[rType] || typeColors.Room }} /></TableCell>
                      <TableCell>{r.location}</TableCell>
                      <TableCell>€{r.deposit || 0}</TableCell>
                      <TableCell><Chip label={!r.is_archived ? "Available" : "Archived"} size="small" sx={{ backgroundColor: !r.is_archived ? "rgba(105,240,174,0.12)" : "rgba(255,82,82,0.12)", color: !r.is_archived ? "#69F0AE" : "#FF5252", fontWeight: 600 }} /></TableCell>
                      <TableCell align="right">
                        <Tooltip title="Delete"><IconButton size="small" sx={{ color: "error.main" }} onClick={() => handleDeleteResource(r.resource_id)}><Delete fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Resource</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField fullWidth label="Resource Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} sx={{ mt: 1 }} />
          <TextField fullWidth select label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            <MenuItem value="Room">Room</MenuItem><MenuItem value="Laptop">Laptop</MenuItem>
            <MenuItem value="Projector">Projector</MenuItem><MenuItem value="Vehicle">Vehicle</MenuItem>
            <MenuItem value="Whiteboard">Whiteboard</MenuItem>
          </TextField>
          <TextField fullWidth label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          <TextField fullWidth type="number" label="Deposit Fee" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })} />

          <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
            {formData.image ? `Image selected: ${formData.image.name}` : "Upload Resource Image"}
            <input type="file" hidden accept="image/*" onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFormData({ ...formData, image: e.target.files[0] });
              }
            }} />
          </Button>

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Availabilities</Typography>
          {availabilities.map((av, index) => (
            <Grid container spacing={1} key={index} alignItems="center">
              <Grid size={3}>
                <TextField select fullWidth label="Day" value={av.day_of_week} onChange={(e) => updateAvailability(index, "day_of_week", Number(e.target.value))}>
                  <MenuItem value={1}>Mon</MenuItem>
                  <MenuItem value={2}>Tue</MenuItem>
                  <MenuItem value={3}>Wed</MenuItem>
                  <MenuItem value={4}>Thu</MenuItem>
                  <MenuItem value={5}>Fri</MenuItem>
                  <MenuItem value={6}>Sat</MenuItem>
                  <MenuItem value={0}>Sun</MenuItem>
                </TextField>
              </Grid>
              <Grid size={4}>
                <TextField fullWidth label="Start Time" type="time" InputLabelProps={{ shrink: true }} value={av.start_time} onChange={(e) => updateAvailability(index, "start_time", e.target.value + ":00")} />
              </Grid>
              <Grid size={4}>
                <TextField fullWidth label="End Time" type="time" InputLabelProps={{ shrink: true }} value={av.end_time} onChange={(e) => updateAvailability(index, "end_time", e.target.value + ":00")} />
              </Grid>
              <Grid size={1}>
                <IconButton color="error" onClick={() => removeAvailabilityRow(index)}><Delete /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Button variant="outlined" startIcon={<Add />} onClick={addAvailabilityRow}>Add Time Slot</Button>

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateResource}>Create Resource</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
