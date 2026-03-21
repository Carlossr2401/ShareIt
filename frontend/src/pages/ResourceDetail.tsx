import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  TextField, Divider, CircularProgress, Alert
} from "@mui/material";
import { ArrowBack, MeetingRoom, CalendarMonth, AccessTime, CheckCircle } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function ResourceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useI18n();

  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
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
    setErrorStatus(null);
    setSuccessStatus(null);

    try {
      const res = await fetch("http://localhost:3000/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit", // The backend needs cookies if configured, otherwise might need another auth header
        // Since backend requires req.cookies.access_token we MUST include credentials
        // Wait, earlier the user logged in and received a cookie via Supabase. We must use `credentials: "include"`
        body: JSON.stringify({
          resource_id: id,
          date,
          start_time: startTime + ":00",
          end_time: endTime + ":00"
        })
      });

      // Override for Include
      res.clone();
    } catch (e) { } // Ignore 
    
    // Proper Call
    try {
      const res = await fetch("http://localhost:3000/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({
          resource_id: id,
          date,
          start_time: startTime + ":00",
          end_time: endTime + ":00"
        })
      });

      if (res.ok) {
        setSuccessStatus("Reservation created successfully!");
      } else {
        const data = await res.json();
        setErrorStatus(data.error || "Error creating reservation");
      }
    } catch (error) {
      setErrorStatus("Network error occurred");
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (!resource) return <Typography color="error">Resource not found.</Typography>;

  const rType = resource.category || "Room";

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate("/resources")} sx={{ mb: 2, color: "grey.400" }}>{t("detail.back") || "Back"}</Button>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,77,255,0.15)", color: "#7C4DFF" }}><MeetingRoom fontSize="large" /></Box>
                <Box><Typography variant="h5">{resource.name}</Typography><Typography variant="body2" color="grey.500">{resource.location}</Typography></Box>
              </Box>
              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />
              <Typography variant="body1" color="grey.300" sx={{ mb: 2 }}>{resource.description || "No description provided."}</Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <Chip label={`Type: ${rType}`} variant="outlined" sx={{ borderColor: "#7C4DFF", color: "#7C4DFF" }} />
                <Chip label={`Deposit: €${resource.deposit || 0}`} variant="outlined" sx={{ borderColor: "#69F0AE", color: "#69F0AE" }} />
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}><AccessTime sx={{ color: "secondary.main" }} /> Availability rules</Typography>
              <Grid container spacing={1.5}>
                {resource.availabilities && resource.availabilities.length > 0 ? (
                  resource.availabilities.map((slot: any) => {
                    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                    const dayString = days[slot.day_of_week];
                    const startRaw = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                    const endRaw = new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                    return (
                      <Grid item xs={12} sm={6} key={slot.availability_id}>
                        <Button fullWidth variant="outlined" sx={{ py: 1.5, borderColor: "primary.main", color: "primary.light" }}>
                          {dayString}: {startRaw} - {endRaw}
                        </Button>
                      </Grid>
                    )
                  })
                ) : (
                  <Typography variant="body2" color="grey.500">No strict rules defined. You can book any time.</Typography>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ position: "sticky", top: 80 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}><CalendarMonth sx={{ color: "primary.main" }} /> {t("detail.bookThis") || "Book this resource"}</Typography>
              
              {errorStatus && <Alert severity="error" sx={{ mb: 2 }}>{errorStatus}</Alert>}
              {successStatus && <Alert severity="success" sx={{ mb: 2 }}>{successStatus}</Alert>}

              <TextField fullWidth label={t("detail.date") || "Date"} type="date" value={date} onChange={e => setDate(e.target.value)} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
              <TextField fullWidth type="time" label={t("detail.startTime") || "Start Time"} value={startTime} onChange={e => setStartTime(e.target.value)} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
              <TextField fullWidth type="time" label={t("detail.endTime") || "End Time"} value={endTime} onChange={e => setEndTime(e.target.value)} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
              
              <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="grey.500">{t("detail.refundableDeposit") || "Deposit"}</Typography>
                <Typography variant="body2" fontWeight={600}>€{resource.deposit || 0}</Typography>
              </Box>
              <Button fullWidth variant="contained" size="large" startIcon={<CheckCircle />} onClick={handleBook}
                sx={{ mt: 2, py: 1.5, background: "linear-gradient(135deg, #7C4DFF, #651FFF)", "&:hover": { background: "linear-gradient(135deg, #9C7CFF, #7C4DFF)" } }}>
                {t("detail.confirm") || "Confirm Booking"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
