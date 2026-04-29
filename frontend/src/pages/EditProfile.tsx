import { useState, useEffect } from "react";
import { 
  Box, Typography, TextField, Button, Avatar, 
  Paper, Alert, Stack, CircularProgress, Divider,
  InputAdornment
} from "@mui/material";
import { 
  Person, CloudUpload, Edit, Save, ArrowBack, 
  Badge, Info 
} from "@mui/icons-material";
import { useUser } from "../context/UserContext";
import { useI18n } from "../context/I18nContext";

export default function EditProfile() {
  const { userName, avatarUrl, bio, fullName, refreshUser } = useUser();
  const { t } = useI18n();
  
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
  });

  useEffect(() => {
    setFormData({
      name: fullName || "",
      username: userName || "",
      bio: bio || "",
    });
    setPreviewUrl(avatarUrl || "");
  }, [userName, avatarUrl, bio, fullName, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("username", formData.username);
      data.append("bio", formData.bio);
      
      if (selectedFile) {
        data.append("avatar", selectedFile); 
      }

      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: "PUT",
        body: data, 
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar perfil");
      }

      await refreshUser();
      setSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSuccess(false);
        setSelectedFile(null);
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", py: 4, px: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "white" }}>
          {isEditing ? "Editar Perfil" : "Mi Perfil"}
        </Typography>
        
        {!isEditing && (
          <Button 
            variant="contained" 
            startIcon={<Edit />} 
            onClick={() => setIsEditing(true)}
            sx={{ borderRadius: 2, background: "linear-gradient(135deg, #7C4DFF, #00E5FF)", fontWeight: 600 }}
          >
            Editar Perfil
          </Button>
        )}
      </Stack>

      <Paper sx={{ 
        p: { xs: 3, md: 5 }, 
        bgcolor: "rgba(18, 18, 18, 0.8)", 
        border: "1px solid rgba(124,77,255,0.2)",
        borderRadius: 4,
        backdropFilter: "blur(10px)",
      }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>¡Perfil actualizado!</Alert>}

        {!isEditing ? (
          <Stack spacing={3} alignItems="center">
            <Avatar 
              src={avatarUrl} 
              sx={{ width: 120, height: 120, border: "3px solid #7C4DFF", boxShadow: "0 0 20px rgba(124,77,255,0.3)" }}
            >
              <Person sx={{ fontSize: 70 }} />
            </Avatar>
            <Box textAlign="center" sx={{ width: "100%" }}>
              <Typography variant="h5" sx={{ color: "white", fontWeight: 700 }}>{fullName || "Usuario"}</Typography>
              <Typography variant="body1" sx={{ color: "primary.light", mb: 2 }}>@{userName}</Typography>
              <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />
              <Typography variant="body1" sx={{ color: "grey.400" }}>{bio || "Sin biografía."}</Typography>
            </Box>
          </Stack>
        ) : (
          <Box component="form" onSubmit={handleSave}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar src={previewUrl} sx={{ width: 80, height: 80, border: "2px solid #7C4DFF" }} />
                <Button 
                  variant="outlined" 
                  component="label" 
                  startIcon={<CloudUpload />}
                  sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}
                >
                  Subir Foto
                  <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                </Button>
              </Stack>

              <TextField 
                fullWidth label="Nombre" name="name" 
                value={formData.name} onChange={handleChange}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> } }}
              />

              <TextField 
                fullWidth label="Username" name="username" 
                value={formData.username} onChange={handleChange}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Badge fontSize="small" /></InputAdornment> } }}
              />

              <TextField 
                fullWidth multiline rows={3} label="Bio" name="bio" 
                value={formData.bio} onChange={handleChange}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Info fontSize="small" /></InputAdornment> } }}
              />

              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                <Button 
                  fullWidth variant="outlined" 
                  onClick={() => setIsEditing(false)} 
                  sx={{ color: "white", borderColor: "rgba(255,255,255,0.2)" }}
                >
                  Cancelar
                </Button>
                <Button 
                  fullWidth variant="contained" type="submit" disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  sx={{ background: "linear-gradient(135deg, #7C4DFF, #651FFF)", fontWeight: 700 }}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
 );
} 