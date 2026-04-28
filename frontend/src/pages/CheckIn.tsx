import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent, CircularProgress, Button, Alert } from "@mui/material";
import { CheckCircle, ErrorOutline, QrCodeScanner, Home } from "@mui/icons-material";

export default function CheckIn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [reservation, setReservation] = useState<any>(null);

  useEffect(() => {
    const processCheckIn = async () => {
      try {
        const res = await fetch(`http://localhost:3000/reservations/${id}/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Check-in successful! The reservation has been confirmed.");
          setReservation(data.reservation);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to process check-in.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Network error occurred while processing check-in.");
      }
    };

    if (id) {
      processCheckIn();
    }
  }, [id]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", p: 2 }}>
      <Card sx={{ maxWidth: 400, width: "100%", borderRadius: 4, textAlign: "center", boxShadow: "0 12px 24px rgba(0,0,0,0.2)" }}>
        <Box sx={{ bgcolor: "rgba(124,77,255,0.1)", p: 3, display: "flex", justifyContent: "center" }}>
          <QrCodeScanner sx={{ fontSize: 60, color: "primary.main" }} />
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={900} gutterBottom>
            Reservation Check-In
          </Typography>

          {status === "loading" && (
            <Box sx={{ py: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography color="grey.500">Processing scan...</Typography>
            </Box>
          )}

          {status === "success" && (
            <Box sx={{ py: 2 }}>
              <CheckCircle sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
              <Typography variant="h6" color="success.main" fontWeight={700} gutterBottom>
                {message}
              </Typography>
              {reservation && (
                <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Typography variant="body2" color="grey.400">Reservation ID:</Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ mb: 1, wordBreak: "break-all" }}>{reservation.reservationId}</Typography>
                  <Typography variant="body2" color="grey.400">Status:</Typography>
                  <Typography variant="body1" fontWeight={700} color="success.main">CHECKED IN</Typography>
                </Box>
              )}
            </Box>
          )}

          {status === "error" && (
            <Box sx={{ py: 2 }}>
              <ErrorOutline sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
              <Alert severity="error" sx={{ mb: 2 }}>
                {message}
              </Alert>
            </Box>
          )}

          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<Home />} 
            onClick={() => navigate("/")}
            sx={{ mt: 3, borderRadius: 2, py: 1.5, fontWeight: 700 }}
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
