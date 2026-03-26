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
    rules: [] as string[],
    image: null as File | null
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState("");

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

  const handleOpenDialog = (resource: any = null) => {
    if (resource) {
      setEditId(resource.resource_id);
      setFormData({
        name: resource.name,
        category: resource.category || "Room",
        location: resource.location || "",
        deposit: resource.deposit || 0,
        description: resource.description || "",
        rules: resource.rules || [],
        image: null
      });
      setAvailabilities(resource.availabilities || [{ day_of_week: 1, start_time: "09:00:00", end_time: "18:00:00" }]);
    } else {
      setEditId(null);
      setFormData({ name: "", category: "Room", location: "", deposit: 0, description: "", rules: [], image: null });
      setAvailabilities([{ day_of_week: 1, start_time: "09:00:00", end_time: "18:00:00" }]);
    }
    setDialogOpen(true);
  };

  const handleSaveResource = async () => {
    try {
      const formDataPayload = new FormData();
      formDataPayload.append("name", formData.name);
      formDataPayload.append("category", formData.category);
      formDataPayload.append("location", formData.location);
      formDataPayload.append("deposit", formData.deposit.toString());
      formDataPayload.append("description", formData.description);
      formDataPayload.append("rules", JSON.stringify(formData.rules));
      formDataPayload.append("availabilities", JSON.stringify(availabilities));
      if (formData.image) {
        formDataPayload.append("image", formData.image);
      }

      const url = editId ? `http://localhost:3000/resources/${editId}` : "http://localhost:3000/resources";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        ...(editId ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            location: formData.location,
            deposit: formData.deposit,
            description: formData.description,
            rules: formData.rules,
            // Assuming availabilities are handled separately for updates or this simple replace approach
          })
        } : {
          body: formDataPayload
        })
      });

      // Note: If using FormData for PUT, you'd need the backend to handle it. 
      // Simplified: If editId exists, we send JSON for simplicity, unless image is present.
      // Re-doing the fetch logic to handle FormData for both if needed:
      if (editId && formData.image) {
          // If editing AND image is changed, use FormData
          const resImage = await fetch(url, { method: "PUT", credentials: "include", body: formDataPayload });
          if (resImage.ok) { setDialogOpen(false); fetchResources(); }
      } else {
          const finalMethod = editId ? "PUT" : "POST";
          const finalBody = editId ? JSON.stringify({ ...formData, rules: formData.rules }) : formDataPayload;
          const finalHeaders = editId ? { "Content-Type": "application/json" } : undefined;
          
          const resFinal = await fetch(url, { method: finalMethod, credentials: "include", headers: finalHeaders, body: finalBody as any });
          if (resFinal.ok) { setDialogOpen(false); fetchResources(); }
      }
    } catch (error) {
      console.error("Error saving resource:", error);
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

  const handleToggleArchive = async (id: string, currentArchived: boolean) => {
    try {
      const res = await fetch(`http://localhost:3000/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_archived: !currentArchived })
      });
      if (res.ok) fetchResources();
    } catch (error) {
      console.error("Error toggling archive status:", error);
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

  const addRule = () => {
    if (newRule.trim()) {
      setFormData({ ...formData, rules: [...formData.rules, newRule.trim()] });
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setFormData({ ...formData, rules: formData.rules.filter((_, i) => i !== index) });
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
        <Button variant="contained" size="large" startIcon={<Add />} onClick={() => handleOpenDialog()}
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
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(r)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={!r.is_archived ? "Archive" : "Unarchive"}>
                          <IconButton size="small" sx={{ color: r.is_archived ? "success.main" : "warning.main" }} onClick={() => handleToggleArchive(r.resource_id, r.is_archived)}>
                            {r.is_archived ? <Add fontSize="small" /> : <Delete fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Permanently Delete"><IconButton size="small" sx={{ color: "error.main" }} onClick={() => handleDeleteResource(r.resource_id)}><Delete fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: "#121212", backgroundImage: "none", border: "1px solid rgba(255,255,255,0.08)" } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.5rem" }}>{editId ? t("adminRes.edit") : t("adminRes.add")}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "grey.400" }}>Basic Information</Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField fullWidth label="Resource Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} variant="filled" />
              </Grid>
              <Grid size={6}>
                <TextField fullWidth select label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} variant="filled">
                  <MenuItem value="Room">Room</MenuItem><MenuItem value="Laptop">Laptop</MenuItem>
                  <MenuItem value="Projector">Projector</MenuItem><MenuItem value="Vehicle">Vehicle</MenuItem>
                  <MenuItem value="Whiteboard">Whiteboard</MenuItem>
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField fullWidth label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} variant="filled" />
              </Grid>
              <Grid size={12}>
                <TextField fullWidth type="number" label="Deposit Fee (€)" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })} variant="filled" />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "grey.400" }}>{t("adminRes.details") || "Details & Rules"}</Typography>
            <TextField fullWidth multiline rows={3} label={t("adminRes.description")} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} variant="filled" sx={{ mb: 2 }} />
            
            <Box sx={{ p: 2, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 2 }}>
              <Typography variant="caption" sx={{ mb: 1, display: "block", color: "grey.500" }}>{t("adminRes.rules")}</Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField fullWidth size="small" placeholder="e.g. No food allowed" value={newRule} onChange={(e) => setNewRule(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addRule()} sx={{ "& .MuiInputBase-root": { bgcolor: "transparent" } }} />
                <Button variant="outlined" onClick={addRule} size="small">Add</Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.rules.length > 0 ? formData.rules.map((rule, index) => (
                  <Chip key={index} label={rule} onDelete={() => removeRule(index)} size="small" sx={{ bgcolor: "primary.dark", color: "white" }} />
                )) : (
                  <Typography variant="caption" color="grey.600">No rules added yet.</Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "grey.400" }}>Media</Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ py: 1.5, borderStyle: "dashed", borderColor: "grey.700" }}>
              {formData.image ? `Image selected: ${formData.image.name}` : "Click to upload image"}
              <input type="file" hidden accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFormData({ ...formData, image: e.target.files[0] });
                }
              }} />
            </Button>
          </Box>

          <Divider sx={{ my: 1 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "grey.400" }}>Availabilities</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {availabilities.map((av, index) => (
                <Grid container spacing={1} key={index} alignItems="center">
                  <Grid size={3}>
                    <TextField select fullWidth size="small" label="Day" value={av.day_of_week} onChange={(e) => updateAvailability(index, "day_of_week", Number(e.target.value))}>
                      <MenuItem value={1}>Mon</MenuItem><MenuItem value={2}>Tue</MenuItem>
                      <MenuItem value={3}>Wed</MenuItem><MenuItem value={4}>Thu</MenuItem>
                      <MenuItem value={5}>Fri</MenuItem><MenuItem value={6}>Sat</MenuItem>
                      <MenuItem value={0}>Sun</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={4}>
                    <TextField fullWidth size="small" type="time" InputLabelProps={{ shrink: true }} value={av.start_time} onChange={(e) => updateAvailability(index, "start_time", e.target.value + ":00")} />
                  </Grid>
                  <Grid size={4}>
                    <TextField fullWidth size="small" type="time" InputLabelProps={{ shrink: true }} value={av.end_time} onChange={(e) => updateAvailability(index, "end_time", e.target.value + ":00")} />
                  </Grid>
                  <Grid size={1}>
                    <IconButton color="error" size="small" onClick={() => removeAvailabilityRow(index)}><Delete fontSize="inherit" /></IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button variant="text" size="small" startIcon={<Add />} onClick={addAvailabilityRow} sx={{ alignSelf: "flex-start", mt: 1 }}>Add Time Slot</Button>
            </Box>
          </Box>

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">{t("adminRes.cancelBtn")}</Button>
          <Button variant="contained" onClick={handleSaveResource} sx={{ px: 4, background: "linear-gradient(135deg, #7C4DFF, #651FFF)", fontWeight: 700 }}>
            {editId ? t("adminRes.updateBtn") : t("adminRes.addBtn")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
