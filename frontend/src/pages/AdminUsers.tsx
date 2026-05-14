import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, TextField, InputAdornment, Button
} from "@mui/material";
import { Search, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useI18n } from "../context/I18nContext";

export default function AdminUsers() {
  const { t } = useI18n();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/users`, {
        params: { search: search || undefined },
        withCredentials: true
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t("adminUsers.title")}</Typography>
      <Typography variant="body1" color="grey.500" sx={{ mb: 3 }}>
        {t("adminUsers.subtitle")}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField 
          placeholder={t("adminUsers.search")} 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          size="small" 
          sx={{ minWidth: 280 }}
          slotProps={{ 
            input: { 
              startAdornment: <InputAdornment position="start"><Search sx={{ color: "grey.600" }} /></InputAdornment> 
            } 
          }} 
        />
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    t("adminUsers.name"), 
                    t("adminUsers.email"), 
                    t("adminUsers.username"), 
                    t("adminUsers.role"), 
                    t("adminUsers.reservations"), 
                    t("adminUsers.penalties"), 
                    t("adminUsers.actions")
                  ].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: "grey.400" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} sx={{ "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}>
                    <TableCell>{u.fullName || "-"}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u._count?.reservations || 0}</TableCell>
                    <TableCell>{u._count?.penalties || 0}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="contained" 
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                      >
                        {t("adminUsers.viewDetail")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">{t("adminUsers.noUsers")}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
