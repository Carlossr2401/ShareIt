import { useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Link,
  InputAdornment, IconButton,
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff, MeetingRoom } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useI18n();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0A0E1A 0%, #1a1040 50%, #0A0E1A 100%)", position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,77,255,0.15) 0%, transparent 70%)", top: -100, right: -100 }} />
      <Box sx={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 70%)", bottom: -50, left: -50 }} />

      <Card sx={{ maxWidth: 420, width: "100%", mx: 2, p: 2, border: "1px solid rgba(124,77,255,0.2)", boxShadow: "0 8px 32px rgba(124,77,255,0.1)" }}>
        <CardContent sx={{ textAlign: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 3 }}>
            <MeetingRoom sx={{ color: "primary.main", fontSize: 40 }} />
            <Typography variant="h4" sx={{ background: "linear-gradient(135deg, #7C4DFF, #00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ShareIt</Typography>
          </Box>
          <Typography variant="body2" color="grey.500" sx={{ mb: 4 }}>{t("login.title")}</Typography>

          <TextField fullWidth label={t("login.email")} sx={{ mb: 2 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email sx={{ color: "grey.600" }} /></InputAdornment> } }} />
          <TextField fullWidth label={t("login.password")} type={showPassword ? "text" : "password"} sx={{ mb: 1 }}
            slotProps={{ input: {
              startAdornment: <InputAdornment position="start"><Lock sx={{ color: "grey.600" }} /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment>,
            } }} />
          <Box sx={{ textAlign: "right", mb: 3 }}>
            <Link href="#" underline="hover" variant="body2" sx={{ color: "primary.light" }}>{t("login.forgot")}</Link>
          </Box>
          <Button fullWidth variant="contained" size="large" onClick={() => navigate("/")}
            sx={{ mb: 3, py: 1.5, background: "linear-gradient(135deg, #7C4DFF, #651FFF)", "&:hover": { background: "linear-gradient(135deg, #9C7CFF, #7C4DFF)" } }}>
            {t("login.signIn")}
          </Button>
          <Typography variant="body2" color="grey.500">
            {t("login.noAccount")}{" "}
            <Link component="button" variant="body2" onClick={() => navigate("/register")} sx={{ color: "secondary.main", cursor: "pointer" }}>{t("login.register")}</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
