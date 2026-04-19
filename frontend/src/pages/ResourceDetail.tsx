import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Button, Chip,
  Divider, CircularProgress, Alert, Paper, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { ArrowBack, MeetingRoom, Laptop, Tv, DirectionsCar, Brush, CalendarMonth, AccessTime, CheckCircle } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import type { Prisma } from "../../../backend/node_modules/.prisma/client";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import dayjs from "dayjs";

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
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedSlot, setSelectedSlot] = useState<any>(null); // Leaving any as type is complex from Prisma
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
          resourceId: id,
          date,
          startTime: formatTime(selectedSlot.startTime),
          endTime: formatTime(selectedSlot.endTime)
        })
      });

      if (res.ok) {
        setSuccessStatus("Reservation created successfully!");
        setTimeout(() => navigate("/reservations"), 1500);
      } else {
        const data = await res.json();
        setErrorStatus(data.error || "Error creating reservation");
      }
    } catch {
      setErrorStatus("Network error occurred");
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (!resource) return <Box sx={{ p: 4 }}><Typography color="error">Resource not found.</Typography></Box>;

  const rType = resource.category || "Room";
  const selectedDayOfWeek = dayjs(date).day(); // 0 is Sunday, 1 is Monday...

  // Filter slots for the selected day of week
  const availableSlots = resource.availabilities?.filter((slot: any) => slot.dayOfWeek === selectedDayOfWeek) || [];

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate("/resources")} sx={{ mb: 2, color: "grey.400" }}>{t("detail.back") || "Back"}</Button>
      
      <Grid container spacing={3}>
        {/* Left: Resource Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3, borderRadius: 4, overflow: "hidden" }}>
            {resource.photoUrls && (
              <Box sx={{ bgcolor: "black", overflow: "hidden" }}>
                {Array.isArray(resource.photoUrls) ? (
                  resource.photoUrls.length > 0 ? (
                    <Box sx={{ 
                      width: "100%", 
                      height: 400, 
                      display: "flex", 
                      overflowX: "auto", 
                      gap: 0.5,
                      '&::-webkit-scrollbar': { height: '6px' },
                      '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '3px' }
                    }}>
                      {resource.photoUrls.map((url: string, index: number) => (
                        <Box key={index} sx={{ flex: "0 0 auto", width: "100%", height: "100%" }}>
                          <img src={url} alt={`${resource.name} ${index}`} style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
                        </Box>
                      ))}
                    </Box>
                  ) : null
                ) : (
                  <Box sx={{ width: "100%", height: 400 }}>
                    <img src={resource.photoUrls} alt={resource.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Box>
                )}
              </Box>
            )}
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box sx={{ width: 64, height: 64, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", background: `${typeColors[rType] || "#7C4DFF"}22`, color: typeColors[rType] || "#7C4DFF" }}>
                  {typeIcons[rType] || typeIcons.Room}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800}>{resource.name}</Typography>
                  <Typography variant="body1" color="grey.500">{resource.location}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap" }}>
                <Chip label={rType} sx={{ bgcolor: `${typeColors[rType] || "#7C4DFF"}22`, color: typeColors[rType] || "#7C4DFF", fontWeight: 600 }} />
                <Chip label={`€${resource.price}/hour`} variant="outlined" sx={{ borderColor: "primary.main", color: "primary.main" }} />
                <Chip label={`€${resource.deposit} Deposit`} variant="outlined" sx={{ borderColor: "success.main", color: "success.main" }} />
              </Box>

              <Divider sx={{ my: 3, opacity: 0.1 }} />
              
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{t("detail.description") || "About this resource"}</Typography>
              <Typography variant="body1" color="grey.400" sx={{ mb: 3, lineHeight: 1.7 }}>{resource.description || "No description provided."}</Typography>
              
              {resource.rules && resource.rules.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5, color: "primary.light" }}>{t("detail.rules") || "Rules & Requirements"}</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {resource.rules.map((rule: string, i: number) => (
                      <Chip key={i} label={rule} size="small" sx={{ bgcolor: "rgba(255,255,255,0.05)", color: "grey.300" }} />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Booking Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", height: "fit-content" }}>
            <Box sx={{ p: 3, background: "linear-gradient(135deg, rgba(124,77,255,0.1), transparent)" }}>
              <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700 }}>
                <CalendarMonth sx={{ color: "primary.main" }} /> {t("detail.bookThis") || "Plan your reservation"}
              </Typography>
            </Box>

            <Box sx={{ p: 0, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={dayjs(date)}
                onChange={(newValue) => {
                  if (newValue) {
                    setDate(newValue.format('YYYY-MM-DD'));
                    setSelectedSlot(null);
                  }
                }}
                slotProps={{
                  actionBar: { actions: [] },
                  calendarHeader: { sx: { color: 'white' } },
                  day: {
                    sx: {
                      '&.Mui-selected': { backgroundColor: '#7C4DFF !important' },
                      color: 'white'
                    }
                  }
                }}
                sx={{
                  bgcolor: "transparent",
                  '.MuiPickersLayout-root': { bgcolor: 'transparent' },
                  '.MuiDateCalendar-root': { bgcolor: 'transparent', width: '100%', maxWidth: 'none' },
                  '.MuiDayCalendar-header': { justifyContent: 'space-around' },
                  '.MuiDayCalendar-weekContainer': { justifyContent: 'space-around' },
                  '.MuiPickersYearSelection-root': { color: 'white' },
                  '.MuiPickersMonthSelection-root': { color: 'white' }
                }}
              />
            </Box>

            <CardContent sx={{ p: 3 }}>
              {/* Slots Section Integrated */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: "grey.400", display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTime fontSize="small" sx={{ color: "primary.main" }} /> 
                  {t("detail.timeSlots") || "Step 2: Choose your time"} 
                  <Typography component="span" variant="caption" sx={{ ml: 'auto' }}>
                    {dayjs(date).format('dddd, MMM D')}
                  </Typography>
                </Typography>
                
                {availableSlots.length > 0 ? (
                  <Grid container spacing={1.5}>
                    {availableSlots.map((slot: any) => {
                      const startRaw = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                      const endRaw = new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                      const isActive = selectedSlot?.availabilityId === slot.availabilityId;

                      return (
                        <Grid size={{ xs: 6, sm: 4 }} key={slot.availabilityId}>
                          <Button 
                            fullWidth 
                            variant={isActive ? "contained" : "outlined"} 
                            onClick={() => setSelectedSlot(slot)}
                            sx={{ 
                              py: 1.5, 
                              borderRadius: 2.5,
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              borderColor: isActive ? "primary.main" : "rgba(255,255,255,0.1)",
                              background: isActive ? "linear-gradient(135deg, #7C4DFF, #651FFF)" : "rgba(255,255,255,0.03)",
                              color: isActive ? "white" : "grey.300",
                              "&:hover": {
                                borderColor: "primary.main",
                                backgroundColor: isActive ? undefined : "rgba(124,77,255,0.1)"
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
                  <Alert severity="info" variant="outlined" sx={{ borderRadius: 3, borderColor: "rgba(255,255,255,0.1)", color: "grey.400" }}>
                    {t("detail.noSlots") || "No slots available for this day. Please select another date."}
                  </Alert>
                )}
              </Box>

              {errorStatus && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errorStatus}</Alert>}
              {successStatus && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successStatus}</Alert>}

              {/* Price Breakdown */}
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: "rgba(255,255,255,0.03)", mb: 3, border: "1px solid rgba(255,255,255,0.05)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2" color="grey.500">Hourly Rate</Typography>
                  <Typography variant="body2" fontWeight={600}>€{resource.price || 0}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography variant="body2" color="grey.500">Security Deposit</Typography>
                  <Typography variant="body2" fontWeight={600}>€{resource.deposit || 0}</Typography>
                </Box>
                <Divider sx={{ mb: 1.5, opacity: 0.1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" fontWeight={700}>Total Due</Typography>
                  <Typography variant="h6" fontWeight={800} color="#69F0AE">€{(resource.deposit || 0) + (resource.price || 0)}</Typography>
                </Box>
              </Paper>

              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                disabled={!selectedSlot}
                startIcon={<CheckCircle />} 
                onClick={() => setConfirmOpen(true)}
                sx={{ 
                  py: 2, 
                  borderRadius: 3,
                  fontSize: "1rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #7C4DFF, #651FFF)", 
                  "&:hover": { background: "linear-gradient(135deg, #9C7CFF, #7C4DFF)" },
                  boxShadow: "0 12px 24px rgba(124, 77, 255, 0.4)",
                  textTransform: "none"
                }}
              >
                {t("detail.confirm") || "Book Resource"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            minWidth: 400,
            background: "linear-gradient(180deg, #1E1E2F 0%, #15151F 100%)",
            border: "1px solid rgba(124,77,255,0.2)",
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 2, pt: 3 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: "rgba(124,77,255,0.1)" }}>
            <CheckCircle sx={{ color: "#7C4DFF" }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>{t("detail.confirmTitle") || "Confirm Reservation"}</Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="grey.500">Resource</Typography>
              <Typography variant="body2" fontWeight={700}>{resource.name}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="grey.500">Date</Typography>
              <Typography variant="body2" fontWeight={700}>{dayjs(date).format('MMMM D, YYYY')}</Typography>
            </Box>
            {selectedSlot && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="grey.500">Time Slot</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {new Date(selectedSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                  {" - "}
                  {new Date(selectedSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 1, opacity: 0.1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight={600}>Total Payment</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: "#69F0AE" }}>€{(resource.price || 0) + (resource.deposit || 0)}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, mt: 1, gap: 2 }}>
          <Button
            fullWidth
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2.5, py: 1.2, borderColor: "rgba(255,255,255,0.15)", color: "grey.400" }}
          >
            {t("detail.cancel") || "Cancel"}
          </Button>
          <Button
            fullWidth
            onClick={() => { setConfirmOpen(false); handleBook(); }}
            variant="contained"
            sx={{
              borderRadius: 2.5,
              py: 1.2,
              fontWeight: 700,
              background: "linear-gradient(135deg, #7C4DFF, #651FFF)",
              "&:hover": { background: "linear-gradient(135deg, #9C7CFF, #7C4DFF)" },
            }}
          >
            {t("detail.confirmBtn") || "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

