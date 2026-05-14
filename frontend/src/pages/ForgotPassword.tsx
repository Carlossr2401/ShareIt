import { useState } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Alert, CircularProgress, Container
} from "@mui/material";
import { Email, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mockToken, setMockToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setMockToken(null);

    try {
      const res = await fetch("http://localhost:3000/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(t("auth.resetRequestSent") || "Si tu email existe, recibirás un enlace para resetear tu contraseña.");
        // Mock: mostrar el token en desarrollo
        if (data.resetToken) {
          setMockToken(data.resetToken);
        }
        setEmail("");
      } else {
        setError(data.error || t("auth.resetRequestError") || "Error al procesar la solicitud");
      }
    } catch (err) {
      setError(t("auth.networkError") || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/login")}
          sx={{ alignSelf: "flex-start", mb: 3, color: "grey.400" }}
        >
          {t("auth.backToLogin") || "Back to Login"}
        </Button>

        <Card sx={{ width: "100%", borderRadius: 3, border: "1px solid rgba(255,255,255,0.1)" }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Email sx={{ fontSize: 32, color: "primary.main" }} />
              <Typography variant="h5" fontWeight={700}>
                {t("auth.forgotPassword") || "Forgot Password?"}
              </Typography>
            </Box>

            <Typography variant="body2" color="grey.400" sx={{ mb: 3 }}>
              {t("auth.forgotPasswordDesc") || "Enter your email and we'll send you a link to reset your password."}
            </Typography>

            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {mockToken && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                  [MOCK] Reset Token:
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    wordBreak: "break-all",
                    display: "block",
                    p: 1,
                    bgcolor: "rgba(0,0,0,0.3)",
                    borderRadius: 1,
                    fontFamily: "monospace",
                  }}
                >
                  {mockToken}
                </Typography>
                <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                  Copy this token and use it in the reset form.
                </Typography>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label={t("auth.emailLabel") || "Email"}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                sx={{ mb: 3 }}
                inputProps={{ autoComplete: "email" }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading || !email}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} /> : (t("auth.sendReset") || "Send Reset Link")}
              </Button>
            </form>

            <Typography variant="body2" color="grey.500" align="center" sx={{ mt: 3 }}>
              {t("auth.rememberPassword") || "Remember your password?"}{" "}
              <Typography
                component="span"
                sx={{ color: "primary.main", cursor: "pointer", fontWeight: 700 }}
                onClick={() => navigate("/login")}
              >
                {t("auth.loginHere") || "Login here"}
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
