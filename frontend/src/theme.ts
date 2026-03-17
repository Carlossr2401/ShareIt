import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7C4DFF",
      light: "#B388FF",
      dark: "#651FFF",
    },
    secondary: {
      main: "#00E5FF",
      light: "#18FFFF",
      dark: "#00B8D4",
    },
    background: {
      default: "#0A0E1A",
      paper: "#121829",
    },
    success: {
      main: "#69F0AE",
    },
    warning: {
      main: "#FFD740",
    },
    error: {
      main: "#FF5252",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
          padding: "10px 24px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(124, 77, 255, 0.15)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default theme;
