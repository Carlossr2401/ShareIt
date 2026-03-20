import {
  Box, Typography, Card, CardContent, Button, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Chip, Divider,
} from "@mui/material";
import { AccountBalanceWallet, Add, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { useI18n } from "../context/I18nContext";

const transactions = [
  { id: 1, description: "Wallet Top-Up", amount: "+€20.00", type: "credit", date: "Mar 17, 2026" },
  { id: 2, description: "Deposit — Conference Room A", amount: "-€2.00", type: "debit", date: "Mar 17, 2026" },
  { id: 3, description: "Refund — Projector Epson #1", amount: "+€1.00", type: "refund", date: "Mar 16, 2026" },
  { id: 4, description: "Deposit — Laptop Dell #7", amount: "-€1.50", type: "debit", date: "Mar 16, 2026" },
  { id: 5, description: "Deposit — Van Mercedes", amount: "-€5.00", type: "debit", date: "Mar 15, 2026" },
  { id: 6, description: "Refund — Van Mercedes", amount: "+€5.00", type: "refund", date: "Mar 15, 2026" },
  { id: 7, description: "Wallet Top-Up", amount: "+€30.00", type: "credit", date: "Mar 14, 2026" },
  { id: 8, description: "Deposit — Classroom 101 (forfeited)", amount: "-€3.00", type: "debit", date: "Mar 12, 2026" },
];

const typeConfig: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  credit: { bg: "rgba(105,240,174,0.12)", color: "#69F0AE", icon: <ArrowDownward fontSize="small" /> },
  debit: { bg: "rgba(255,82,82,0.12)", color: "#FF5252", icon: <ArrowUpward fontSize="small" /> },
  refund: { bg: "rgba(0,229,255,0.12)", color: "#00E5FF", icon: <ArrowDownward fontSize="small" /> },
};
const typeKeys: Record<string, string> = { credit: "wallet.credit", debit: "wallet.debit", refund: "wallet.refund" };

export default function Wallet() {
  const { t } = useI18n();
  return (
    <Box>
      <Typography variant="h4" gutterBottom>{t("wallet.title")}</Typography>
      <Typography variant="body1" color="grey.500" sx={{ mb: 3 }}>{t("wallet.subtitle")}</Typography>

      <Card sx={{ mb: 4, background: "linear-gradient(135deg, rgba(124,77,255,0.2) 0%, rgba(0,229,255,0.1) 100%)", border: "1px solid rgba(124,77,255,0.3)" }}>
        <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(124,77,255,0.25)", color: "#B388FF" }}>
              <AccountBalanceWallet fontSize="large" />
            </Box>
            <Box>
              <Typography variant="body2" color="grey.500">{t("wallet.balance")}</Typography>
              <Typography variant="h3" fontWeight={700} sx={{ background: "linear-gradient(135deg, #B388FF, #00E5FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>€45.00</Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<Add />} size="large" sx={{ background: "linear-gradient(135deg, #7C4DFF, #651FFF)", "&:hover": { background: "linear-gradient(135deg, #9C7CFF, #7C4DFF)" } }}>{t("wallet.topUp")}</Button>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[
          { label: t("wallet.totalDeposited"), value: "€11.50", color: "#FF5252" },
          { label: t("wallet.totalRefunded"), value: "€6.00", color: "#00E5FF" },
          { label: t("wallet.forfeited"), value: "€3.00", color: "#FFD740" },
        ].map((s) => (
          <Card key={s.label} sx={{ flex: 1, minWidth: 160 }}>
            <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="h5" sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="body2" color="grey.500">{s.label}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Divider sx={{ mb: 3, borderColor: "rgba(255,255,255,0.06)" }} />
      <Typography variant="h6" sx={{ mb: 2 }}>{t("wallet.history")}</Typography>
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[t("wallet.description"), t("wallet.dateCol"), t("wallet.typeCol"), t("wallet.amount")].map((h, i) => (
                    <TableCell key={h} sx={{ fontWeight: 600, color: "grey.400" }} align={i === 3 ? "right" : "left"}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} sx={{ "&:hover": { backgroundColor: "rgba(124,77,255,0.04)" } }}>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>
                      <Chip icon={typeConfig[tx.type].icon as React.ReactElement} label={t(typeKeys[tx.type])} size="small"
                        sx={{ backgroundColor: typeConfig[tx.type].bg, color: typeConfig[tx.type].color, fontWeight: 600, "& .MuiChip-icon": { color: typeConfig[tx.type].color } }} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} sx={{ color: tx.type === "debit" ? "#FF5252" : "#69F0AE" }}>{tx.amount}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
