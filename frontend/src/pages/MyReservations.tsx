import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Chip, IconButton, Tooltip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { Delete, Refresh, EventNote, QrCode2 } from "@mui/icons-material";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "../context/I18nContext";

export default function MyReservations() {
  const { t } = useI18n();
  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedQrReservation, setSelectedQrReservation] = useState<any>(null);

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
          { label: "Total Bookings", count: reservations.length, color: "#7C4DFF" },
        ].map((s) => (
          <Card key={s.label} sx={{ flex: 1, minWidth: 130 }}>
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="h5" sx={{ color: s.color }}>{s.count}</Typography>
              <Typography variant="body2" color="grey.500">{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {["Resource", "Date", "Time Range", "Status", "Payment", "Total", "Actions"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: "grey.400" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((r) => {
                  const rName = r.resource?.name || "Unknown Resource";
                  const rTotal = r.total_amount || ( (r.resource?.deposit || 0) + (r.resource?.price || 0) );
                  
                  const dateStr = new Date(r.date).toLocaleDateString();
                  const startStr = new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                  const endStr = new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

                  return (
                    <TableRow key={r.reservationId} sx={{ "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}>
                      <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><EventNote sx={{ color: "primary.main", fontSize: 20 }} />{rName}</Box></TableCell>
                      <TableCell>{dateStr}</TableCell>
                      <TableCell>{startStr} - {endStr}</TableCell>
                      <TableCell>
                        <Chip 
                          label={r.status || "PENDING"} 
                          size="small" 
                          sx={{ 
                            fontSize: "0.7rem", 
                            fontWeight: 700,
                            bgcolor: r.status === "CHECKED_IN" ? "rgba(105,240,174,0.1)" : "rgba(255,215,64,0.1)",
                            color: r.status === "CHECKED_IN" ? "#69F0AE" : "#FFD740",
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={r.paymentMethod || "WALLET"} 
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
