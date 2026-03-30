import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  MeetingRoom,
  EventNote,
  AccountBalanceWallet,
  AdminPanelSettings,
  ListAlt,
  Logout,
  SwapHoriz,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import { useUser } from "../context/UserContext";

const DRAWER_WIDTH = 260;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useI18n();
  const { role, setRole, userName, avatarUrl } = useUser();

  const userMenuItems = [
    { text: t("nav.dashboard"), icon: <DashboardIcon />, path: "/" },
    { text: t("nav.resources"), icon: <MeetingRoom />, path: "/resources" },
    {
      text: t("nav.myReservations"),
      icon: <EventNote />,
      path: "/reservations",
    },
    { text: t("nav.wallet"), icon: <AccountBalanceWallet />, path: "/wallet" },
  ];

  const commonAdminItems = [
    {
      text: role === "admin" ? t("nav.manageResources") : t("nav.myListings"),
      icon: <AdminPanelSettings />,
      path: "/admin/resources",
    },
  ];

  const adminOnlyItems = [
    {
      text: t("nav.allReservations"),
      icon: <ListAlt />,
      path: "/admin/reservations",
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #121829 0%, #0A0E1A 100%)",
            borderRight: "1px solid rgba(124, 77, 255, 0.12)",
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
          <MeetingRoom sx={{ color: "primary.main", fontSize: 32 }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #7C4DFF, #00E5FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ShareIt
          </Typography>
        </Box>
        <Divider sx={{ borderColor: "rgba(124, 77, 255, 0.12)" }} />

        {/* User Profile + Role Switcher */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={avatarUrl}
            sx={{
              bgcolor: role === "admin" ? "secondary.main" : "primary.main",
              width: 40,
              height: 40,
            }}
          >
            {userName ? userName.charAt(0) : "U"}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {userName}
            </Typography>
            <Chip
              label={t(`role.${role}`)}
              size="small"
              color={role === "admin" ? "secondary" : "primary"}
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          </Box>
          <Tooltip
            title={`${t("role.switchTo")} ${role === "admin" ? t("role.user") : t("role.admin")}`}
          >
            <IconButton
              size="small"
              onClick={() => setRole(role === "admin" ? "user" : "admin")}
              sx={{ color: "grey.500" }}
            >
              <SwapHoriz fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Divider sx={{ borderColor: "rgba(124, 77, 255, 0.12)" }} />

        {/* Language Switcher */}
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
          <ToggleButtonGroup
            value={lang}
            exclusive
            size="small"
            fullWidth
            onChange={(_, v) => {
              if (v) setLang(v);
            }}
            sx={{
              "& .MuiToggleButton-root": {
                fontSize: "0.75rem",
                py: 0.5,
                color: "grey.500",
                borderColor: "rgba(124,77,255,0.2)",
                "&.Mui-selected": {
                  color: "primary.main",
                  backgroundColor: "rgba(124,77,255,0.12)",
                },
              },
            }}
          >
            <ToggleButton value="en">🇬🇧 English</ToggleButton>
            <ToggleButton value="es">🇪🇸 Español</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Divider sx={{ borderColor: "rgba(124, 77, 255, 0.12)", mt: 1 }} />

        {/* Nav */}
        <List sx={{ px: 1, pt: 1 }}>
          {userMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    backgroundColor: "rgba(124,77,255,0.15)",
                    "&:hover": { backgroundColor: "rgba(124,77,255,0.25)" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "grey.500",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Custom Section */}
        <Divider sx={{ borderColor: "rgba(124, 77, 255, 0.12)", mx: 2, my: 1 }} />
        <Typography
          variant="caption"
          sx={{
            px: 3,
            py: 1,
            color: "grey.600",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {role === "admin" ? t("nav.admin") : t("nav.myListings")}
        </Typography>
        <List sx={{ px: 1 }}>
          {commonAdminItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    backgroundColor: "rgba(124,77,255,0.15)",
                    "&:hover": { backgroundColor: "rgba(124,77,255,0.25)" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "grey.500",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {role === "admin" && adminOnlyItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    backgroundColor: "rgba(124,77,255,0.15)",
                    "&:hover": { backgroundColor: "rgba(124,77,255,0.25)" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color:
                      location.pathname === item.path
                        ? "primary.main"
                        : "grey.500",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.9rem",
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Logout */}
        <Box sx={{ mt: "auto", p: 1 }}>
          <ListItemButton
            onClick={async () => {
              const API_URL =
                import.meta.env.VITE_API_URL || "http://localhost:3000";
              try {
                await fetch(`${API_URL}/auth/logout`, {
                  method: "POST",
                  credentials: "include",
                });
              } catch (error) {
                console.error(error);
              }
              localStorage.removeItem("isAuthenticated");
              navigate("/login");
            }}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ color: "grey.500", minWidth: 40 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText
              primary={t("nav.logout")}
              primaryTypographyProps={{ fontSize: "0.9rem" }}
            />
          </ListItemButton>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: "rgba(10,14,26,0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(124,77,255,0.12)",
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: "grey.300" }}>
              {t("nav.appTitle")}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
