import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Chip, IconButton, Tooltip, Button,
} from "@mui/material";
import { Delete, Refresh, EventNote } from "@mui/icons-material";
import { useI18n } from "../context/I18nContext";

export default function MyReservations() {
  const { t } = useI18n();
  const [reservations, setReservations] = useState<any[]>([]);

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
                  {["Resource", "Date", "Start Time", "End Time", "Deposit", "Actions"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: "grey.400" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((r) => {
                  const rName = r.resource?.name || "Unknown Resource";
                  const rDeposit = r.resource?.deposit || 0;
                  
                  const dateStr = new Date(r.date).toLocaleDateString();
                  const startStr = new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
                  const endStr = new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

                  return (
                    <TableRow key={r.reservationId} sx={{ "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}>
                      <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><EventNote sx={{ color: "primary.main", fontSize: 20 }} />{rName}</Box></TableCell>
                      <TableCell>{dateStr}</TableCell>
                      <TableCell>{startStr}</TableCell>
                      <TableCell>{endStr}</TableCell>
                      <TableCell>€{rDeposit}</TableCell>
                      <TableCell>
                        <Tooltip title="Cancel Booking"><IconButton size="small" onClick={() => handleCancel(r.reservationId)} sx={{ color: "error.main" }}><Delete fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
