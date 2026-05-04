import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Chip, IconButton, Tooltip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab
} from "@mui/material";
import { Delete, Refresh, EventNote, QrCode2 } from "@mui/icons-material";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "../context/I18nContext";

export default function MyReservations() {
  const { t } = useI18n();
  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedQrReservation, setSelectedQrReservation] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  const getReservationDates = (r: any) => {
    const rDate = new Date(r.date);
    const rStart = new Date(r.startTime);
    const rEnd = new Date(r.endTime);
    
    const actualStart = new Date(rDate.getUTCFullYear(), rDate.getUTCMonth(), rDate.getUTCDate(), rStart.getUTCHours(), rStart.getUTCMinutes());
    const actualEnd = new Date(rDate.getUTCFullYear(), rDate.getUTCMonth(), rDate.getUTCDate(), rEnd.getUTCHours(), rEnd.getUTCMinutes());
    return { actualStart, actualEnd };
  };

  const now = new Date();
  const upcomingReservations = reservations.filter(r => getReservationDates(r).actualStart > now);
  const activeReservations = reservations.filter(r => {
    const { actualStart, actualEnd } = getReservationDates(r);
    return actualStart <= now && actualEnd >= now;
  });
  const pastReservations = reservations.filter(r => getReservationDates(r).actualEnd < now);

  const getDisplayedReservations = () => {
    if (tabValue === 0) return upcomingReservations;
    if (tabValue === 1) return activeReservations;
    return pastReservations;
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch("http://localhost:3000/reservations/me", {
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3000/reservations/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        fetchReservations();
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box><Typography variant="h4" gutterBottom>{t("reservations.title") || "My Reservations"}</Typography><Typography variant="body1" color="grey.500">{t("reservations.subtitle") || "Manage your bookings"}</Typography></Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchReservations}>{t("reservations.refresh") || "Refresh"}</Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[
          { label: t("reservations.upcoming") || "Upcoming", count: upcomingReservations.length, color: "#00E5FF" },
          { label: t("reservations.active") || "Active", count: activeReservations.length, color: "#69F0AE" },
          { label: t("reservations.past") || "Past", count: pastReservations.length, color: "#7C4DFF" },
        ].map((s) => (
          <Card key={s.label} sx={{ flex: 1, minWidth: 130 }}>
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="h5" sx={{ color: s.color }}>{s.count}</Typography>
              <Typography variant="body2" color="grey.500">{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)} 
          aria-label="reservation tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label={t("reservations.upcomingTab") || "Upcoming"} />
          <Tab label={t("reservations.activeTab") || "Active"} />
          <Tab label={t("reservations.pastTab") || "Past"} />
        </Tabs>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    t("reservations.resource") || "Resource",
                    t("reservations.date") || "Date",
                    t("reservations.timeRange") || "Time Range",
                    t("reservations.status") || "Status",
                    t("reservations.payment") || "Payment",
                    t("reservations.total") || "Total",
                    t("reservations.actions") || "Actions"
                  ].map((h, i) => (
                    <TableCell key={i} sx={{ fontWeight: 600, color: "grey.400" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {getDisplayedReservations().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: "grey.500" }}>
                      {t("reservations.noData") || "No reservations found in this category."}
                    </TableCell>
                  </TableRow>
                )}
                {getDisplayedReservations().map((r) => {
                  const rName = r.resource?.name || "Unknown Resource";
                  const rTotal = r.total_amount || ( (r.resource?.deposit || 0) + (r.resource?.price || 0) );
                  
                  const dateStr = new Date(r.date).toLocaleDateString();
                  const startStr = new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                  const endStr = new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

                  const { actualStart, actualEnd } = getReservationDates(r);
                  const isActive = actualStart <= now && actualEnd >= now;
                  const isPast = actualEnd < now;
                  const isUpcoming = actualStart > now;

                  let derivedStatus = r.status || "PENDING";
                  if (derivedStatus === "PENDING") {
                    if (isPast) derivedStatus = "PAST";
                    else if (isActive) derivedStatus = "ACTIVE";
                    else if (isUpcoming) derivedStatus = "UPCOMING";
                  }

                  let statusColor = "rgba(255,215,64,0.1)";
                  let statusTextColor = "#FFD740";
                  if (derivedStatus === "CHECKED_IN" || derivedStatus === "ACTIVE") {
                    statusColor = "rgba(105,240,174,0.1)";
                    statusTextColor = "#69F0AE";
                  } else if (derivedStatus === "UPCOMING") {
                    statusColor = "rgba(0,229,255,0.1)";
                    statusTextColor = "#00E5FF";
                  } else if (derivedStatus === "PAST" || derivedStatus === "FINISHED") {
                    statusColor = "rgba(124,77,255,0.1)";
                    statusTextColor = "#7C4DFF";
                  } else if (derivedStatus === "CANCELLED") {
                    statusColor = "rgba(255,82,82,0.1)";
                    statusTextColor = "#FF5252";
                  }

                  return (
                    <TableRow key={r.reservationId} sx={{ "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}>
                      <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><EventNote sx={{ color: "primary.main", fontSize: 20 }} />{rName}</Box></TableCell>
                      <TableCell>{dateStr}</TableCell>
                      <TableCell>{startStr} - {endStr}</TableCell>
                      <TableCell>
                        <Chip 
                          label={t(`status.${derivedStatus.toLowerCase()}`) || derivedStatus} 
                          size="small" 
                          sx={{ 
                            fontSize: "0.7rem", 
                            fontWeight: 700,
                            bgcolor: statusColor,
                            color: statusTextColor,
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={r.paymentMethod === "CARD" ? (t("detail.cardLabel") || "CARD") : (t("detail.walletLabel") || "WALLET")} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            fontSize: "0.7rem", 
                            fontWeight: 700, 
                            borderColor: r.paymentMethod === "CARD" ? "#00E5FF" : "#7C4DFF",
                            color: r.paymentMethod === "CARD" ? "#00E5FF" : "#7C4DFF",
                            bgcolor: r.paymentMethod === "CARD" ? "rgba(0,229,255,0.05)" : "rgba(124,77,255,0.05)"
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#69F0AE" }}>€{rTotal}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Show Check-in QR">
                            <IconButton size="small" onClick={() => setSelectedQrReservation(r)} sx={{ color: "primary.main" }}>
                              <QrCode2 fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel Booking">
                            <IconButton size="small" onClick={() => handleCancel(r.reservationId)} sx={{ color: "error.main" }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={!!selectedQrReservation} onClose={() => setSelectedQrReservation(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QrCode2 color="primary" /> Reservation QR
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 4 }}>
          {selectedQrReservation && (
            <>
              <Box sx={{ bgcolor: "white", p: 2, borderRadius: 2, mb: 3 }}>
                <QRCodeSVG value={`http://localhost:5173/checkin/${selectedQrReservation.reservationId}`} size={200} />
              </Box>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                {selectedQrReservation.resource?.name}
              </Typography>
              <Typography variant="body2" color="grey.400" textAlign="center">
                Scan this QR code with the device at the resource to confirm your check-in.
              </Typography>
              {selectedQrReservation.status === "CHECKED_IN" && (
                <Chip label="ALREADY CHECKED IN" color="success" sx={{ mt: 2, fontWeight: 700 }} />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedQrReservation(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
