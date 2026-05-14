import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Chip, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, type SelectChangeEvent,
} from "@mui/material";
import { Search, EventNote } from "@mui/icons-material";
import { useI18n } from "../context/I18nContext";
import axios from "axios";

const statusColors: Record<string, { bg: string; color: string }> = {
  CONFIRMED: { bg: "rgba(105,240,174,0.12)", color: "#69F0AE" },
  PENDING: { bg: "rgba(255,215,64,0.12)", color: "#FFD740" },
  CANCELLED: { bg: "rgba(255,82,82,0.12)", color: "#FF5252" },
  FINISHED: { bg: "rgba(0,229,255,0.12)", color: "#00E5FF" },
  CHECKED_IN: { bg: "rgba(178,255,89,0.12)", color: "#B2FF59" }
};

export default function AdminReservations() {
  const { t } = useI18n();
  const [reservations, setReservations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const statusKey: Record<string, string> = { 
    CONFIRMED: "status.confirmed", 
    PENDING: "status.pending", 
    FINISHED: "status.finished", 
    CANCELLED: "status.cancelled",
    CHECKED_IN: "status.checked_in"
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/reservations`, {
        withCredentials: true
      });
      
      const mapped = response.data.map((r: any) => ({
        id: r.reservationId,
        user: r.user?.fullName || r.user?.username || r.user?.email || "Desconocido",
        resource: r.resource?.name || "Recurso eliminado",
        date: new Date(r.date).toLocaleDateString(),
        time: `${new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        status: r.status,
        price: r.resource?.price || 0,
        deposit: r.resource?.deposit || 0
      }));

      setReservations(mapped);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const filtered = reservations.filter((r) => {
    const matchSearch = r.user.toLowerCase().includes(search.toLowerCase()) || r.resource.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t("adminBook.title")}</Typography>
      <Typography variant="body1" color="grey.500" sx={{ mb: 3 }}>{t("adminBook.subtitle")}</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField placeholder={t("adminBook.search")} value={search} onChange={(e) => setSearch(e.target.value)} size="small" sx={{ minWidth: 280 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: "grey.600" }} /></InputAdornment> } }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t("adminBook.status")}</InputLabel>
          <Select value={statusFilter} label={t("adminBook.status")} onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}>
            <MenuItem value="All">{t("adminBook.all")}</MenuItem>
            <MenuItem value="CONFIRMED">{t("status.confirmed")}</MenuItem>
            <MenuItem value="PENDING">{t("status.pending")}</MenuItem>
            <MenuItem value="CHECKED_IN">{t("status.checked_in")}</MenuItem>
            <MenuItem value="FINISHED">{t("status.finished")}</MenuItem>
            <MenuItem value="CANCELLED">{t("status.cancelled")}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[t("adminBook.user"), t("adminBook.resource"), t("adminBook.date"), t("adminBook.time"), "Price", "Deposit", "Total", t("adminBook.status")].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: "grey.400" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} sx={{ "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}>
                    <TableCell>{r.user}</TableCell>
                    <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><EventNote sx={{ color: "primary.main", fontSize: 18 }} />{r.resource}</Box></TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.time}</TableCell>
                    <TableCell>€{r.price.toFixed(2)}</TableCell>
                    <TableCell>€{r.deposit.toFixed(2)}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "primary.light" }}>€{(r.price + r.deposit).toFixed(2)}</TableCell>
                    <TableCell>
                      {statusColors[r.status] ? (
                        <Chip label={t(statusKey[r.status])} size="small" sx={{ backgroundColor: statusColors[r.status].bg, color: statusColors[r.status].color, fontWeight: 600 }} />
                      ) : (
                        <Chip label={r.status} size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
