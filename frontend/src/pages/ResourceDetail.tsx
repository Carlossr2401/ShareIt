import {
  Box, Typography, Card, CardContent, Grid, Button, Chip,
  TextField, MenuItem, Divider,
} from "@mui/material";
import { ArrowBack, MeetingRoom, CalendarMonth, AccessTime, CheckCircle } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

const mockResource = {
  name: "Conference Room A", type: "Room", location: "Building 1, Floor 2",
  capacity: "12 people", fee: "€2.00",
  description: "A modern conference room equipped with a projector, sound system, and whiteboard. Ideal for meetings, presentations, and workshops.",
  amenities: ["Projector", "Whiteboard", "Sound System", "Wi-Fi", "Air Conditioning"],
};

const timeSlots = [
  { time: "08:00 – 09:00", available: true }, { time: "09:00 – 10:00", available: false },
  { time: "10:00 – 11:00", available: true }, { time: "11:00 – 12:00", available: true },
  { time: "12:00 – 13:00", available: false }, { time: "13:00 – 14:00", available: true },
  { time: "14:00 – 15:00", available: true }, { time: "15:00 – 16:00", available: false },
  { time: "16:00 – 17:00", available: true }, { time: "17:00 – 18:00", available: true },
];

export default function ResourceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  void id;
  const { t } = useI18n();

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate("/resources")} sx={{ mb: 2, color: "grey.400" }}>{t("detail.back")}</Button>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,77,255,0.15)", color: "#7C4DFF" }}><MeetingRoom fontSize="large" /></Box>
                <Box><Typography variant="h5">{mockResource.name}</Typography><Typography variant="body2" color="grey.500">{mockResource.location}</Typography></Box>
              </Box>
              <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.06)" }} />
              <Typography variant="body1" color="grey.300" sx={{ mb: 2 }}>{mockResource.description}</Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <Chip label={`${t("resources.type")}: ${mockResource.type}`} variant="outlined" sx={{ borderColor: "#7C4DFF", color: "#7C4DFF" }} />
                <Chip label={`${t("detail.capacity")}: ${mockResource.capacity}`} variant="outlined" sx={{ borderColor: "#00E5FF", color: "#00E5FF" }} />
                <Chip label={`${t("resources.deposit")}: ${mockResource.fee}`} variant="outlined" sx={{ borderColor: "#69F0AE", color: "#69F0AE" }} />
              </Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "grey.400" }}>{t("detail.amenities")}</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {mockResource.amenities.map((a) => <Chip key={a} label={a} size="small" sx={{ backgroundColor: "rgba(255,255,255,0.06)" }} />)}
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}><AccessTime sx={{ color: "secondary.main" }} /> {t("detail.timeSlots")}</Typography>
              <Typography variant="body2" color="grey.500" sx={{ mb: 2 }}>{t("detail.timeSlotsHint")}</Typography>
              <Grid container spacing={1.5}>
                {timeSlots.map((slot) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={slot.time}>
                    <Button fullWidth variant={slot.available ? "outlined" : "text"} disabled={!slot.available}
                      sx={{ py: 1.5, borderColor: slot.available ? "primary.main" : "transparent", color: slot.available ? "primary.light" : "grey.700", "&:hover": slot.available ? { backgroundColor: "rgba(124,77,255,0.12)" } : {} }}>
                      {slot.time}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ position: "sticky", top: 80 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}><CalendarMonth sx={{ color: "primary.main" }} /> {t("detail.bookThis")}</Typography>
              <TextField fullWidth label={t("detail.date")} type="date" defaultValue="2026-03-18" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField fullWidth select label={t("detail.startTime")} defaultValue="10:00" sx={{ mb: 2 }}>
                {["08:00","10:00","11:00","13:00","14:00","16:00","17:00"].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
              <TextField fullWidth select label={t("detail.endTime")} defaultValue="12:00" sx={{ mb: 2 }}>
                {["09:00","11:00","12:00","14:00","15:00","17:00","18:00"].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
              <TextField fullWidth label={t("detail.notes")} multiline rows={2} sx={{ mb: 3 }} />
              <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="grey.500">{t("detail.refundableDeposit")}</Typography>
                <Typography variant="body2" fontWeight={600}>{mockResource.fee}</Typography>
              </Box>
              <Typography variant="caption" color="grey.600" sx={{ display: "block", mb: 3 }}>{t("detail.depositNote")}</Typography>
              <Button fullWidth variant="contained" size="large" startIcon={<CheckCircle />}
                sx={{ py: 1.5, background: "linear-gradient(135deg, #7C4DFF, #651FFF)", "&:hover": { background: "linear-gradient(135deg, #9C7CFF, #7C4DFF)" } }}>
                {t("detail.confirm")}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
