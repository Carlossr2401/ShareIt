import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Chip, Button, CircularProgress,
  Divider, IconButton, Tooltip
} from "@mui/material";
import { ArrowBack, CalendarMonth, Person, AccessTime, Payments } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import dayjs from "dayjs";

export default function ResourceReservations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResourceReservations = async () => {
      try {
        const res = await fetch(`http://localhost:3000/resources/${id}`, {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setResource(data);
        }
      } catch (error) {
        console.error("Error fetching reservations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResourceReservations();
  }, [id]);

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  if (!resource) return <Box sx={{ p: 4 }}><Typography color="error">Resource not found.</Typography></Box>;

  const reservations = resource.reservations || [];

  return (
    <Box>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate("/my-listings")} 
        sx={{ mb: 3, color: "grey.400" }}
      >
        {t("detail.back") || "Back to Listings"}
      </Button>

      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>Reservations for <span style={{ color: "#7C4DFF" }}>{resource.name}</span></Typography>
          <Typography variant="body1" color="grey.500">View all bookings and occupants for this resource.</Typography>
        </Box>
        <Chip 
          label={`${reservations.length} total bookings`} 
          variant="outlined" 
          sx={{ borderColor: "rgba(124,77,255,0.3)", color: "#7C4DFF", fontWeight: 700, p: 1.5 }} 
        />
      </Box>

      {reservations.length === 0 ? (
        <Card sx={{ borderRadius: 6, py: 10, textAlign: "center", border: "2px dashed rgba(255,255,255,0.08)", bgcolor: "transparent" }}>
          <CardContent>
            <Typography variant="h6" color="grey.600">No reservations found yet for this resource.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "grey.400" }}>Occupant</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "grey.400" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "grey.400" }}>Slot</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "grey.400" }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "grey.400" }}>Payment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((res: any) => {
                  const startTime = new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                  const endTime = new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                  const isPast = dayjs(res.date).isBefore(dayjs(), 'day');

                  return (
                    <TableRow key={res.reservationId} sx={{ "&:hover": { bgcolor: "rgba(124,77,255,0.04)" } }}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "rgba(124,77,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "primary.main" }}>
                            <Person fontSize="small" />
                          </Box>
                          <Typography fontWeight={700}>{res.user?.fullName || "Unknown User"}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "grey.300" }}>
                          <CalendarMonth fontSize="small" sx={{ color: "primary.main" }} />
                          <Typography fontWeight={600}>{dayjs(res.date).format("MMM D, YYYY")}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "grey.400" }}>
                          <AccessTime fontSize="small" />
                          <Typography variant="body2">{startTime} - {endTime}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={800} color="#69F0AE">€{res.total_amount?.toFixed(2) || "0.00"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={res.paymentMethod || "WALLET"} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            fontSize: "0.7rem", 
                            fontWeight: 800, 
                            borderRadius: 1.5,
                            borderColor: res.paymentMethod === "CARD" ? "rgba(0,229,255,0.2)" : "rgba(124,77,255,0.2)",
                            color: res.paymentMethod === "CARD" ? "#00E5FF" : "#7C4DFF"
                          }} 
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
