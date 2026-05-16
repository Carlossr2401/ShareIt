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
} from "@mui/material";
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  MeetingRoom,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Importante para recibir y enviar cookies httpsOnly
      });

      const data = await response.json();

      if (!response.ok) {
        // Si el backend responde con error (401, 400, etc.)
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // SI TODO SALE BIEN:
      console.log("Login exitoso:", data);

      // Ya no se usa local storage para guardar token (implementado con cookies http-only)
      localStorage.setItem("isAuthenticated", "true");

      // Navegamos al dashboard o inicio
      navigate("/");
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
        background:
          "linear-gradient(135deg, #0A0E1A 0%, #1a1040 50%, #0A0E1A 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Círculos decorativos omitidos para brevedad */}

      <Card
        component="form"
        onSubmit={handleLogin}
        sx={{
          maxWidth: 420,
          width: "100%",
          mx: 2,
          p: 2,
          border: "1px solid rgba(124,77,255,0.2)",
          boxShadow: "0 8px 32px rgba(124,77,255,0.1)",
        }}
      >
        <CardContent sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 3,
            }}
          >
            <MeetingRoom sx={{ color: "primary.main", fontSize: 40 }} />
            <Typography
              variant="h4"
              sx={{
                background: "linear-gradient(135deg, #7C4DFF, #00E5FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ShareIt
            </Typography>
          </Box>

          <Typography variant="body2" color="grey.500" sx={{ mb: 2 }}>
            {t("login.title")}
          </Typography>

          {/* MENSAJE DE ERROR SI FALLA EL LOGIN */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t("login.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "grey.600" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            label={t("login.password")}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "grey.600" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ textAlign: "right", mb: 3 }}>
            <Link
              component="button"
              type="button"
              underline="hover"
              variant="body2"
              sx={{ color: "primary.light" }}
              onClick={(e) => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
            >
              {t("login.forgot")}
            </Link>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit" // <--- Importante: cambia de onClick a type submit
            disabled={loading} // Desactiva el botón mientras carga
            sx={{
              mb: 3,
              py: 1.5,
              background: "linear-gradient(135deg, #7C4DFF, #651FFF)",
              "&:hover": {
                background: "linear-gradient(135deg, #9C7CFF, #7C4DFF)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t("login.signIn")
            )}
          </Button>

          <Typography variant="body2" color="grey.500">
            {t("login.noAccount")}{" "}
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => navigate("/register")}
              sx={{ color: "secondary.main", cursor: "pointer" }}
            >
              {t("login.register")}
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
