import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, CircularProgress,
} from "@mui/material";
import {
  MeetingRoom, Laptop, EventAvailable, AccountBalanceWallet,
  TrendingUp, CalendarMonth,
} from "@mui/icons-material";
import type { Prisma } from "../../../backend/node_modules/@prisma/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import { useUser } from "../context/UserContext";
import axios from "axios";

// Definimos un tipo que incluye la relación con el recurso, tal como lo envía Prisma
type ReservationWithResource = Prisma.ReservationGetPayload<{
  include: { resource: true }
}>;

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { userName } = useUser();

  const [statsData, setStatsData] = useState({
    resourcesCount: 0,
    activeReservations: 0,
    equipmentInUse: 0,
    balance: 0
  });

  // Usamos el tipo extendido para evitar errores de "property does not exist"
  const [recentReservations, setRecentReservations] = useState<ReservationWithResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Asegúrate de que las URLs coincidan con tu backend de Node/Laragon
        const [resResources, resMyReservations, resProfile] = await Promise.all([
          axios.get("http://localhost:3000/resources", { withCredentials: true }),
          axios.get("http://localhost:3000/reservations/me", { withCredentials: true }),
          axios.get("http://localhost:3000/auth/me", { withCredentials: true })
        ]);

        setStatsData({
          resourcesCount: resResources.data.length,
          activeReservations: resMyReservations.data.length,
          equipmentInUse: 0, 
          balance: resProfile.data?.wallet || 0
        });

        setRecentReservations(resMyReservations.data.slice(0, 3));
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    { label: t("dashboard.availableResources"), value: statsData.resourcesCount.toString(), icon: <MeetingRoom />, color: "#7C4DFF" },
    { label: t("dashboard.activeReservations"), value: statsData.activeReservations.toString(), icon: <EventAvailable />, color: "#00E5FF" },
    { label: t("dashboard.equipmentInUse"), value: statsData.equipmentInUse.toString(), icon: <Laptop />, color: "#FFD740" },
    { label: t("dashboard.walletBalance"), value: `€${statsData.balance.toFixed(2)}`, icon: <AccountBalanceWallet />, color: "#69F0AE" },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

 return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Cabecera del Dashboard */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          {t("dashboard.welcome")} <span style={{ color: "#7C4DFF" }}>{userName}</span> 👋
        </Typography>
        <Typography variant="body1" color="grey.500">
          {t("dashboard.overview")}
        </Typography>
      </Box>

      {/* Bloque de Estadísticas (4 Cuadros Iguales) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center',
                transition: "transform 0.2s, box-shadow 0.2s", 
                "&:hover": { 
                  transform: "translateY(-4px)", 
                  boxShadow: `0 8px 24px ${stat.color}22` 
                } 
              }}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, width: '100%', py: 2.5 }}>
                <Box sx={{ 
                  width: 52, 
                  height: 52, 
                  minWidth: 52, // Crucial para que el círculo no se deforme
                  borderRadius: 3, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  background: `${stat.color}18`, 
                  color: stat.color 
                }}>
                  {stat.icon}
                </Box>
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="grey.500" sx={{ whiteSpace: 'nowrap' }}>
                    {stat.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Grid Inferior: Acciones y Reservas */}
      <Grid container spacing={3}>
        {/* Columna Izquierda: Acciones Rápidas */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1, fontWeight: 600 }}>
                <TrendingUp sx={{ color: "primary.main" }} /> {t("dashboard.quickActions")}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<MeetingRoom />} 
                  onClick={() => navigate("/resources")} 
                  fullWidth 
                  sx={{ py: 1.2, borderRadius: 2 }}
                >
                  {t("dashboard.browseResources")}
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<EventAvailable />} 
                  onClick={() => navigate("/reservations")} 
                  fullWidth 
                  sx={{ py: 1.2, borderRadius: 2 }}
                >
                  {t("dashboard.myReservations")}
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<AccountBalanceWallet />} 
                  onClick={() => navigate("/wallet")} 
                  fullWidth 
                  sx={{ py: 1.2, borderRadius: 2 }}
                >
                  {t("dashboard.topUpWallet")}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Columna Derecha: Reservas Recientes */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1, fontWeight: 600 }}>
                <CalendarMonth sx={{ color: "secondary.main" }} /> {t("dashboard.recentReservations")}
              </Typography>
              
              {recentReservations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography color="grey.600">No tienes reservas recientes</Typography>
                </Box>
              ) : (
                recentReservations.map((res, i) => (
                  <Box 
                    key={res.reservation_id || i} 
                    sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      py: 2, 
                      borderBottom: i < recentReservations.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" 
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary' }}>
                        {res.resource?.name || "Recurso"}
                      </Typography>
                      <Typography variant="body2" color="grey.500">
                        {new Date(res.date).toLocaleDateString()} · {new Date(res.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Chip 
                      label={new Date(res.date) < new Date() ? "Finalizada" : "Confirmada"} 
                      size="small" 
                      sx={{ 
                        backgroundColor: new Date(res.date) < new Date() ? "rgba(255,255,255,0.05)" : "rgba(105,240,174,0.12)", 
                        color: new Date(res.date) < new Date() ? "grey.500" : "#69F0AE", 
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }} 
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}