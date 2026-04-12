import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Stack,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  AccountBalanceWallet,
  Add,
  ArrowUpward,
  ArrowDownward,
  CreditCard,
  DateRange,
  Lock,
  Money,
} from "@mui/icons-material";
import { useI18n } from "../context/I18nContext";
import axios from "axios";

const typeConfig: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode }
> = {
  credit: {
    bg: "rgba(105,240,174,0.12)",
    color: "#69F0AE",
    icon: <ArrowDownward fontSize="small" />,
  },
  debit: {
    bg: "rgba(255,82,82,0.12)",
    color: "#FF5252",
    icon: <ArrowUpward fontSize="small" />,
  },
  refund: {
    bg: "rgba(0,229,255,0.12)",
    color: "#00E5FF",
    icon: <ArrowDownward fontSize="small" />,
  },
};
const typeKeys: Record<string, string> = {
  credit: "wallet.credit",
  debit: "wallet.debit",
  refund: "wallet.refund",
};

export default function Wallet() {
  const { t } = useI18n();

  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-up Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [amount, setAmount] = useState<string>("20");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resProfile, resReservations] = await Promise.all([
        axios.get("http://localhost:3000/auth/me", { withCredentials: true }),
        axios.get("http://localhost:3000/reservations/me", {
          withCredentials: true,
        }),
      ]);

      const currentBalance = resProfile.data.wallet || 0;
      setBalance(currentBalance);

      const currentDebits = resReservations.data.map((res: any) => ({
        id: res.reservation_id,
        description: `Depósito — ${res.resource?.name || "Recurso"}`,
        amount: res.resource?.deposit || 0,
        type: "debit",
        date: new Date(res.date).toLocaleDateString(),
      }));

      // We could also fetch actual transactions if there's a backend endpoint for it
      // For now, we mix in the debit history
      setHistory(currentDebits);
    } catch (error) {
      console.error("Error cargando Wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    if (!processing) {
      setOpenDialog(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setAmount("20");
    setCardNumber("");
    setExpiry("");
    setCvv("");
  };

  const handleProcessPayment = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert(t("wallet.invalidAmount"));
      return;
    }

    setProcessing(true);

    // Simulate payment delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const res = await axios.post(
        "http://localhost:3000/auth/topup",
        { amount: Number(amount) },
        { withCredentials: true },
      );

      if (res.data) {
        setBalance(res.data.wallet);
        const newTx = {
          id: Date.now(),
          description: "Wallet Top-Up",
          amount: Number(amount),
          type: "credit",
          date: new Date().toLocaleDateString(),
        };
        setHistory((prev) => [newTx, ...prev]);
        setSuccessMsg(true);
        handleCloseDialog();
      }
    } catch (error) {
      alert("Error en la recarga");
    } finally {
      setProcessing(false);
    }
  };

  const totalDeposited = history
    .filter((x) => x.type === "debit")
    .reduce((a, b) => a + b.amount, 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t("wallet.title")}
      </Typography>
      <Typography variant="body1" color="grey.500" sx={{ mb: 3 }}>
        {t("wallet.subtitle")}
      </Typography>

      <Card
        sx={{
          mb: 4,
          background:
            "linear-gradient(135deg, rgba(124,77,255,0.2) 0%, rgba(0,229,255,0.1) 100%)",
          border: "1px solid rgba(124,77,255,0.3)",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 4,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(124,77,255,0.25)",
                color: "#B388FF",
              }}
            >
              <AccountBalanceWallet fontSize="large" />
            </Box>
            <Box>
              <Typography variant="body2" color="grey.500">
                {t("wallet.balance")}
              </Typography>
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{
                    background: "linear-gradient(135deg, #B388FF, #00E5FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  €{balance.toFixed(2)}
                </Typography>
              )}
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
            onClick={handleOpenDialog}
            sx={{ background: "linear-gradient(135deg, #7C4DFF, #651FFF)" }}
          >
            {t("wallet.topUp")}
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[
          {
            label: t("wallet.totalDeposited"),
            value: `€${totalDeposited.toFixed(2)}`,
            color: "#FF5252",
          },
          {
            label: t("wallet.totalRefunded"),
            value: "€0.00",
            color: "#00E5FF",
          },
          { label: t("wallet.forfeited"), value: "€0.00", color: "#FFD740" },
        ].map((s) => (
          <Card key={s.label} sx={{ flex: 1, minWidth: 160 }}>
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="h5" sx={{ color: s.color }}>
                {s.value}
              </Typography>
              <Typography variant="body2" color="grey.500">
                {s.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.06)" }} />
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("wallet.history")}
      </Typography>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    t("wallet.description"),
                    t("wallet.dateCol"),
                    t("wallet.typeCol"),
                    t("wallet.amount"),
                  ].map((h, i) => (
                    <TableCell
                      key={h}
                      sx={{ fontWeight: 600, color: "grey.400" }}
                      align={i === 3 ? "right" : "left"}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((tx) => (
                  <TableRow
                    key={tx.id}
                    sx={{
                      "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" },
                    }}
                  >
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>
                      <Chip
                        icon={typeConfig[tx.type].icon as React.ReactElement}
                        label={t(typeKeys[tx.type])}
                        size="small"
                        sx={{
                          backgroundColor: typeConfig[tx.type].bg,
                          color: typeConfig[tx.type].color,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          color: tx.type === "debit" ? "#FF5252" : "#69F0AE",
                        }}
                      >
                        {tx.type === "debit" ? "-" : "+"}€
                        {Number(tx.amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="grey.600">
                        No hay transacciones recientes
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Top-up Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CreditCard color="primary" /> {t("wallet.topUpTitle")}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label={t("wallet.amountLabel")}
              fullWidth
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={processing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">€</InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: "linear-gradient(135deg, #1e1e1e 0%, #333 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "rgba(124,77,255,0.1)",
                }}
              />

              <Stack spacing={2}>
                <TextField
                  variant="standard"
                  placeholder="0000 0000 0000 0000"
                  label={t("wallet.cardNumber")}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  disabled={processing}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCard fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Grid container spacing={2}>
                  <Grid size={7}>
                    <TextField
                      variant="standard"
                      placeholder="MM/YY"
                      label={t("wallet.expiry")}
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      disabled={processing}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DateRange fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid size={5}>
                    <TextField
                      variant="standard"
                      placeholder="123"
                      label={t("wallet.cvv")}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      disabled={processing}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            {processing && (
              <Stack alignItems="center" spacing={1}>
                <CircularProgress size={24} />
                <Typography variant="caption" color="primary">
                  {t("wallet.processing")}
                </Typography>
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={processing}>
            {t("wallet.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleProcessPayment}
            disabled={processing || !amount || !cardNumber || !expiry || !cvv}
            sx={{ px: 4 }}
          >
            {t("wallet.payButton")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successMsg}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg(false)}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          {t("wallet.success")}
        </Alert>
      </Snackbar>
    </Box>
  );
}
