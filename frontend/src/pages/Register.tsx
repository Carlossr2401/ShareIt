import { useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Link,
  InputAdornment, IconButton, MenuItem,
} from "@mui/material";
import { Person, Email, Lock, Visibility, VisibilityOff, MeetingRoom } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../context/I18nContext";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user"
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Registro exitoso! Revisa tu correo si tienes activada la confirmación.");
        navigate("/login");
      } else {
        alert(data.error || "Error en el registro");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleRegister} /* ... resto del Box ... */>
      {/* ... Círculos decorativos ... */}
      <Card /* ... */>
        <CardContent>
          {/* ... Logo ShareIt ... */}

          <TextField 
            fullWidth name="name" label={t("register.name")} 
            onChange={handleChange} sx={{ mb: 2 }} 
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person /></InputAdornment> } }} 
          />
          
          <TextField 
            fullWidth name="email" label={t("register.email")} 
            onChange={handleChange} required sx={{ mb: 2 }} 
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email /></InputAdornment> } }} 
          />

          <TextField 
            fullWidth name="password" label={t("register.password")} 
            type={showPassword ? "text" : "password"} 
            onChange={handleChange} required sx={{ mb: 2 }} 
            slotProps={{ input: {
              startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
              endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>,
            } }} 
          />

          <TextField 
            fullWidth select name="role" label={t("register.role")} 
            value={formData.role} onChange={handleChange} sx={{ mb: 3 }}
          >
            <MenuItem value="user">{t("register.roleUser")}</MenuItem>
            <MenuItem value="admin">{t("register.roleAdmin")}</MenuItem>
          </TextField>

          <Button 
            fullWidth variant="contained" type="submit" disabled={loading}
            sx={{ mb: 3, py: 1.5, background: "linear-gradient(135deg, #7C4DFF, #651FFF)" }}
          >
            {loading ? "Cargando..." : t("register.create")}
          </Button>
          
          {/* ... Link a Login ... */}
        </CardContent>
      </Card>
    </Box>
  );
}
