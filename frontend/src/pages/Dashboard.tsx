import {
  Box, Typography, Grid, Card, CardContent, Button, Chip,
} from "@mui/material";
import {
  MeetingRoom, Laptop, EventAvailable, AccountBalanceWallet,
  TrendingUp, CalendarMonth,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import { useUser } from "../context/UserContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { userName } = useUser();

  const stats = [
    { label: t("dashboard.availableResources"), value: "24", icon: <MeetingRoom />, color: "#7C4DFF" },
    { label: t("dashboard.activeReservations"), value: "8", icon: <EventAvailable />, color: "#00E5FF" },
    { label: t("dashboard.equipmentInUse"), value: "12", icon: <Laptop />, color: "#FFD740" },
    { label: t("dashboard.walletBalance"), value: "€45.00", icon: <AccountBalanceWallet />, color: "#69F0AE" },
  ];

  const recentReservations = [
    { resource: "Conference Room A", date: "Mar 18, 2026", time: "10:00 – 12:00", status: "Confirmed" },
    { resource: "Projector #3", date: "Mar 19, 2026", time: "14:00 – 16:00", status: "Pending" },
    { resource: "Laptop Dell #7", date: "Mar 20, 2026", time: "09:00 – 13:00", status: "Confirmed" },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t("dashboard.welcome")} <span style={{ color: "#7C4DFF" }}>{userName}</span> 👋
        </Typography>
        <Typography variant="body1" color="grey.500">{t("dashboard.overview")}</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
            <Card sx={{ transition: "transform 0.2s, box-shadow 0.2s", "&:hover": { transform: "translateY(-4px)", boxShadow: `0 8px 24px ${stat.color}22` } }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ width: 52, height: 52, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", background: `${stat.color}18`, color: stat.color }}>{stat.icon}</Box>
                <Box>
                  <Typography variant="h5">{stat.value}</Typography>
                  <Typography variant="body2" color="grey.500">{stat.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUp sx={{ color: "primary.main" }} /> {t("dashboard.quickActions")}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Button variant="contained" startIcon={<MeetingRoom />} onClick={() => navigate("/resources")} fullWidth>{t("dashboard.browseResources")}</Button>
                <Button variant="outlined" startIcon={<EventAvailable />} onClick={() => navigate("/reservations")} fullWidth>{t("dashboard.myReservations")}</Button>
                <Button variant="outlined" startIcon={<AccountBalanceWallet />} onClick={() => navigate("/wallet")} fullWidth>{t("dashboard.topUpWallet")}</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarMonth sx={{ color: "secondary.main" }} /> {t("dashboard.recentReservations")}
              </Typography>
              {recentReservations.map((res, i) => (
                <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderBottom: i < recentReservations.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>{res.resource}</Typography>
                    <Typography variant="body2" color="grey.500">{res.date} · {res.time}</Typography>
                  </Box>
                  <Chip label={res.status} size="small" sx={{ backgroundColor: res.status === "Confirmed" ? "rgba(105,240,174,0.12)" : "rgba(255,215,64,0.12)", color: res.status === "Confirmed" ? "#69F0AE" : "#FFD740", fontWeight: 600 }} />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
