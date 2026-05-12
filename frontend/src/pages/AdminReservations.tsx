import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Chip, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel, type SelectChangeEvent,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Snackbar, Alert, CircularProgress,
} from "@mui/material";
import { Search, EventNote, WarningAmber } from "@mui/icons-material";
import { useI18n } from "../context/I18nContext";

interface Reservation {
  reservationId: string;
  userId: string;
  resourceId: string;
  user?: { username: string; email: string };
  resource?: { name: string; price: number; deposit: number };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  total_amount: number;
  isDamaged: boolean;
  damageReason?: string;
  damagePenalty: number;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "rgba(255,215,64,0.12)", color: "#FFD740" },
  CHECKED_IN: { bg: "rgba(0,229,255,0.12)", color: "#00E5FF" },
  COMPLETED: { bg: "rgba(105,240,174,0.12)", color: "#69F0AE" },
  CANCELLED: { bg: "rgba(255,82,82,0.12)", color: "#FF5252" },
};

export default function AdminReservations() {
  const { t } = useI18n();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [damageDialog, setDamageDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [damageReason, setDamageReason] = useState("");
  const [damagePenalty, setDamagePenalty] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reservations/", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (!response.ok) throw new Error("Error al obtener reservas");
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error al cargar reservas",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDamaged = async () => {
    if (!selectedReservation || !damagePenalty) {
      setSnackbar({
        open: true,
        message: "La penalización es obligatoria",
        severity: "error",
      });
      return;
    }

    setApplying(true);
    try {
      const response = await fetch(`/api/reservations/${selectedReservation.reservationId}/damage`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          damageReason: damageReason || "Dañado/Sucio",
          damagePenalty: parseFloat(damagePenalty),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al marcar como dañado");
      }

      const updatedReservation = await response.json();
      setReservations(
        reservations.map(r =>
          r.reservationId === updatedReservation.reservation.reservationId
            ? updatedReservation.reservation
            : r
        )
      );

      setSnackbar({
        open: true,
        message: `Penalización de €${damagePenalty} aplicada a ${selectedReservation.user?.username || "usuario"}`,
        severity: "success",
      });

      setDamageDialog(false);
      setDamageReason("");
      setDamagePenalty("");
      setSelectedReservation(null);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : "Error al marcar como dañado",
        severity: "error",
      });
    } finally {
      setApplying(false);
    }
  };

  const filtered = reservations.filter((r) => {
    const matchSearch =
      (r.user?.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.resource?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(`2000-01-01T${timeStr}`);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t("adminBook.title")}</Typography>
      <Typography variant="body1" color="grey.500" sx={{ mb: 3 }}>{t("adminBook.subtitle")}</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder={t("adminBook.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "grey.600" }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t("adminBook.status")}</InputLabel>
          <Select
            value={statusFilter}
            label={t("adminBook.status")}
            onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">{t("adminBook.all")}</MenuItem>
            <MenuItem value="PENDING">Pendiente</MenuItem>
            <MenuItem value="CHECKED_IN">Check-in</MenuItem>
            <MenuItem value="COMPLETED">Completada</MenuItem>
            <MenuItem value="CANCELLED">Cancelada</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: "grey.400" }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "grey.400" }}>Recurso</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "grey.400" }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "grey.400" }}>Horario</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "grey.400" }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "grey.400" }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "grey.400" }}>Daño</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "grey.400" }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow
                      key={r.reservationId}
                      sx={{ "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}
                    >
                      <TableCell>{r.user?.username || "-"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <EventNote sx={{ color: "primary.main", fontSize: 18 }} />
                          {r.resource?.name || "-"}
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {formatTime(r.startTime)} - {formatTime(r.endTime)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "primary.light" }}>
                        €{r.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.status}
                          size="small"
                          sx={{
                            backgroundColor: statusColors[r.status]?.bg || "grey.200",
                            color: statusColors[r.status]?.color || "grey.600",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {r.isDamaged ? (
                          <Chip
                            icon={<WarningAmber />}
                            label={`Daño: €${r.damagePenalty}`}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(255,82,82,0.12)",
                              color: "#FF5252",
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="grey.500">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {!r.isDamaged && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => {
                              setSelectedReservation(r);
                              setDamageDialog(true);
                            }}
                          >
                            Marcar Daño
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={damageDialog} onClose={() => setDamageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmber sx={{ color: "warning.main" }} />
          Marcar Artículo como Dañado/Sucio
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="grey.700">
                Reserva: {selectedReservation?.resource?.name}
              </Typography>
              <Typography variant="body2" color="grey.600">
                Usuario: {selectedReservation?.user?.username}
              </Typography>
            </Box>
            <TextField
              label="Motivo del daño"
              placeholder="ej. Rayones, manchas, etc."
              value={damageReason}
              onChange={(e) => setDamageReason(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Penalización (€)"
              type="number"
              value={damagePenalty}
              onChange={(e) => setDamagePenalty(e.target.value)}
              inputProps={{ step: "0.01", min: "0" }}
              fullWidth
              required
              helperText="Cantidad a descontar de la billetera del usuario"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDamageDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleMarkDamaged}
            variant="contained"
            color="warning"
            disabled={applying || !damagePenalty}
          >
            {applying ? <CircularProgress size={20} /> : "Aplicar Penalización"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
