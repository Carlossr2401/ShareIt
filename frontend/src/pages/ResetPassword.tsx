import { useState } from "react";
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Alert, CircularProgress, Container, InputAdornment, IconButton
} from "@mui/material";
import { Lock, Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useI18n();
  
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Validar campos
    if (!email || !resetToken || !newPassword || !confirmPassword) {
      setError(t("auth.allFieldsRequired") || "Todos los campos son requeridos");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordsMismatch") || "Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 12) {
      setError(t("auth.passwordLengthError") || "La contraseña debe tener entre 6 y 12 caracteres");
      setLoading(false);
      return;
    }

    if (/\s/.test(newPassword)) {
      setError(t("auth.passwordSpaceError") || "La contraseña no puede contener espacios");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(t("auth.passwordResetSuccess") || "Contraseña actualizada exitosamente");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.error || t("auth.resetError") || "Error al resetear la contraseña");
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
              <Lock sx={{ fontSize: 32, color: "primary.main" }} />
              <Typography variant="h5" fontWeight={700}>
                {t("auth.resetPassword") || "Reset Password"}
              </Typography>
            </Box>

            <Typography variant="body2" color="grey.400" sx={{ mb: 3 }}>
              {t("auth.resetPasswordDesc") || "Enter your email, reset token, and new password."}
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

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label={t("auth.emailLabel") || "Email"}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
                inputProps={{ autoComplete: "email" }}
              />

              <TextField
                fullWidth
                label={t("auth.resetTokenLabel") || "Reset Token"}
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
                helperText={t("auth.resetTokenHelper") || "Paste the token from the email or reset request"}
              />

              <TextField
                fullWidth
                label={t("auth.newPasswordLabel") || "New Password"}
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
                inputProps={{ autoComplete: "new-password" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label={t("auth.confirmPasswordLabel") || "Confirm Password"}
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                sx={{ mb: 3 }}
                inputProps={{ autoComplete: "new-password" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm(!showConfirm)}
                        edge="end"
                        disabled={loading}
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading || !email || !resetToken || !newPassword || !confirmPassword}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} /> : (t("auth.resetPasswordBtn") || "Reset Password")}
              </Button>
            </form>

            <Typography variant="body2" color="grey.500" align="center" sx={{ mt: 3 }}>
              {t("auth.needHelp") || "Need help?"}{" "}
              <Typography
                component="span"
                sx={{ color: "primary.main", cursor: "pointer", fontWeight: 700 }}
                onClick={() => navigate("/forgot-password")}
              >
                {t("auth.requestNewToken") || "Request a new token"}
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
