import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Button, IconButton, Tooltip,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Grid, Divider, CircularProgress, Backdrop, Stepper, Step, StepLabel, CardActionArea
} from "@mui/material";
import { 
  Add, Edit, Delete, MeetingRoom, Laptop, Tv, DirectionsCar, Brush, 
  Inventory2, Search, NavigateNext, NavigateBefore, CheckCircle, PhotoCamera,
  CalendarMonth
} from "@mui/icons-material";
import { useI18n } from "../context/I18nContext";
import { useUser } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";

const categories = [
  { id: "Room", label: "Room", icon: <MeetingRoom />, color: "#7C4DFF" },
  { id: "Laptop", label: "Laptop", icon: <Laptop />, color: "#00E5FF" },
  { id: "Projector", label: "Projector", icon: <Tv />, color: "#FFD740" },
  { id: "Vehicle", label: "Vehicle", icon: <DirectionsCar />, color: "#69F0AE" },
  { id: "Whiteboard", label: "Whiteboard", icon: <Brush />, color: "#FF80AB" },
];

const rulePresets = [
  "No food or drinks",
  "No smoking",
  "Return clean",
  "Handle with care",
  "Quiet area",
  "Maximum 4 people",
  "Prior reservation required",
];

const typeIcons: Record<string, React.ReactNode> = {
  Room: <MeetingRoom fontSize="small" />, Laptop: <Laptop fontSize="small" />,
  Projector: <Tv fontSize="small" />, Vehicle: <DirectionsCar fontSize="small" />,
  Whiteboard: <Brush fontSize="small" />,
};

const typeColors: Record<string, string> = {
  Room: "#7C4DFF", Laptop: "#00E5FF", Projector: "#FFD740", Vehicle: "#69F0AE", Whiteboard: "#FF80AB",
};

interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Resource {
  resourceId: string;
  name: string;
  category: string;
  location: string;
  deposit: number;
  price: number;
  description: string;
  rules: string[];
  isArchived: boolean;
  availabilities?: Availability[];
}

