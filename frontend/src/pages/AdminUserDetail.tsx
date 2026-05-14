import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Button, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Grid, Snackbar, Alert, DialogContentText
} from "@mui/material";
import { ArrowBack, Add, Delete } from "@mui/icons-material";
import axios from "axios";
import { useI18n } from "../context/I18nContext";

export default function AdminUserDetail() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [openPenaltyDialog, setOpenPenaltyDialog] = useState(false);
  const [newPenaltyReason, setNewPenaltyReason] = useState("");
  const [newPenaltyPoints, setNewPenaltyPoints] = useState("1");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<{open: boolean, penaltyId: string | null}>({open: false, penaltyId: null});

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/users/${id}`, {
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleAddPenalty = async () => {
    try {
      await axios.post(`http://localhost:3000/users/${id}/penalties`, {
        reason: newPenaltyReason,
        points: parseInt(newPenaltyPoints)
      }, { withCredentials: true });
      
      setOpenPenaltyDialog(false);
      setNewPenaltyReason("");
      setNewPenaltyPoints("1");
      setOpenSnackbar(true);
      fetchUserDetails();
    } catch (error) {
      console.error("Error adding penalty:", error);
    }
  };

  const handleDeletePenalty = async () => {
    if (deleteDialogData.penaltyId) {
      try {
        await axios.delete(`http://localhost:3000/users/${id}/penalties/${deleteDialogData.penaltyId}`, {
          withCredentials: true
        });
        setDeleteDialogData({open: false, penaltyId: null});
        fetchUserDetails();
      } catch (error) {
        console.error("Error deleting penalty:", error);
      }
    }
  };

  if (!user) return <Typography>Cargando...</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate("/admin/users")} sx={{ mb: 2 }}>
        {t("adminUserDetail.back")}
      </Button>

      <Typography variant="h4" gutterBottom>{t("adminUserDetail.title")}</Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">{t("adminUsers.name")}</Typography>
              <Typography variant="body1">{user.fullName || "N/A"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">{t("adminUsers.email")}</Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">{t("adminUsers.username")}</Typography>
              <Typography variant="body1">{user.username}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">{t("adminUsers.role")}</Typography>
              <Chip label={user.role} color={user.role === "ADMIN" ? "secondary" : "default"} size="small" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h5" sx={{ mb: 2 }}>{t("adminUserDetail.penaltyHistory")}</Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpenPenaltyDialog(true)}>
              {t("adminUserDetail.addPenalty")}
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("adminUserDetail.date")}</TableCell>
                  <TableCell>{t("adminUserDetail.reason")}</TableCell>
                  <TableCell>{t("adminUserDetail.points")}</TableCell>
                  <TableCell align="right">{t("adminUsers.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {user.penalties.map((p: any) => (
                  <TableRow key={p.penaltyId}>
                    <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{p.reason}</TableCell>
                    <TableCell>{p.points}</TableCell>
                    <TableCell align="right">
                      <Button size="small" color="error" onClick={() => setDeleteDialogData({open: true, penaltyId: p.penaltyId})}>
                        <Delete fontSize="small" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {user.penalties.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">{t("adminUserDetail.noPenalties")}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Typography variant="h5" sx={{ mb: 2 }}>{t("adminUserDetail.bookingHistory")}</Typography>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("adminUserDetail.resource")}</TableCell>
                  <TableCell>{t("adminUserDetail.date")}</TableCell>
                  <TableCell>{t("adminUserDetail.timeRange")}</TableCell>
                  <TableCell>{t("adminUserDetail.status")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {user.reservations.map((r: any) => (
                  <TableRow key={r.reservationId}>
                    <TableCell>{r.resource?.name}</TableCell>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      <Chip label={r.status} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
                {user.reservations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">{t("adminUserDetail.noBookings")}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog for new penalty */}
      <Dialog open={openPenaltyDialog} onClose={() => setOpenPenaltyDialog(false)}>
        <DialogTitle>{t("adminUserDetail.addPenaltyTitle")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("adminUserDetail.reason")}
            type="text"
            fullWidth
            variant="outlined"
            value={newPenaltyReason}
            onChange={(e) => setNewPenaltyReason(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label={t("adminUserDetail.points")}
            type="number"
            fullWidth
            variant="outlined"
            value={newPenaltyPoints}
            onChange={(e) => setNewPenaltyPoints(e.target.value)}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPenaltyDialog(false)}>{t("adminUserDetail.cancel")}</Button>
          <Button onClick={handleAddPenalty} variant="contained" disabled={!newPenaltyReason}>
            {t("adminUserDetail.add")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for delete confirmation */}
      <Dialog open={deleteDialogData.open} onClose={() => setDeleteDialogData({open: false, penaltyId: null})}>
        <DialogTitle>{t("adminUserDetail.deleteTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("adminUserDetail.deleteMsg")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogData({open: false, penaltyId: null})}>{t("adminUserDetail.cancel")}</Button>
          <Button onClick={handleDeletePenalty} color="error" variant="contained">
            {t("adminUserDetail.deleteBtn")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success feedback */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {t("adminUserDetail.successAddMsg")}
        </Alert>
      </Snackbar>
    </Box>
  );
}
