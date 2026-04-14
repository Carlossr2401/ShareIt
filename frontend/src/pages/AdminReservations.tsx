import { useState } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Chip, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, type SelectChangeEvent,
} from "@mui/material";
import { Search, EventNote } from "@mui/icons-material";
import { useI18n } from "../context/I18nContext";

const reservations = [
  { id: 1, user: "Carlos López", resource: "Conference Room A", date: "Mar 18, 2026", time: "10:00 – 12:00", status: "Confirmed", price: 2.00, deposit: 5.00 },
  { id: 2, user: "María García", resource: "Projector Epson #1", date: "Mar 19, 2026", time: "14:00 – 16:00", status: "Pending", price: 1.00, deposit: 2.00 },
  { id: 3, user: "Alex Johnson", resource: "Laptop Dell #7", date: "Mar 20, 2026", time: "09:00 – 13:00", status: "Confirmed", price: 0.00, deposit: 10.00 },
  { id: 4, user: "Sara Martínez", resource: "Van Mercedes", date: "Mar 15, 2026", time: "08:00 – 18:00", status: "Completed", price: 15.00, deposit: 50.00 },
  { id: 5, user: "David Chen", resource: "Classroom 101", date: "Mar 12, 2026", time: "11:00 – 13:00", status: "Cancelled", price: 5.00, deposit: 10.00 },
  { id: 6, user: "Laura Kim", resource: "Conference Room B", date: "Mar 21, 2026", time: "15:00 – 17:00", status: "Confirmed", price: 2.00, deposit: 5.00 },
  { id: 7, user: "James Wilson", resource: "Whiteboard Mobile #2", date: "Mar 22, 2026", time: "10:00 – 11:00", status: "Pending", price: 0.00, deposit: 5.00 },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  Confirmed: { bg: "rgba(105,240,174,0.12)", color: "#69F0AE" },
  Pending: { bg: "rgba(255,215,64,0.12)", color: "#FFD740" },
  Cancelled: { bg: "rgba(255,82,82,0.12)", color: "#FF5252" },
  Completed: { bg: "rgba(0,229,255,0.12)", color: "#00E5FF" },
};

export default function AdminReservations() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const statusKey: Record<string, string> = { Confirmed: "reservations.confirmed", Pending: "reservations.pending", Completed: "reservations.completed", Cancelled: "reservations.cancelled" };

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
            <MenuItem value="Confirmed">{t("reservations.confirmed")}</MenuItem>
            <MenuItem value="Pending">{t("reservations.pending")}</MenuItem>
            <MenuItem value="Completed">{t("reservations.completed")}</MenuItem>
            <MenuItem value="Cancelled">{t("reservations.cancelled")}</MenuItem>
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
                    <TableCell><Chip label={t(statusKey[r.status])} size="small" sx={{ backgroundColor: statusColors[r.status].bg, color: statusColors[r.status].color, fontWeight: 600 }} /></TableCell>
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
