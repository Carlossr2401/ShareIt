import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  type SelectChangeEvent,
} from "@mui/material";
import { Search, CalendarMonth, WarningAmber } from "@mui/icons-material";
import dayjs, { type Dayjs } from "dayjs";
import { useI18n } from "../context/I18nContext";

interface Reservation {
  reservationId: string;
  resourceId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  paymentMethod: string;
  total_amount: number;
  status: string;
  resource?: {
    name: string;
    category?: string;
  };
  user?: {
    username: string;
    fullName?: string;
    email: string;
  };
}

interface CalendarDay {
  date: Dayjs;
  reservations: Reservation[];
  isCurrentMonth: boolean;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "rgba(255,215,64,0.12)", color: "#FFD740" },
  CHECKED_IN: { bg: "rgba(0,229,255,0.12)", color: "#00E5FF" },
  COMPLETED: { bg: "rgba(105,240,174,0.12)", color: "#69F0AE" },
  CANCELLED: { bg: "rgba(255,82,82,0.12)", color: "#FF5252" },
};

export default function AdminMasterCalendar() {
  const { t } = useI18n();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [resourceFilter, setResourceFilter] = useState("All");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [resources, setResources] = useState<Set<string>>(new Set());
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/reservations`, {
        credentials: "include",
      });

      if (res.ok) {
        const data: Reservation[] = await res.json();
        setReservations(data);

        // Extract unique resources
        const uniqueResources = new Set<string>();
        data.forEach((r) => {
          if (r.resource?.name) {
            uniqueResources.add(r.resource.name);
          }
        });
        setResources(uniqueResources);
      } else {
        console.error("Failed to fetch reservations");
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSystem = async () => {
    try {
      setResetting(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/reservations/admin/reset`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setResetDialogOpen(false);
        await fetchReservations();
        alert(t("admin.masterCalendar.resetSuccess") || "System has been reset successfully! All reservations have been cleared.");
      } else {
        const error = await res.json();
        alert(t("admin.masterCalendar.resetError") || "Error resetting system: " + error.error);
      }
    } catch (error) {
      console.error("Error resetting system:", error);
      alert(t("admin.masterCalendar.resetError") || "Error resetting system");
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const generateCalendarDays = (): CalendarDay[] => {
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    const startDate = startOfMonth.startOf("week");
    const endDate = endOfMonth.endOf("week");

    const days: CalendarDay[] = [];
    let current = startDate;

    while (current.isBefore(endDate) || current.isSame(endDate)) {
      const dateStr = current.format("YYYY-MM-DD");
      const dayReservations = reservations.filter((r) => {
        const rDate = new Date(r.date).toISOString().split("T")[0];
        if (rDate !== dateStr) return false;

        const matchSearch =
          !search ||
          r.resource?.name.toLowerCase().includes(search.toLowerCase()) ||
          r.user?.username.toLowerCase().includes(search.toLowerCase()) ||
          r.user?.fullName?.toLowerCase().includes(search.toLowerCase());

        const matchStatus = statusFilter === "All" || r.status === statusFilter;
        const matchResource = resourceFilter === "All" || r.resource?.name === resourceFilter;

        return matchSearch && matchStatus && matchResource;
      });

      days.push({
        date: current,
        reservations: dayReservations,
        isCurrentMonth: current.isSame(currentMonth, "month"),
      });

      current = current.add(1, "day");
    }

    return days;
  };

  const getDisplayTimeFromDate = (timeStr: string): string => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  const calendarDays = generateCalendarDays();
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t("admin.masterCalendar.title") || "Master Calendar"}
          </Typography>
          <Typography variant="body1" color="grey.500">
            {t("admin.masterCalendar.subtitle") || "View all reservations across all resources"}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<WarningAmber />}
          onClick={() => setResetDialogOpen(true)}
          disabled={resetting}
        >
          {t("admin.masterCalendar.resetSystem") || "Reset System"}
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder={t("admin.masterCalendar.searchResources") || "Search resources or users"}
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
          <InputLabel>{t("admin.masterCalendar.status") || "Status"}</InputLabel>
          <Select
            value={statusFilter}
            label={t("admin.masterCalendar.status") || "Status"}
            onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="All">{t("admin.masterCalendar.allStatuses") || "All"}</MenuItem>
            <MenuItem value="PENDING">{t("reservations.pending") || "Pending"}</MenuItem>
            <MenuItem value="CHECKED_IN">{t("reservations.checkedIn") || "Checked In"}</MenuItem>
            <MenuItem value="COMPLETED">{t("reservations.completed") || "Completed"}</MenuItem>
            <MenuItem value="CANCELLED">{t("reservations.cancelled") || "Cancelled"}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t("admin.masterCalendar.resource") || "Resource"}</InputLabel>
          <Select
            value={resourceFilter}
            label={t("admin.masterCalendar.resource") || "Resource"}
            onChange={(e: SelectChangeEvent) => setResourceFilter(e.target.value)}
          >
            <MenuItem value="All">{t("admin.masterCalendar.allResources") || "All"}</MenuItem>
            {Array.from(resources).map((resource) => (
              <MenuItem key={resource} value={resource}>
                {resource}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Calendar View */}
      <Card>
        <CardContent>
          {/* Month Navigation */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Button onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}>←</Button>
            <Typography variant="h6">{currentMonth.format("MMMM YYYY")}</Typography>
            <Button onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}>→</Button>
          </Box>

          {loading ? (
            <Typography>{t("admin.masterCalendar.loading") || "Loading..."}</Typography>
          ) : (
            <>
              {/* Week Days Header */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
                {weekDays.map((day) => (
                  <Box key={day} sx={{ textAlign: "center", fontWeight: 600, color: "grey.600", py: 1 }}>
                    {day}
                  </Box>
                ))}
              </Box>

              {/* Calendar Days */}
              {weeks.map((week, weekIdx) => (
                <Box key={weekIdx} sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
                  {week.map((day, dayIdx) => (
                    <Box
                      key={`${weekIdx}-${dayIdx}`}
                      sx={{
                        minHeight: 120,
                        border: "1px solid",
                        borderColor: day.isCurrentMonth ? "divider" : "grey.200",
                        borderRadius: 1,
                        p: 1,
                        backgroundColor: day.isCurrentMonth
                          ? day.date.isSame(dayjs(), "day")
                            ? "rgba(124,77,255,0.05)"
                            : "transparent"
                          : "grey.50",
                        cursor: "pointer",
                        overflow: "hidden",
                        transition: "all 0.2s",
                        "&:hover": {
                          boxShadow: 1,
                          backgroundColor: day.isCurrentMonth
                            ? "rgba(124,77,255,0.1)"
                            : "grey.100",
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: day.isCurrentMonth ? "text.primary" : "grey.400",
                        }}
                      >
                        {day.date.format("D")}
                      </Typography>

                      <Box sx={{ mt: 0.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {day.reservations.slice(0, 2).map((res) => (
                          <Box
                            key={res.reservationId}
                            onClick={() => setSelectedReservation(res)}
                            sx={{
                              p: 0.5,
                              borderRadius: 0.5,
                              backgroundColor: statusColors[res.status]?.bg,
                              color: statusColors[res.status]?.color,
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                             whiteSpace: "nowrap",
                              cursor: "pointer",
                              "&:hover": { opacity: 0.8 },
                            }}
                          >
                            {res.resource?.name}
                          </Box>
                        ))}
                        {day.reservations.length > 2 && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "primary.main",
                              fontWeight: 600,
                              fontSize: "0.65rem",
                            }}
                          >
                            +{day.reservations.length - 2} más
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reservation Details Dialog */}
      {selectedReservation && (
        <Dialog open={!!selectedReservation} onClose={() => setSelectedReservation(null)} maxWidth="md" fullWidth>
          <DialogTitle>{t("admin.masterCalendar.reservationDetails") || "Reservation Details"}</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="grey.600">
                    {t("admin.masterCalendar.resource") || "Resource"}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedReservation.resource?.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="grey.600">
                    {t("admin.masterCalendar.user") || "User"}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedReservation.user?.fullName || selectedReservation.user?.username}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="grey.600">
                    {t("admin.masterCalendar.date") || "Date"}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {dayjs(selectedReservation.date).format("DD/MM/YYYY")}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="grey.600">
                    {t("admin.masterCalendar.time") || "Time"}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {getDisplayTimeFromDate(selectedReservation.startTime)} -{" "}
                    {getDisplayTimeFromDate(selectedReservation.endTime)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="grey.600">
                    {t("admin.masterCalendar.status") || "Status"}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedReservation.status}
                      size="small"
                      sx={{
                        backgroundColor: statusColors[selectedReservation.status]?.bg,
                        color: statusColors[selectedReservation.status]?.color,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="grey.600">
                    {t("admin.masterCalendar.totalAmount") || "Total Amount"}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "primary.light" }}>
                    €{selectedReservation.total_amount.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Typography variant="caption" color="grey.600">
                    {t("admin.masterCalendar.userEmail") || "User Email"}
                  </Typography>
                  <Typography variant="body2">{selectedReservation.user?.email}</Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedReservation(null)}>
              {t("admin.masterCalendar.close") || "Close"}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Reset System Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => !resetting && setResetDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "error.main" }}>
          <WarningAmber />
          {t("admin.masterCalendar.resetConfirm") || "Reset System"}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t("admin.masterCalendar.resetWarning") || "This action cannot be undone. All reservations will be permanently deleted."}
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t("admin.masterCalendar.resetDescription") || "This will clear all dummy bookings and reset the system to a fresh state. This is useful for starting a new demonstration."}
          </Typography>
          <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
            {t("admin.masterCalendar.resetDeleteCount") || `You are about to delete ${reservations.length} reservation(s).`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} disabled={resetting}>
            {t("admin.masterCalendar.cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handleResetSystem}
            color="error"
            variant="contained"
            disabled={resetting}
            startIcon={resetting ? <CircularProgress size={20} /> : undefined}
          >
            {resetting ? (t("admin.masterCalendar.resetting") || "Resetting...") : (t("admin.masterCalendar.deleteAll") || "Delete All")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Summary Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 2, mt: 3 }}>
        {[
          { label: t("reservations.pending") || "Pending", count: reservations.filter((r) => r.status === "PENDING").length, color: "#FFD740" },
          { label: t("reservations.checkedIn") || "Checked In", count: reservations.filter((r) => r.status === "CHECKED_IN").length, color: "#00E5FF" },
          { label: t("reservations.completed") || "Completed", count: reservations.filter((r) => r.status === "COMPLETED").length, color: "#69F0AE" },
          { label: t("reservations.cancelled") || "Cancelled", count: reservations.filter((r) => r.status === "CANCELLED").length, color: "#FF5252" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="h5" sx={{ color: stat.color }}>
                {stat.count}
              </Typography>
              <Typography variant="body2" color="grey.500">
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