export default function AdminResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();
  const { role } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const isPersonalMode = location.pathname.includes("my-listings");

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
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [availabilities, setAvailabilities] = useState<Availability[]>([
    { dayOfWeek: 1, startTime: "09:00:00", endTime: "18:00:00" }
  ]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Smart Scheduler State
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [bulkStart, setBulkStart] = useState("09:00");
  const [bulkEnd, setBulkEnd] = useState("18:00");
  const [slotDuration, setSlotDuration] = useState(0); // 0 = Full Range, others in minutes

  const steps = ["Basics", "Details & Media", "Availability"];

  const fetchResources = async () => {
    setLoading(true);
    try {
      const endpoint = isPersonalMode ? "http://localhost:3000/resources/me" : "http://localhost:3000/resources";
      const res = await fetch(endpoint, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [location.pathname]);

  const handleOpenDialog = (resource: Resource | null = null) => {
    // Reset previews
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);

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
    setActiveStep(0);
    setDialogOpen(true);
  };

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSaveResource = async () => {
    setSaving(true);
    try {
      const formDataPayload = new FormData();
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
          availabilities: availabilities,
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

    const newSlots: Availability[] = [];
    
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

  const addRulePreset = (preset: string) => {
    if (!formData.rules.includes(preset)) {
      setFormData({ ...formData, rules: [...formData.rules, preset] });
    }
  };

  const removeRule = (index: number) => {
    setFormData({ ...formData, rules: formData.rules.filter((_, i) => i !== index) });
  };

  if (!isPersonalMode && role !== "admin") {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error">{t("adminRes.accessDenied") || "Access Denied"}</Typography>
        <Typography color="grey.500">{t("adminRes.noPermission") || "You do not have permissions to view this page."}</Typography>
      </Box>
    );
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: "grey.400", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{t("adminRes.whatListing") || "What are you listing?"}</Typography>
              <Grid container spacing={2}>
                {categories.map((cat) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={cat.id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: 3, 
                        borderColor: formData.category === cat.id ? cat.color : "rgba(255,255,255,0.08)",
                        bgcolor: formData.category === cat.id ? `${cat.color}11` : "transparent",
                        transition: "all 0.2s"
                      }}
                    >
                      <CardActionArea onClick={() => setFormData({ ...formData, category: cat.id })} sx={{ p: 2, textAlign: "center" }}>
                        <Box sx={{ color: formData.category === cat.id ? cat.color : "grey.600", mb: 1 }}>{cat.icon}</Box>
                        <Typography variant="body2" fontWeight={700}>{t(`resources.${cat.id.toLowerCase()}`) || cat.label}</Typography>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: "grey.400", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{t("adminRes.basicInfo") || "Basic Info"}</Typography>
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <TextField fullWidth label={t("adminRes.resName") || "Resource Name"} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} variant="filled" placeholder="e.g. Ergonomic Office Room A" />
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth label={t("adminRes.location") || "Location / Building"} value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} variant="filled" placeholder="e.g. Building 4, Floor 2" />
                </Grid>
                <Grid size={6}>
                  <TextField fullWidth label={t("adminRes.hourlyPrice") || "Hourly Price"} type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} slotProps={{ input: { startAdornment: "€ " } }} variant="filled" />
                </Grid>
                <Grid size={6}>
                  <TextField fullWidth label={t("adminRes.securityDeposit") || "Security Deposit"} type="number" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })} slotProps={{ input: { startAdornment: "€ " } }} variant="filled" />
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: "grey.400", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{t("adminRes.description") || "Description"}</Typography>
              <TextField fullWidth multiline rows={4} label={t("adminRes.describeListing") || "Describe your listing"} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} variant="filled" />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: "grey.400", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{t("adminRes.rulesUsage") || "Rules & Usage"}</Typography>
              <Box sx={{ p: 2.5, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.06)" }}>
                <Typography variant="caption" sx={{ mb: 1.5, display: "block", color: "grey.500", fontWeight: 600 }}>{t("adminRes.quickPresets") || "QUICK PRESETS"}</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
                  {[
                    t("rules.noFood") || "No food or drinks",
                    t("rules.noSmoking") || "No smoking",
                    t("rules.returnClean") || "Return clean",
                    t("rules.handleCare") || "Handle with care",
                    t("rules.quietArea") || "Quiet area",
                    t("rules.max4") || "Maximum 4 people",
                    t("rules.priorReservation") || "Prior reservation required",
                  ].map((preset) => (
                    <Chip key={preset} label={preset} size="small" variant="outlined" onClick={() => addRulePreset(preset)} clickable sx={{ "&:hover": { bgcolor: "primary.dark" } }} />
                  ))}
                </Box>
                <Divider sx={{ my: 2, opacity: 0.05 }} />
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField fullWidth size="small" placeholder={t("adminRes.customRule") || "Custom rule..."} value={newRule} onChange={(e) => setNewRule(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addRule()} />
                  <Button variant="contained" onClick={addRule} size="small">{t("adminRes.addBtnText") || "Add"}</Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {formData.rules.map((rule, idx) => (
                    <Chip key={idx} label={rule} onDelete={() => removeRule(idx)} color="primary" size="small" sx={{ fontWeight: 600 }} />
                  ))}
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: "grey.400", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{t("adminRes.photos") || "Photos"}</Typography>
              <Box 
                sx={{ 
                  border: "2px dashed",
                  borderColor: isDragging ? "primary.main" : "rgba(255,255,255,0.1)",
                  bgcolor: isDragging ? "rgba(124,77,255,0.05)" : "transparent",
                  borderRadius: 4, 
                  p: 4, 
                  textAlign: "center",
                  transition: "all 0.2s",
                  cursor: "pointer",
                  "&:hover": { borderColor: "primary.main", bgcolor: "rgba(124,77,255,0.02)" }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                component="label"
              >
                <input type="file" hidden accept="image/*" multiple onChange={(e) => handleFileSelection(e.target.files)} />
                <PhotoCamera sx={{ fontSize: 40, color: isDragging ? "primary.main" : "grey.600", mb: 1 }} />
                <Typography variant="body2" color={isDragging ? "primary.main" : "grey.400"}>
                  {isDragging ? (t("adminRes.dropHere") || "Drop them here!") : (t("adminRes.uploadPhotos") || "Click or drag to upload photos")}
                </Typography>
              </Box>

              {imagePreviews.length > 0 && (
                <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 2 }}>
                  {imagePreviews.map((url, i) => (
                    <Box 
                      key={i} 
                      sx={{ 
                        position: "relative", 
                        aspectRatio: "1/1", 
                        borderRadius: 2, 
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                      }}
                    >
                      <img src={url} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <IconButton 
                        size="small" 
                        onClick={() => removeImage(i)}
                        sx={{ 
                          position: "absolute", 
                          top: 2, 
                          right: 2, 
                          bgcolor: "rgba(0,0,0,0.6)", 
                          color: "white",
                          "&:hover": { bgcolor: "error.main" }
                        }}
                      >
                        <Delete sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
            <Box sx={{ p: 3, bgcolor: "rgba(124,77,255,0.05)", borderRadius: 4, border: "1px solid rgba(124,77,255,0.12)" }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700 }}>{t("adminRes.quickSelection") || "Quick Selection (Bulk)"}</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {[{l:"M",v:1},{l:"T",v:2},{l:"W",v:3},{l:"T",v:4},{l:"F",v:5},{l:"S",v:6},{l:"S",v:0}].map((d) => (
                  <Chip key={d.v} label={d.l} onClick={() => toggleDay(d.v)} color={selectedDays.includes(d.v) ? "primary" : "default"} variant={selectedDays.includes(d.v) ? "filled" : "outlined"} sx={{ width: 40, height: 40, borderRadius: 2, fontWeight: 700 }} />
                ))}
              </Box>
              <Grid container spacing={2} alignItems="center">
                <Grid size={3}><TextField fullWidth size="small" type="time" label={t("adminRes.start") || "Start"} InputLabelProps={{ shrink: true }} value={bulkStart} onChange={(e) => setBulkStart(e.target.value)} variant="standard" /></Grid>
                <Grid size={3}><TextField fullWidth size="small" type="time" label={t("adminRes.end") || "End"} InputLabelProps={{ shrink: true }} value={bulkEnd} onChange={(e) => setBulkEnd(e.target.value)} variant="standard" /></Grid>
                <Grid size={3}>
                  <TextField select fullWidth size="small" label={t("adminRes.slot") || "Slot"} value={slotDuration} onChange={(e) => setSlotDuration(Number(e.target.value))} variant="standard">
                    <MenuItem value={0}>{t("adminRes.full") || "Full"}</MenuItem><MenuItem value={30}>30m</MenuItem><MenuItem value={60}>1h</MenuItem><MenuItem value={120}>2h</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={3}><Button variant="contained" fullWidth onClick={applyBulkSchedule} disabled={selectedDays.length === 0} sx={{ height: 40, borderRadius: 2 }}>{t("adminRes.apply") || "Apply"}</Button></Grid>
              </Grid>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button size="small" onClick={() => setPreset("weekdays")}>{t("adminRes.weekdays") || "Weekdays"}</Button>
                <Button size="small" onClick={() => setPreset("weekend")}>{t("adminRes.weekend") || "Weekend"}</Button>
                <Button size="small" color="error" sx={{ ml: "auto" }} onClick={() => setAvailabilities([])}>{t("adminRes.reset") || "Reset"}</Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, color: "grey.400", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{t("adminRes.definedSchedule") || "Defined Schedule"}</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 200, overflowY: "auto", pr: 1 }}>
                {availabilities.map((av, idx) => (
                  <Box key={idx} sx={{ display: "flex", gap: 2, alignItems: "center", p: 1.5, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Chip label={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][av.dayOfWeek]} size="small" sx={{ fontWeight: 700, minWidth: 50 }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>{av.startTime.slice(0, 5)} - {av.endTime.slice(0, 5)}</Typography>
                    <IconButton size="small" color="error" onClick={() => removeAvailabilityRow(idx)}><Delete fontSize="inherit" /></IconButton>
                  </Box>
                ))}
                <Button fullWidth variant="text" size="small" startIcon={<Add />} onClick={addAvailabilityRow} sx={{ mt: 1, py: 1, borderRadius: 2, border: "1px dashed rgba(124,77,255,0.2)" }}>{t("adminRes.manualSlot") || "Manual Slot"}</Button>
              </Box>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={800}>
            {isPersonalMode ? (t("adminRes.myListings") || "My Listings") : (t("adminRes.title") || "Platform Resources")}
          </Typography>
          <Typography variant="body1" color="grey.500">
            {isPersonalMode ? (t("adminRes.mySubtitle") || "Manage and share your items for rent") : (t("adminRes.subtitle") || "Complete control over all platform resources")}
          </Typography>
        </Box>
        <Button variant="contained" size="large" startIcon={<Add />} onClick={() => handleOpenDialog()}
          sx={{ background: "linear-gradient(135deg, #7C4DFF, #00E5FF)", fontWeight: 700, borderRadius: 3, boxShadow: "0 8px 16px rgba(124, 77, 255, 0.2)" }}>
          {t("adminRes.add") || "Post new item"}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 10 }}><CircularProgress /></Box>
      ) : resources.length > 0 ? (
        <Card sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
                  <TableRow>
                    {[
                      t("adminRes.resource") || "Resource",
                      t("adminRes.type") || "Type",
                      t("adminRes.location") || "Location",
                      t("adminRes.priceDeposit") || "Price/Deposit",
                      t("adminRes.status") || "Status"
                    ].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 700, color: "grey.400", py: 2.5 }}>{h}</TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 700, color: "grey.400", py: 2.5 }} align="right">{t("adminRes.actions") || "Actions"}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resources.map((r) => {
                    const rType = r.category || "Room";
                    return (
                      <TableRow key={r.resourceId} sx={{ "&:last-child td": { border: 0 }, "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}>
                        <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 2 }}><Box sx={{ width: 36, height: 36, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", background: `${typeColors[rType] || "#7C4DFF"}22`, color: typeColors[rType] || "#7C4DFF" }}>{typeIcons[rType] || typeIcons.Room}</Box><Typography fontWeight={600}>{r.name}</Typography></Box></TableCell>
                        <TableCell><Chip label={t(`resources.${rType.toLowerCase()}`) || rType} size="small" sx={{ bgcolor: "rgba(124,77,255,0.08)", color: "primary.light", fontWeight: 600 }} /></TableCell>
                        <TableCell sx={{ color: "grey.400" }}>{r.location}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>€{r.price || 0}</Typography>
                          <Typography variant="caption" color="grey.600">€{r.deposit || 0} {t("resources.deposit") || "deposit"}</Typography>
                        </TableCell>
                        <TableCell><Chip label={!r.isArchived ? (t("adminRes.active") || "Active") : (t("adminRes.archived") || "Archived")} size="small" sx={{ backgroundColor: !r.isArchived ? "rgba(105,240,174,0.1)" : "rgba(255,82,82,0.1)", color: !r.isArchived ? "#69F0AE" : "#FF5252", fontWeight: 700 }} /></TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                            <Tooltip title={t("adminRes.viewReservations") || "View Reservations"}>
                              <IconButton size="small" onClick={() => navigate(`/resources/${r.resourceId}/reservations`)} sx={{ color: "info.main" }}>
                                <CalendarMonth fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("adminRes.edit") || "Edit"}><IconButton size="small" onClick={() => handleOpenDialog(r)} sx={{ color: "primary.main" }}><Edit fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title={!r.isArchived ? (t("adminRes.archive") || "Archive") : (t("adminRes.unarchive") || "Unarchive")}><IconButton size="small" onClick={() => handleToggleArchive(r.resourceId, r.isArchived)} sx={{ color: r.isArchived ? "success.main" : "warning.main" }}>{r.isArchived ? <Add fontSize="small" /> : <Delete fontSize="small" />}</IconButton></Tooltip>
                            <Tooltip title={t("adminRes.deletePermanently") || "Delete Permanently"}><IconButton size="small" sx={{ color: "error.main" }} onClick={() => handleDeleteResource(r.resourceId)}><Delete fontSize="small" /></IconButton></Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 6, py: 12, textAlign: "center", border: "2px dashed rgba(255,255,255,0.08)", bgcolor: "transparent" }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <Box sx={{ width: 100, height: 100, borderRadius: "50%", bgcolor: "rgba(124,77,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Inventory2 sx={{ fontSize: 50, color: "rgba(124,77,255,0.3)" }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {isPersonalMode ? (t("adminRes.noListings") || "No listings yet") : (t("adminRes.noResourcesFound") || "No resources found in platform")}
              </Typography>
              <Typography variant="body1" color="grey.500" sx={{ maxWidth: 400, mx: "auto" }}>
                {isPersonalMode 
                  ? (t("adminRes.startSharing") || "Start sharing your items with others! Once you create your first listing, it will appear here.") 
                  : (t("adminRes.databaseEmpty") || "The platform's database is currently empty of resources.")}
              </Typography>
            </Box>
            {isPersonalMode && (
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<Add />} 
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2, background: "linear-gradient(135deg, #7C4DFF, #651FFF)", borderRadius: 3, px: 4 }}
              >
                {t("adminRes.createFirstListing") || "Create First Listing"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, bgcolor: "#121212", backgroundImage: "none", border: "1px solid rgba(255,255,255,0.08)" } }}>
        <DialogTitle sx={{ pb: 0, pt: 4, px: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5" fontWeight={900}>{editId ? (t("adminRes.editResource") || "Edit Resource") : (t("adminRes.addNewResource") || "Add New Resource")}</Typography>
            <Typography variant="caption" sx={{ color: "grey.600", fontWeight: 700 }}>{t("adminRes.step") || "STEP"} {activeStep + 1} {t("adminRes.of") || "OF"} 3</Typography>
          </Box>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, "& .MuiStepLabel-label": { mt: 1, fontSize: "0.75rem", fontWeight: 700, color: "grey.600" } }}>
            {[
              t("adminRes.step1") || "Basics",
              t("adminRes.step2") || "Details & Media",
              t("adminRes.step3") || "Availability"
            ].map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 2 }}>
          {renderStepContent(activeStep)}
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 5, pt: 3, gap: 2 }}>
          {activeStep === 0 ? (
            <Button onClick={() => setDialogOpen(false)} sx={{ color: "grey.500" }}>{t("adminRes.cancelBtn") || "Cancel"}</Button>
          ) : (
            <Button startIcon={<NavigateBefore />} onClick={handleBack} sx={{ color: "grey.500" }}>{t("adminRes.backBtn") || "Back"}</Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" endIcon={<NavigateNext />} onClick={handleNext} sx={{ px: 4, borderRadius: 3, fontWeight: 700, background: "linear-gradient(135deg, #7C4DFF, #651FFF)" }}>
              {t("adminRes.continueBtn") || "Continue"}
            </Button>
          ) : (
            <Button variant="contained" startIcon={<CheckCircle />} onClick={handleSaveResource} disabled={saving} sx={{ px: 4, borderRadius: 3, fontWeight: 900, background: "linear-gradient(135deg, #00E5FF, #00B0FF)", color: "#000" }}>
              {saving ? <CircularProgress size={24} color="inherit" /> : (t("adminRes.finishPost") || "Finish & Post")}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2000, flexDirection: "column", gap: 3 }} open={saving}>
        <CircularProgress color="primary" thickness={5} size={60} />
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>{t("adminRes.savingDetails") || "Saving listing details..."}</Typography>
      </Backdrop>
    </Box>
  );
}


