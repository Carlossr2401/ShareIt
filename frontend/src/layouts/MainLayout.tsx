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
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  MeetingRoom,
  EventNote,
  AccountBalanceWallet,
  AdminPanelSettings,
  ListAlt,
  Logout,
  Inventory2,
  Settings,
  People,
  CalendarMonth,
  Favorite,
} from "@mui/icons-material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import { useUser } from "../context/UserContext";

import { Person } from "@mui/icons-material";

const DRAWER_WIDTH = 260;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useI18n();
  const { role, userName, avatarUrl } = useUser();
  const isProfileActive = location.pathname === "/profile";

  const userMenuItems = [
    { text: t("nav.dashboard") || "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: t("nav.resources") || "Resources", icon: <MeetingRoom />, path: "/resources" },
    {
      text: t("nav.myReservations") || "My Reservations",
      icon: <EventNote />,
      path: "/reservations",
    },
    { text: t("nav.wallet") || "Wallet", icon: <AccountBalanceWallet />, path: "/wallet" },
    { text: t("nav.favorites") || "Favorites", icon: <Favorite />, path: "/favorites" },
  ];

  const listingItems = [
    {
      text: t("nav.myListings") || "My Listings",
      icon: <Inventory2 />,
      path: "/my-listings",
    },
  ];

  const adminItems = [
    {
      text: t("nav.masterCalendar") || "Master Calendar",
      icon: <CalendarMonth />,
      path: "/admin/master-calendar",
    },
    {
      text: t("nav.manageResources") || "Platform Resources",
      icon: <AdminPanelSettings />,
      path: "/admin/resources",
    },
    {
      text: t("nav.allReservations") || "All Reservations",
      icon: <ListAlt />,
      path: "/admin/reservations",
    },
    {
      text: t("nav.users") || "Users",
      icon: <People />,
      path: "/admin/users",
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

        {/* User Profile */}
        <Box
          onClick={() => navigate("/profile")}
          sx={{
            p: 2,
            mx: 1,
            mt: 1,
            my: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderRadius: 2,
            cursor: 'pointer',
            transition: '0.2s',
            bgcolor: isProfileActive ? "rgba(124, 77, 255, 0.12)" : "transparent",
            '&:hover': { bgcolor: "rgba(255, 255, 255, 0.05)" }
          }}
        >
          <Avatar
            src={avatarUrl}
            sx={{
              bgcolor: role === "admin" ? "secondary.main" : "primary.main",
              width: 40,
              height: 40,
              boxShadow: isProfileActive ? "0 0 15px rgba(124,77,255,0.5)" : "0 0 10px rgba(124,77,255,0.3)",
              border: isProfileActive ? "2px solid #7C4DFF" : "none"
            }}
          >
            {userName ? userName.charAt(0) : <Person />}
          </Avatar>
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Typography
              variant="body2"
              fontWeight={700}
              noWrap
              sx={{ color: isProfileActive ? "primary.light" : "white" }}
            >
              {userName}
            </Typography>
            <Chip
              label={t(`role.${role}`) || role}
              size="small"
              color={role === "admin" ? "secondary" : "primary"}
              sx={{ height: 18, fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(124, 77, 255, 0.12)" }} />

        {/* Language Switcher */}
        <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "center", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setLang("en")}
            sx={{ opacity: lang === "en" ? 1 : 0.4, border: lang === "en" ? "1px solid rgba(124,77,255,0.3)" : "none" }}
          >
            <Typography variant="body2">🇬🇧</Typography>
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setLang("es")}
            sx={{ opacity: lang === "es" ? 1 : 0.4, border: lang === "es" ? "1px solid rgba(124,77,255,0.3)" : "none" }}
          >
            <Typography variant="body2">🇪🇸</Typography>
          </IconButton>
        </Box>
        <Divider sx={{ borderColor: "rgba(124, 77, 255, 0.12)" }} />

        {/* Nav Sections */}
        <Box sx={{ overflow: "auto", flexGrow: 1, px: 1, py: 1 }}>
          {/* Main Section */}
          <Typography variant="caption" sx={{ px: 2, py: 1, display: "block", color: "grey.600", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>
            Personal
          </Typography>
          <List disablePadding>
            {userMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    "&.Mui-selected": {
                      backgroundColor: "rgba(124,77,255,0.12)",
                      "&:hover": { backgroundColor: "rgba(124,77,255,0.2)" },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? "primary.main" : "grey.500", minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.85rem",
                      fontWeight: location.pathname === item.path ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 1.5, mx: 2, opacity: 0.1 }} />

          {/* Owner Section */}
          <Typography variant="caption" sx={{ px: 2, py: 1, display: "block", color: "grey.600", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>
            Creator
          </Typography>
          <List disablePadding>
            {listingItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    "&.Mui-selected": {
                      backgroundColor: "rgba(0,229,255,0.1)",
                      "&:hover": { backgroundColor: "rgba(0,229,255,0.15)" },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? "#00E5FF" : "grey.500", minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.85rem",
                      fontWeight: location.pathname === item.path ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {role === "admin" && (
            <>
              <Divider sx={{ my: 1.5, mx: 2, opacity: 0.1 }} />
              {/* Admin Section */}
              <Typography variant="caption" sx={{ px: 2, py: 1, display: "block", color: "secondary.main", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5 }}>
                Administration
              </Typography>
              <List disablePadding>
                {adminItems.map((item) => (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => navigate(item.path)}
                      selected={location.pathname === item.path}
                      sx={{
                        borderRadius: 2,
                        py: 1.2,
                        "&.Mui-selected": {
                          backgroundColor: "rgba(255,82,82,0.1)",
                          "&:hover": { backgroundColor: "rgba(255,82,82,0.15)" },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: location.pathname === item.path ? "secondary.main" : "grey.500", minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          fontWeight: location.pathname === item.path ? 700 : 500,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>

        {/* Logout */}
        <Box sx={{ mt: "auto", p: 1.5 }}>
          <ListItemButton
            onClick={async () => {
              const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
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
            sx={{ borderRadius: 3, bgcolor: "rgba(255,255,255,0.03)" }}
          >
            <ListItemIcon sx={{ color: "error.light", minWidth: 40 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText
              primary={t("nav.logout") || "Logout"}
              primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600, color: "grey.400" }}
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
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "grey.300", letterSpacing: 0.5 }}>
              {t("nav.appTitle") || "ShareIt Platform"}
            </Typography>
            <Tooltip title="Platform Settings">
              <IconButton size="small" sx={{ color: "grey.600" }}>
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, p: 4, overflow: "auto", bgcolor: "#0A0E1A" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

