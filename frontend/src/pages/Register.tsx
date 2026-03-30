import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  MeetingRoom,
  Badge,
  Info,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    bio: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrarse");
      }

      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0A0E1A 0%, #1a1040 50%, #0A0E1A 100%)",
        position: "relative",
        overflow: "hidden",
        py: 4,
      }}
    >
      {/* Decorative Circles */}
      <Box sx={{ position: "absolute", top: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,77,255,0.1) 0%, transparent 70%)" }} />
      <Box sx={{ position: "absolute", bottom: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)" }} />

      <Card
        sx={{
          maxWidth: 480,
          width: "100%",
          mx: 2,
          p: 1,
          border: "1px solid rgba(124,77,255,0.2)",
          boxShadow: "0 8px 32px rgba(124,77,255,0.15)",
          bgcolor: "rgba(18, 18, 18, 0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 3 }}>
            <MeetingRoom sx={{ color: "primary.main", fontSize: 40 }} />
            <Typography variant="h4" sx={{ background: "linear-gradient(135deg, #7C4DFF, #00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700 }}>
              ShareIt
            </Typography>
          </Box>

          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
            {t("register.title")}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>¡Registro exitoso! Redirigiendo al login...</Alert>}

          <Box component="form" onSubmit={handleRegister}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  fullWidth label={t("register.name")} name="name" 
                  value={formData.name} onChange={handleChange} required
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person fontSize="small" sx={{ color: "grey.600" }} /></InputAdornment> } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  fullWidth label={t("register.username")} name="username" 
                  value={formData.username} onChange={handleChange} required
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Badge fontSize="small" sx={{ color: "grey.600" }} /></InputAdornment> } }}
                />
              </Grid>
              <Grid size={12}>
                <TextField 
                  fullWidth label={t("register.email")} name="email" type="email"
                  value={formData.email} onChange={handleChange} required
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email fontSize="small" sx={{ color: "grey.600" }} /></InputAdornment> } }}
                />
              </Grid>
              <Grid size={12}>
                <TextField 
                  fullWidth label={t("register.password")} name="password" 
                  type={showPassword ? "text" : "password"}
                  value={formData.password} onChange={handleChange} required
                  slotProps={{ 
                    input: { 
                      startAdornment: <InputAdornment position="start"><Lock fontSize="small" sx={{ color: "grey.600" }} /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    } 
                  }}
                  helperText={t("register.passwordHint") || "6-12 chars, no spaces"}
                />
              </Grid>
              <Grid size={12}>
                <TextField 
                  fullWidth label={t("register.bio")} name="bio" multiline rows={2}
                  value={formData.bio} onChange={handleChange}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Info fontSize="small" sx={{ color: "grey.600" }} /></InputAdornment> } }}
                />
              </Grid>
            </Grid>

            <Button 
              fullWidth variant="contained" size="large" type="submit" disabled={loading || success}
              sx={{ mt: 4, mb: 2, py: 1.5, background: "linear-gradient(135deg, #7C4DFF, #651FFF)", fontWeight: 700, "&:hover": { background: "linear-gradient(135deg, #9C7CFF, #7C4DFF)" } }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t("register.create")}
            </Button>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="grey.500">
              {t("register.hasAccount")}{" "}
              <Link component="button" type="button" variant="body2" onClick={() => navigate("/login")} sx={{ color: "primary.light", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                {t("register.signIn")}
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
