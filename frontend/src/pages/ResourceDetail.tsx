import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Divider, CircularProgress, Alert, Paper, Grid
} from "@mui/material";
import { ArrowBack, MeetingRoom, Laptop, Tv, DirectionsCar, Brush, CalendarMonth, AccessTime, CheckCircle } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import type { Prisma } from "../../../backend/node_modules/.prisma/client";

type ResourceWithRelations = Prisma.ResourceGetPayload<{
  include: { availabilities: true }
}>;

const typeIcons: Record<string, React.ReactNode> = {
  Room: <MeetingRoom fontSize="large" />, 
  Laptop: <Laptop fontSize="large" />, 
  Projector: <Tv fontSize="large" />, 
  Vehicle: <DirectionsCar fontSize="large" />, 
  Whiteboard: <Brush fontSize="large" />,
};

const typeColors: Record<string, string> = {
  Room: "#7C4DFF", Laptop: "#00E5FF", Projector: "#FFD740", Vehicle: "#69F0AE", Whiteboard: "#FF80AB",
};

export default function ResourceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useI18n();

  const [resource, setResource] = useState<ResourceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await fetch(`http://localhost:3000/resources/${id}`);
        if (res.ok) {
          const data = await res.json();
          setResource(data);
        }
      } catch (error) {
        console.error("Error fetching resource:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  const handleBook = async () => {
    if (!selectedSlot || !date) {
      setErrorStatus("Please select a date and an available time slot.");
      return;
    }

    setErrorStatus(null);
    setSuccessStatus(null);

    const formatTime = (isoString: string) => {
      const d = new Date(isoString);
      return d.getUTCHours().toString().padStart(2, '0') + ":" + 
             d.getUTCMinutes().toString().padStart(2, '0') + ":00";
  };

    try {
      const res = await fetch("http://localhost:3000/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({
          resource_id: id,
          date,
          start_time: formatTime(selectedSlot.start_time),
          end_time: formatTime(selectedSlot.end_time)
        })
      });

      if (res.ok) {
        setSuccessStatus("Reservation created successfully!");
        //setSelectedSlot(null);
        setTimeout(() => navigate("/reservations"), 1500);
      } else {
        const data = await res.json();
        setErrorStatus(data.error || "Error creating reservation");
      }
    } catch (error) {
      setErrorStatus("Network error occurred");
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (!resource) return <Box sx={{ p: 4 }}><Typography color="error">Resource not found.</Typography></Box>;

  const rType = resource.category || "Room";
  const selectedDayOfWeek = new Date(date).getUTCDay();

  // Filter slots for the selected day of week
  const availableSlots = resource.availabilities?.filter((slot: any) => slot.day_of_week === selectedDayOfWeek) || [];

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate("/resources")} sx={{ mb: 2, color: "grey.400" }}>{t("detail.back") || "Back"}</Button>
      
      <Grid container spacing={3}>
        {/* Left: Resource Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ mb: 3 }}>
            {resource.photo_urls && (
              <Box sx={{ bgcolor: "black", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
                {Array.isArray(resource.photo_urls) ? (
                  resource.photo_urls.length > 0 ? (
                    <Box sx={{ 
                      width: "100%", 
                      height: 400, 
                      display: "flex", 
                      overflowX: "auto", 
                      gap: 0.5,
                      '&::-webkit-scrollbar': { height: '6px' },
                      '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '3px' }
                    }}>
                      {resource.photo_urls.map((url: string, index: number) => (
                        <Box key={index} sx={{ flex: "0 0 auto", width: "100%", height: "100%" }}>
                          <img src={url} alt={`${resource.name} ${index}`} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
                        </Box>
                      ))}
                    </Box>
                  ) : null
                ) : (
                  <Box sx={{ width: "100%", height: 350 }}>
                    <img src={resource.photo_urls} alt={resource.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Box>
                )}
              </Box>
            )}
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", background: `${typeColors[rType] || "#7C4DFF"}22`, color: typeColors[rType] || "#7C4DFF" }}>
                  {typeIcons[rType] || typeIcons.Room}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{resource.name}</Typography>
                  <Typography variant="body2" color="grey.500">{resource.location}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />
              <Typography variant="body1" color="grey.300" sx={{ mb: 2 }}>{resource.description || "No description provided."}</Typography>
              
              {resource.rules && resource.rules.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: "primary.light" }}>{t("detail.rules") || "Rules & Requirements"}</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {resource.rules.map((rule: string, i: number) => (
                      <Chip key={i} label={rule} size="small" variant="outlined" sx={{ color: "grey.400", borderColor: "rgba(255,255,255,0.1)" }} />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 2, mb: 1, flexWrap: "wrap" }}>
                <Chip label={`Type: ${rType}`} variant="outlined" sx={{ borderColor: "#7C4DFF", color: "#7C4DFF" }} />
                <Chip label={`Deposit: €${resource.deposit || 0}`} variant="outlined" sx={{ borderColor: "#69F0AE", color: "#69F0AE" }} />
              </Box>
            </CardContent>
          </Card>

          {/* Slots Section */}
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTime sx={{ color: "primary.main" }} /> {t("detail.timeSlots") || "Available slots for your date"}
            </Typography>
            
            <Typography variant="body2" color="grey.500" sx={{ mb: 2 }}>
              Date: <strong>{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </Typography>

            {availableSlots.length > 0 ? (
              <Grid container spacing={2}>
                {availableSlots.map((slot: any) => {
                  const startRaw = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                  const endRaw = new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                  const isActive = selectedSlot?.availability_id === slot.availability_id;

                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={slot.availability_id}>
                      <Button 
                        fullWidth 
                        variant={isActive ? "contained" : "outlined"} 
                        onClick={() => setSelectedSlot(slot)}
                        sx={{ 
                          py: 2, 
                          borderRadius: 3,
                          transition: "0.2s",
                          borderColor: isActive ? "primary.main" : "rgba(124,77,255,0.3)",
                          background: isActive ? "linear-gradient(135deg, #7C4DFF, #651FFF)" : "transparent",
                          color: isActive ? "white" : "primary.light",
                          "&:hover": {
                            borderColor: "primary.main",
                            backgroundColor: isActive ? undefined : "rgba(124,77,255,0.08)"
                          }
                        }}
                      >
                        {startRaw} - {endRaw}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                No slots configured for this day of the week. Try another date.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right: Booking Actions */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ position: "sticky", top: 80, borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarMonth sx={{ color: "primary.main" }} /> {t("detail.bookThis") || "Choose Date & Book"}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: "grey.400" }}>Step 1: Select Date</Typography>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => { setDate(e.target.value); setSelectedSlot(null); }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "white",
                    fontSize: "1rem",
                    outline: "none"
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: "grey.400" }}>Step 2: Selected Slot</Typography>
                {selectedSlot ? (
                  <Chip 
                    label={`${new Date(selectedSlot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} - ${new Date(selectedSlot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}`} 
                    onDelete={() => setSelectedSlot(null)}
                    color="primary"
                    sx={{ width: "100%", py: 1, height: 'auto', borderRadius: 2, fontSize: "1rem" }}
                  />
                ) : (
                  <Typography variant="body2" color="grey.600">No slot selected yet.</Typography>
                )}
              </Box>
              
              {errorStatus && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{errorStatus}</Alert>}
              {successStatus && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{successStatus}</Alert>}

              <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />
              
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body1" color="grey.400">Total Deposit</Typography>
                <Typography variant="h6" fontWeight={700} color="#69F0AE">€{resource.deposit || 0}</Typography>
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                disabled={!selectedSlot}
                startIcon={<CheckCircle />} 
                onClick={handleBook}
                sx={{ 
                  py: 1.8, 
                  borderRadius: 3,
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #7C4DFF, #651FFF)", 
                  "&:hover": { background: "linear-gradient(135deg, #9C7CFF, #7C4DFF)" },
                  boxShadow: "0 8px 16px rgba(124, 77, 255, 0.3)"
                }}
              >
                {t("detail.confirm") || "Book Now"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
