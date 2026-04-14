import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Button, IconButton, Tooltip,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Grid, Divider, CircularProgress, Backdrop
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
  const [saving, setSaving] = useState(false);
  const { t } = useI18n();
  const { role } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    category: "Room",
    location: "",
    deposit: 0,
    price: 0,
    description: "",
    rules: [] as string[],
    images: [] as File[]
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState("");

  const [availabilities, setAvailabilities] = useState([
    { dayOfWeek: 1, startTime: "09:00:00", endTime: "18:00:00" }
  ]);
  
  // Smart Scheduler State
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [bulkStart, setBulkStart] = useState("09:00");
  const [bulkEnd, setBulkEnd] = useState("18:00");
  const [slotDuration, setSlotDuration] = useState(0); // 0 = Full Range, others in minutes

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
      setEditId(resource.resourceId);
      setFormData({
        name: resource.name,
        category: resource.category || "Room",
        location: resource.location || "",
        deposit: resource.deposit || 0,
        price: resource.price || 0,
        description: resource.description || "",
        rules: resource.rules || [],
        images: []
      });
      setAvailabilities(resource.availabilities || [{ dayOfWeek: 1, startTime: "09:00:00", endTime: "18:00:00" }]);
    } else {
      setEditId(null);
      setFormData({ name: "", category: "Room", location: "", deposit: 0, price: 0, description: "", rules: [], images: [] });
      setAvailabilities([{ dayOfWeek: 1, startTime: "09:00:00", endTime: "18:00:00" }]);
    }
    setDialogOpen(true);
  };

  const handleSaveResource = async () => {
    setSaving(true);
    try {
      const formDataPayload = new FormData();
      // ... (omitted parts of formData filling for brevity in chunking, but I'll replace the whole function content properly)
      formDataPayload.append("name", formData.name);
      formDataPayload.append("category", formData.category);
      formDataPayload.append("location", formData.location);
      formDataPayload.append("deposit", formData.deposit.toString());
      formDataPayload.append("price", formData.price.toString());
      formDataPayload.append("description", formData.description);
      formDataPayload.append("rules", JSON.stringify(formData.rules));
      formDataPayload.append("availabilities", JSON.stringify(availabilities));
      
      if (formData.images.length > 0) {
        formData.images.forEach(img => {
          formDataPayload.append("images", img);
        });
      }

      const url = editId ? `http://localhost:3000/resources/${editId}` : "http://localhost:3000/resources";
      const method = editId ? "PUT" : "POST";

      const useFormData = !editId || (editId && formData.images.length > 0);
      
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: !useFormData ? { "Content-Type": "application/json" } : undefined,
        body: useFormData ? formDataPayload : JSON.stringify({
          name: formData.name,
          category: formData.category,
          location: formData.location,
          deposit: formData.deposit,
          price: formData.price,
          description: formData.description,
          rules: formData.rules,
        })
      });

      if (res.ok) {
        setDialogOpen(false);
        fetchResources();
      } else {
        const errorData = await res.json();
        console.error("Error saving resource:", errorData.error);
      }
    } catch (error) {
      console.error("Error saving resource:", error);
    } finally {
      setSaving(false);
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
        body: JSON.stringify({ isArchived: !currentArchived })
      });
      if (res.ok) fetchResources();
    } catch (error) {
      console.error("Error toggling archive status:", error);
    }
  };

  const addAvailabilityRow = () => {
    setAvailabilities([...availabilities, { dayOfWeek: 1, startTime: "09:00:00", endTime: "18:00:00" }]);
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

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
  };

  const applyBulkSchedule = () => {
    if (selectedDays.length === 0) return;
    
    const startMin = timeToMinutes(bulkStart);
    const endMin = timeToMinutes(bulkEnd);
    
    if (startMin >= endMin) {
      alert("Start time must be before end time");
      return;
    }

    const newSlots: any[] = [];
    
    selectedDays.forEach(day => {
      if (slotDuration === 0) {
            newSlots.push({
              dayOfWeek: day,
              startTime: `${bulkStart}:00`,
              endTime: `${bulkEnd}:00`
            });
          } else {
            let currentStart = startMin;
            while (currentStart + slotDuration <= endMin) {
              newSlots.push({
                dayOfWeek: day,
                startTime: minutesToTime(currentStart),
                endTime: minutesToTime(currentStart + slotDuration)
              });
              currentStart += slotDuration;
            }
          }
        });
        
        // Concatenate and sort by day
        const combined = [...availabilities, ...newSlots].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
        setAvailabilities(combined);
        setSelectedDays([]);
  };

  const setPreset = (type: "weekdays" | "weekend" | "all") => {
    if (type === "weekdays") setSelectedDays([1, 2, 3, 4, 5]);
    else if (type === "weekend") setSelectedDays([6, 0]);
    else if (type === "all") setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
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
                    <TableRow key={r.resourceId} sx={{ "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}>
                      <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Box sx={{ color: typeColors[rType] || typeColors.Room }}>{typeIcons[rType] || typeIcons.Room}</Box>{r.name}</Box></TableCell>
                      <TableCell><Chip label={rType} size="small" variant="outlined" sx={{ borderColor: typeColors[rType] || typeColors.Room, color: typeColors[rType] || typeColors.Room }} /></TableCell>
                      <TableCell>{r.location}</TableCell>
                      <TableCell>€{r.price || 0} / €{r.deposit || 0}</TableCell>
                      <TableCell><Chip label={!r.isArchived ? "Available" : "Archived"} size="small" sx={{ backgroundColor: !r.isArchived ? "rgba(105,240,174,0.12)" : "rgba(255,82,82,0.12)", color: !r.isArchived ? "#69F0AE" : "#FF5252", fontWeight: 600 }} /></TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(r)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={!r.isArchived ? "Archive" : "Unarchive"}>
                          <IconButton size="small" sx={{ color: r.isArchived ? "success.main" : "warning.main" }} onClick={() => handleToggleArchive(r.resourceId, r.isArchived)}>
                            {r.isArchived ? <Add fontSize="small" /> : <Delete fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Permanently Delete"><IconButton size="small" sx={{ color: "error.main" }} onClick={() => handleDeleteResource(r.resourceId)}><Delete fontSize="small" /></IconButton></Tooltip>
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Security Deposit" type="number" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })} slotProps={{ input: { startAdornment: "€ " } }} variant="filled" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Rental Price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} slotProps={{ input: { startAdornment: "€ " } }} variant="filled" />
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
            <Typography variant="subtitle2" sx={{ mb: 1, color: "grey.400" }}>Media (Photos)</Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ py: 1.5, borderStyle: "dashed", borderColor: "grey.700" }}>
              {formData.images.length > 0 ? `${formData.images.length} photos selected` : "Click to upload multiple images"}
              <input type="file" hidden accept="image/*" multiple onChange={(e) => {
                if (e.target.files) {
                  setFormData({ ...formData, images: Array.from(e.target.files) });
                }
              }} />
            </Button>
            {formData.images.length > 0 && (
              <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {formData.images.map((img, i) => (
                  <Chip key={i} label={img.name} size="small" onDelete={() => {
                    const newImgs = formData.images.filter((_, idx) => idx !== i);
                    setFormData({...formData, images: newImgs});
                  }} />
                ))}
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 1 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "grey.400" }}>Smart Scheduler</Typography>
            <Box sx={{ p: 2, bgcolor: "rgba(124,77,255,0.05)", borderRadius: 3, border: "1px solid rgba(124,77,255,0.1)", mb: 3 }}>
              <Typography variant="caption" sx={{ color: "grey.500", mb: 1, display: "block" }}>Select days & time range to add in bulk</Typography>
              
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {[
                  { label: "M", val: 1 }, { label: "T", val: 2 }, { label: "W", val: 3 },
                  { label: "T", val: 4 }, { label: "F", val: 5 }, { label: "S", val: 6 }, { label: "S", val: 0 }
                ].map((d) => (
                  <Chip
                    key={d.val}
                    label={d.label}
                    onClick={() => toggleDay(d.val)}
                    color={selectedDays.includes(d.val) ? "primary" : "default"}
                    sx={{ width: 36, height: 36, "& .MuiChip-label": { px: 0, fontWeight: 700 } }}
                    variant={selectedDays.includes(d.val) ? "filled" : "outlined"}
                  />
                ))}
              </Box>

              <Grid container spacing={2} alignItems="center">
                <Grid size={3}>
                  <TextField fullWidth size="small" type="time" label="Start" InputLabelProps={{ shrink: true }} value={bulkStart} onChange={(e) => setBulkStart(e.target.value)} />
                </Grid>
                <Grid size={3}>
                  <TextField fullWidth size="small" type="time" label="End" InputLabelProps={{ shrink: true }} value={bulkEnd} onChange={(e) => setBulkEnd(e.target.value)} />
                </Grid>
                <Grid size={3}>
                  <TextField select fullWidth size="small" label="Duration" value={slotDuration} onChange={(e) => setSlotDuration(Number(e.target.value))}>
                    <MenuItem value={0}>Full Range</MenuItem>
                    <MenuItem value={30}>30 mins</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                    <MenuItem value={240}>4 hours</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={3}>
                  <Button variant="contained" fullWidth size="small" onClick={applyBulkSchedule} disabled={selectedDays.length === 0} sx={{ height: 40, background: "linear-gradient(135deg, #7C4DFF, #651FFF)" }}>
                    Apply
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                <Button size="small" sx={{ color: "grey.500", fontSize: "0.7rem" }} onClick={() => setPreset("weekdays")}>Weekdays</Button>
                <Button size="small" sx={{ color: "grey.500", fontSize: "0.7rem" }} onClick={() => setPreset("weekend")}>Weekend</Button>
                <Button size="small" sx={{ color: "grey.500", fontSize: "0.7rem" }} onClick={() => setAvailabilities([])}>Clear All</Button>
              </Box>
            </Box>

            <Typography variant="caption" sx={{ mb: 1, display: "block", color: "grey.500" }}>Current Schedule</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 200, overflowY: "auto", pr: 1 }}>
              {availabilities.length > 0 ? availabilities.map((av, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center", p: 1, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Chip label={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][av.dayOfWeek]} size="small" sx={{ minWidth: 50, fontWeight: 600, bgcolor: "rgba(0,229,255,0.1)", color: "#00E5FF" }} />
                  <Typography variant="body2" sx={{ flex: 1, color: "grey.300" }}>{av.startTime.slice(0, 5)} - {av.endTime.slice(0, 5)}</Typography>
                  <IconButton size="small" onClick={() => removeAvailabilityRow(index)} color="error"><Delete fontSize="inherit" /></IconButton>
                </Box>
              )) : (
                <Typography variant="body2" color="grey.600" sx={{ fontStyle: "italic", textAlign: "center", py: 2 }}>No schedule set yet.</Typography>
              )}
              <Button variant="text" size="small" startIcon={<Add />} onClick={addAvailabilityRow} sx={{ mt: 1, color: "primary.light" }}>Add Manual Slot</Button>
            </Box>
          </Box>

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit" disabled={saving}>{t("adminRes.cancelBtn")}</Button>
          <Button variant="contained" onClick={handleSaveResource} disabled={saving} sx={{ px: 4, background: "linear-gradient(135deg, #7C4DFF, #651FFF)", fontWeight: 700, minWidth: 120 }}>
            {saving ? <CircularProgress size={24} color="inherit" /> : (editId ? t("adminRes.updateBtn") : t("adminRes.addBtn"))}
          </Button>
        </DialogActions>
      </Dialog>

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2000, flexDirection: "column", gap: 2 }}
        open={saving}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Saving Resource...</Typography>
      </Backdrop>
    </Box>
  );
}
