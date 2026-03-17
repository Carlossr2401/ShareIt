import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Chip, IconButton, Tooltip, Button,
} from "@mui/material";
import { Edit, Delete, Refresh, EventNote } from "@mui/icons-material";
import { useI18n } from "../context/I18nContext";

const reservations = [
  { id: 1, resource: "Conference Room A", type: "Room", date: "Mar 18, 2026", time: "10:00 – 12:00", status: "Confirmed", deposit: "€2.00" },
  { id: 2, resource: "Projector Epson #1", type: "Projector", date: "Mar 19, 2026", time: "14:00 – 16:00", status: "Pending", deposit: "€1.00" },
  { id: 3, resource: "Laptop Dell #7", type: "Laptop", date: "Mar 20, 2026", time: "09:00 – 13:00", status: "Confirmed", deposit: "€1.50" },
  { id: 4, resource: "Van Mercedes", type: "Vehicle", date: "Mar 15, 2026", time: "08:00 – 18:00", status: "Completed", deposit: "€5.00" },
  { id: 5, resource: "Classroom 101", type: "Room", date: "Mar 12, 2026", time: "11:00 – 13:00", status: "Cancelled", deposit: "€3.00" },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  Confirmed: { bg: "rgba(105,240,174,0.12)", color: "#69F0AE" },
  Pending: { bg: "rgba(255,215,64,0.12)", color: "#FFD740" },
  Cancelled: { bg: "rgba(255,82,82,0.12)", color: "#FF5252" },
  Completed: { bg: "rgba(0,229,255,0.12)", color: "#00E5FF" },
};

export default function MyReservations() {
  const { t } = useI18n();
  const statusKey: Record<string, string> = { Confirmed: "reservations.confirmed", Pending: "reservations.pending", Completed: "reservations.completed", Cancelled: "reservations.cancelled" };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box><Typography variant="h4" gutterBottom>{t("reservations.title")}</Typography><Typography variant="body1" color="grey.500">{t("reservations.subtitle")}</Typography></Box>
        <Button variant="outlined" startIcon={<Refresh />}>{t("reservations.refresh")}</Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[
          { label: t("reservations.total"), count: reservations.length, color: "#7C4DFF" },
          { label: t("reservations.confirmed"), count: reservations.filter(r => r.status === "Confirmed").length, color: "#69F0AE" },
          { label: t("reservations.pending"), count: reservations.filter(r => r.status === "Pending").length, color: "#FFD740" },
          { label: t("reservations.completed"), count: reservations.filter(r => r.status === "Completed").length, color: "#00E5FF" },
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
                  {[t("reservations.resource"), t("reservations.type"), t("reservations.date"), t("reservations.time"), t("reservations.depositCol"), t("reservations.status")].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: "grey.400" }}>{h}</TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 600, color: "grey.400" }} align="right">{t("reservations.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((r) => (
                  <TableRow key={r.id} sx={{ "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}>
                    <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><EventNote sx={{ color: "primary.main", fontSize: 20 }} />{r.resource}</Box></TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.time}</TableCell>
                    <TableCell>{r.deposit}</TableCell>
                    <TableCell><Chip label={t(statusKey[r.status])} size="small" sx={{ backgroundColor: statusColors[r.status].bg, color: statusColors[r.status].color, fontWeight: 600 }} /></TableCell>
                    <TableCell align="right">
                      {(r.status === "Confirmed" || r.status === "Pending") && (
                        <>
                          <Tooltip title={t("reservations.modify")}><IconButton size="small" sx={{ color: "primary.light" }}><Edit fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title={t("reservations.cancel")}><IconButton size="small" sx={{ color: "error.main" }}><Delete fontSize="small" /></IconButton></Tooltip>
                        </>
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
