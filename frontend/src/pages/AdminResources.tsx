import { useState } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Button, IconButton, Tooltip,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from "@mui/material";
import { Add, Edit, Delete, MeetingRoom, Laptop, Tv, DirectionsCar, Brush } from "@mui/icons-material";
import { useI18n } from "../context/I18nContext";

const initialResources = [
  { id: 1, name: "Conference Room A", type: "Room", location: "Building 1, Floor 2", available: true, fee: "€2.00" },
  { id: 2, name: "Conference Room B", type: "Room", location: "Building 1, Floor 3", available: false, fee: "€2.00" },
  { id: 3, name: "Laptop Dell #7", type: "Laptop", location: "IT Office", available: true, fee: "€1.50" },
  { id: 4, name: "Laptop HP #3", type: "Laptop", location: "IT Office", available: true, fee: "€1.50" },
  { id: 5, name: "Projector Epson #1", type: "Projector", location: "Storage Room A", available: true, fee: "€1.00" },
  { id: 6, name: "Van Mercedes", type: "Vehicle", location: "Parking Lot B", available: true, fee: "€5.00" },
  { id: 7, name: "Whiteboard Mobile #2", type: "Whiteboard", location: "Building 2", available: true, fee: "€0.50" },
  { id: 8, name: "Classroom 101", type: "Room", location: "Building 3, Floor 1", available: true, fee: "€3.00" },
];

const typeIcons: Record<string, React.ReactNode> = {
  Room: <MeetingRoom fontSize="small" />, Laptop: <Laptop fontSize="small" />,
  Projector: <Tv fontSize="small" />, Vehicle: <DirectionsCar fontSize="small" />,
  Whiteboard: <Brush fontSize="small" />,
};
const typeColors: Record<string, string> = {
  Room: "#7C4DFF", Laptop: "#00E5FF", Projector: "#FFD740", Vehicle: "#69F0AE", Whiteboard: "#FF80AB",
};

export default function AdminResources() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useI18n();

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>{t("adminRes.title")}</Typography>
          <Typography variant="body1" color="grey.500">{t("adminRes.subtitle")}</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>{t("adminRes.add")}</Button>
      </Box>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[t("adminRes.resource"), t("adminRes.type"), t("adminRes.location"), t("adminRes.deposit"), t("adminRes.status")].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: "grey.400" }}>{h}</TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 600, color: "grey.400" }} align="right">{t("adminRes.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {initialResources.map((r) => (
                  <TableRow key={r.id} sx={{ "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}>
                    <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Box sx={{ color: typeColors[r.type] }}>{typeIcons[r.type]}</Box>{r.name}</Box></TableCell>
                    <TableCell><Chip label={r.type} size="small" variant="outlined" sx={{ borderColor: typeColors[r.type], color: typeColors[r.type] }} /></TableCell>
                    <TableCell>{r.location}</TableCell>
                    <TableCell>{r.fee}</TableCell>
                    <TableCell><Chip label={r.available ? t("resources.available") : t("resources.inUse")} size="small" sx={{ backgroundColor: r.available ? "rgba(105,240,174,0.12)" : "rgba(255,82,82,0.12)", color: r.available ? "#69F0AE" : "#FF5252", fontWeight: 600 }} /></TableCell>
                    <TableCell align="right">
                      <Tooltip title={t("adminRes.edit")}><IconButton size="small" sx={{ color: "primary.light" }}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title={t("adminRes.delete")}><IconButton size="small" sx={{ color: "error.main" }}><Delete fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("adminRes.dialogTitle")}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <TextField fullWidth label={t("adminRes.resName")} sx={{ mt: 1 }} />
          <TextField fullWidth select label={t("adminRes.type")} defaultValue="Room">
            <MenuItem value="Room">Room</MenuItem><MenuItem value="Laptop">Laptop</MenuItem>
            <MenuItem value="Projector">Projector</MenuItem><MenuItem value="Vehicle">Vehicle</MenuItem>
            <MenuItem value="Whiteboard">Whiteboard</MenuItem>
          </TextField>
          <TextField fullWidth label={t("adminRes.location")} />
          <TextField fullWidth label={t("adminRes.depositFee")} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>{t("adminRes.cancelBtn")}</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>{t("adminRes.addBtn")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
