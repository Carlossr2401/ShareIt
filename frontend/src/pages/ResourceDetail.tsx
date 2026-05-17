import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Backdrop,
  IconButton,
  Rating,
} from "@mui/material";
import {
  ArrowBack,
  MeetingRoom,
  Laptop,
  Tv,
  DirectionsCar,
  Brush,
  CalendarMonth,
  AccessTime,
  CheckCircle,
  AccountBalanceWallet,
  CreditCard,
  InfoOutlined,
  Payments,
  ChevronLeft,
  ChevronRight,
  Fullscreen,
  Close,
  Star,
  Person,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "../context/I18nContext";
import FavoriteButton from "../context/FavoriteButton";
import type { Prisma } from "../../../backend/node_modules/.prisma/client";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import dayjs from "dayjs";
import { useUser } from "../context/UserContext";

type ResourceWithRelations = Prisma.ResourceGetPayload<{
  include: { availabilities: true; reservations: true };
}>;

const typeIcons: Record<string, React.ReactNode> = {
  Room: <MeetingRoom fontSize="large" />,
  Laptop: <Laptop fontSize="large" />,
  Projector: <Tv fontSize="large" />,
  Vehicle: <DirectionsCar fontSize="large" />,
  Whiteboard: <Brush fontSize="large" />,
};

const typeColors: Record<string, string> = {
  Room: "#7C4DFF",
  Laptop: "#00E5FF",
  Projector: "#FFD740",
  Vehicle: "#69F0AE",
  Whiteboard: "#FF80AB",
};

export default function ResourceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useI18n();
  const { role } = useUser(); // Getting current user info for wallet balance simulation if needed

  const [resource, setResource] = useState<ResourceWithRelations | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "CARD">(
    "WALLET",
  );
  const [isBooking, setIsBooking] = useState(false);

  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Gallery states
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await fetch(`http://localhost:3000/resources/${id}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setResource(data);

          if (data.ownerId) {
            try {
              const revRes = await fetch(
                `http://localhost:3000/reviews/target/${data.ownerId}`,
              );
              if (revRes.ok) {
                const revData = await revRes.json();
                setReviews(revData.filter((r: any) => r.role === "TENANT"));
              }
            } catch (err) {
              console.error("Error fetching reviews", err);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching resource:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  const handleBook = async () => {
    if (!selectedSlot || !date) {
      setErrorStatus("Please select a date and an available time slot.");
      return;
    }

    setErrorStatus(null);
    setSuccessStatus(null);

    setIsBooking(true);

    // Si es pago con tarjeta, simulamos el procesamiento
    if (paymentMethod === "CARD") {
      // Esperamos 2 segundos para dar realismo a la animación solicitada
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    const formatTime = (isoString: string) => {
      const d = new Date(isoString);
      return (
        d.getUTCHours().toString().padStart(2, "0") +
        ":" +
        d.getUTCMinutes().toString().padStart(2, "0") +
        ":00"
      );
    };

    try {
      const res = await fetch("http://localhost:3000/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          resourceId: id,
          date,
          startTime: formatTime(selectedSlot.startTime),
          endTime: formatTime(selectedSlot.endTime),
          paymentMethod: paymentMethod,
        }),
      });

      if (res.ok) {
        setIsBooking(false);
        setSuccessStatus(
          `Reservation created successfully via ${paymentMethod === "CARD" ? "Card" : "Wallet"}!`,
        );
        setTimeout(() => navigate("/reservations"), 1500);
      } else {
        const data = await res.json();
        setIsBooking(false);
        setErrorStatus(data.error || "Error creating reservation");
      }
    } catch {
      setIsBooking(false);
      setErrorStatus("Network error occurred");
    }
  };

  if (loading)
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (!resource)
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Resource not found.</Typography>
      </Box>
    );

  const rType = resource.category || "Room";
  const selectedDayOfWeek = dayjs(date).day();
  const availableSlots =
    resource.availabilities?.filter(
      (slot: any) => slot.dayOfWeek === selectedDayOfWeek,
    ) || [];

  const isSlotBusy = (slot: any) => {
    if (!resource.reservations) return false;

    const formatTimeOnly = (date: Date) => {
      const d = new Date(date);
      return (
        d.getUTCHours().toString().padStart(2, "0") +
        ":" +
        d.getUTCMinutes().toString().padStart(2, "0")
      );
    };

    const slotStart = formatTimeOnly(slot.startTime);
    const slotEnd = formatTimeOnly(slot.endTime);

    return resource.reservations.some((res: any) => {
      const resDate = dayjs(res.date).format("YYYY-MM-DD");
      if (resDate !== date) return false;

      const resStart = formatTimeOnly(res.startTime);
      const resEnd = formatTimeOnly(res.endTime);

      return resStart < slotEnd && resEnd > slotStart;
    });
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/resources")}
        sx={{ mb: 2, color: "grey.400" }}
      >
        {t("detail.back") || "Back"}
      </Button>

      <Grid container spacing={4}>
        {/* Left: Resource Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            sx={{
              mb: 3,
              borderRadius: 5,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {resource.photoUrls && (
              <Box sx={{ bgcolor: "#0A0E1A", position: "relative" }}>
                {/* Main Photo Display */}
                <Box
                  sx={{
                    width: "100%",
                    height: 500,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "zoom-in",
                  }}
                  onClick={() => setLightboxOpen(true)}
                >
                  {Array.isArray(resource.photoUrls) &&
                  resource.photoUrls.length > 0 ? (
                    <>
                      <img
                        src={resource.photoUrls[activePhotoIndex]}
                        alt={`${resource.name} ${activePhotoIndex}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "opacity 0.3s ease-in-out",
                        }}
                      />

                      {/* Navigation Overlay */}
                      {resource.photoUrls.length > 1 && (
                        <>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIndex(
                                (prev) =>
                                  (prev - 1 + resource.photoUrls.length) %
                                  resource.photoUrls.length,
                              );
                            }}
                            sx={{
                              position: "absolute",
                              left: 16,
                              bgcolor: "rgba(0,0,0,0.5)",
                              color: "white",
                              "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                            }}
                          >
                            <ChevronLeft />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIndex(
                                (prev) =>
                                  (prev + 1) % resource.photoUrls.length,
                              );
                            }}
                            sx={{
                              position: "absolute",
                              right: 16,
                              bgcolor: "rgba(0,0,0,0.5)",
                              color: "white",
                              "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                            }}
                          >
                            <ChevronRight />
                          </IconButton>
                        </>
                      )}

                      {/* Fullscreen Button */}
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          bgcolor: "rgba(0,0,0,0.5)",
                          color: "white",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxOpen(true);
                        }}
                      >
                        <Fullscreen />
                      </IconButton>
                    </>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(124,77,255,0.05)",
                      }}
                    >
                      {typeIcons[rType] || typeIcons.Room}
                    </Box>
                  )}

                  {/* Resource Category Badge */}
                  <Box sx={{ position: "absolute", top: 16, left: 16 }}>
                    <Chip
                      label={rType}
                      sx={{
                        bgcolor: "rgba(10,14,26,0.8)",
                        backdropFilter: "blur(10px)",
                        color: typeColors[rType],
                        fontWeight: 700,
                        px: 2,
                        py: 2.5,
                        fontSize: "0.8rem",
                        border: `1px solid ${typeColors[rType]}44`,
                      }}
                    />
                  </Box>
                </Box>

                {/* Thumbnails Row */}
                {Array.isArray(resource.photoUrls) &&
                  resource.photoUrls.length > 1 && (
                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        gap: 1.5,
                        overflowX: "auto",
                        bgcolor: "rgba(0,0,0,0.3)",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        "&::-webkit-scrollbar": { height: 6 },
                        "&::-webkit-scrollbar-thumb": {
                          bgcolor: "rgba(255,255,255,0.1)",
                          borderRadius: 10,
                        },
                      }}
                    >
                      {resource.photoUrls.map((url: string, index: number) => (
                        <Box
                          key={index}
                          onClick={() => setActivePhotoIndex(index)}
                          sx={{
                            width: 80,
                            height: 60,
                            flexShrink: 0,
                            borderRadius: 2,
                            overflow: "hidden",
                            cursor: "pointer",
                            border: "2px solid",
                            borderColor:
                              activePhotoIndex === index
                                ? "primary.main"
                                : "transparent",
                            opacity: activePhotoIndex === index ? 1 : 0.6,
                            transition: "0.2s",
                          }}
                        >
                          <img
                            src={url}
                            alt={`Thumb ${index}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
              </Box>
            )}
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 3,
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="h3"
                      fontWeight={900}
                      sx={{ letterSpacing: -1, mb: 0.5 }}
                    >
                      {resource.name}
                    </Typography>
                    <FavoriteButton
                      resourceId={resource.resourceId}
                      initialIsFavorite={resource.isFavorite}
                    />
                  </Box>
                  <Typography variant="h6" color="grey.500" fontWeight={500}>
                    {resource.location}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    color="primary.main"
                  >
                    €{resource.price}
                    <Typography component="span" variant="h6" color="grey.600">
                      {" "}
                      /hr
                    </Typography>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    fontWeight={700}
                  >
                    + €{resource.deposit} refundable deposit
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 4, opacity: 0.1 }} />

              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <InfoOutlined color="primary" />{" "}
                  {t("detail.description") || "Resource Overview"}
                </Typography>
                <Typography
                  variant="body1"
                  color="grey.400"
                  sx={{ lineHeight: 1.8, fontSize: "1.05rem" }}
                >
                  {resource.description ||
                    t("detail.noDescription") ||
                    "No description provided."}
                </Typography>
              </Box>

              {resource.rules && resource.rules.length > 0 && (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    sx={{
                      mb: 2,
                      color: "grey.300",
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                    }}
                  >
                    {t("detail.rules") || "House Rules"}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    {resource.rules.map((rule: string, i: number) => (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "grey.500",
                          bgcolor: "rgba(255,255,255,0.05)",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                        }}
                      >
                        <CheckCircle
                          sx={{ fontSize: 16, color: "primary.main" }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {rule}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* REVIEWS SECTION */}
              <Divider sx={{ my: 4, opacity: 0.1 }} />
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Star color="primary" />{" "}
                  {t("detail.reviews") || "Owner Reviews"}
                </Typography>
                {reviews.length === 0 ? (
                  <Typography variant="body2" color="grey.500">
                    {t("detail.noReviews") || "No reviews yet."}
                  </Typography>
                ) : (
                  <Stack spacing={3}>
                    {reviews.map((r, i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                bgcolor: "rgba(124,77,255,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                              }}
                            >
                              {r.reviewer?.avatarUrl ? (
                                <img
                                  src={r.reviewer.avatarUrl}
                                  alt="Avatar"
                                  width="100%"
                                  height="100%"
                                  style={{ objectFit: "cover" }}
                                />
                              ) : (
                                <Person
                                  fontSize="small"
                                  sx={{ color: "primary.main" }}
                                />
                              )}
                            </Box>
                            <Typography fontWeight={700}>
                              {r.reviewer?.fullName ||
                                r.reviewer?.username ||
                                "User"}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="grey.500">
                            {dayjs(r.createdAt).format("MMM D, YYYY")}
                          </Typography>
                        </Box>
                        <Rating
                          value={r.rating}
                          readOnly
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        {r.comment && (
                          <Typography variant="body2" color="grey.400">
                            {r.comment}
                          </Typography>
                        )}
                        {r.imageUrls && r.imageUrls.length > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 2,
                              overflowX: "auto",
                            }}
                          >
                            {r.imageUrls.map((url: string, idx: number) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`Review photo ${idx}`}
                                style={{
                                  width: 80,
                                  height: 60,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Booking Actions */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ position: "sticky", top: 24 }}>
            <Card
              sx={{
                borderRadius: 5,
                overflow: "hidden",
                border: "1px solid rgba(124,77,255,0.15)",
                bgcolor: "#0A0E1A",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, rgba(124,77,255,0.15), rgba(0,229,255,0.05))",
                  borderBottom: "1px solid rgba(124,77,255,0.1)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    fontWeight: 800,
                  }}
                >
                  <CalendarMonth sx={{ color: "primary.main" }} />{" "}
                  {t("detail.bookThis") || "Reserve your spot"}
                </Typography>
              </Box>

              <Box
                sx={{ p: 0, borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <StaticDatePicker
                  displayStaticWrapperAs="desktop"
                  disablePast
                  value={dayjs(date)}
                  onChange={(newValue) => {
                    if (newValue) {
                      setDate(newValue.format("YYYY-MM-DD"));
                      setSelectedSlot(null);
                    }
                  }}
                  slotProps={{
                    actionBar: { actions: [] },
                    calendarHeader: { sx: { color: "white", fontWeight: 700 } },
                    day: {
                      sx: {
                        "&.Mui-selected": {
                          backgroundColor: "#7C4DFF !important",
                          fontWeight: 900,
                        },
                        color: "white",
                        fontSize: "0.9rem",
                      },
                    },
                  }}
                  sx={{
                    bgcolor: "transparent",
                    ".MuiPickersLayout-root": { bgcolor: "transparent" },
                    ".MuiDateCalendar-root": {
                      bgcolor: "transparent",
                      width: "100%",
                      maxWidth: "none",
                    },
                    ".MuiDayCalendar-header": {
                      justifyContent: "space-around",
                    },
                    ".MuiDayCalendar-weekContainer": {
                      justifyContent: "space-around",
                    },
                  }}
                />
              </Box>

              <CardContent sx={{ p: 4 }}>
                {/* Slots Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 2,
                      color: "grey.500",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <AccessTime
                      fontSize="small"
                      sx={{ color: "primary.main" }}
                    />
                    {t("detail.availableSlots") || "Available slots"}
                  </Typography>

                  {availableSlots.length > 0 ? (
                    <Grid container spacing={1.5}>
                      {availableSlots.map((slot: any) => {
                        const startRaw = new Date(
                          slot.startTime,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "UTC",
                        });
                        const endRaw = new Date(
                          slot.endTime,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "UTC",
                        });
                        const isActive =
                          selectedSlot?.availabilityId === slot.availabilityId;
                        const isBusy = isSlotBusy(slot);

                        return (
                          <Grid size={{ xs: 6 }} key={slot.availabilityId}>
                            <Button
                              fullWidth
                              variant={isActive ? "contained" : "outlined"}
                              onClick={() => !isBusy && setSelectedSlot(slot)}
                              disabled={isBusy}
                              sx={{
                                py: 1.5,
                                borderRadius: 3,
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                borderColor: isBusy
                                  ? "rgba(255,255,255,0.05)"
                                  : isActive
                                    ? "primary.main"
                                    : "rgba(255,255,255,0.1)",
                                background: isBusy
                                  ? "rgba(255,255,255,0.02)"
                                  : isActive
                                    ? "linear-gradient(135deg, #7C4DFF, #651FFF)"
                                    : "transparent",
                                color: isBusy
                                  ? "grey.700"
                                  : isActive
                                    ? "white"
                                    : "grey.400",
                                textDecoration: isBusy
                                  ? "line-through"
                                  : "none",
                                "&:hover": {
                                  borderColor: isBusy
                                    ? "rgba(255,255,255,0.05)"
                                    : "primary.main",
                                  backgroundColor: isBusy
                                    ? "rgba(255,255,255,0.02)"
                                    : isActive
                                      ? undefined
                                      : "rgba(124,77,255,0.1)",
                                },
                                "&.Mui-disabled": {
                                  color: "grey.800",
                                  borderColor: "rgba(255,255,255,0.05)",
                                },
                              }}
                            >
                              {isBusy
                                ? `${t("detail.occupied") || "Occupied"} (${startRaw})`
                                : `${startRaw} - ${endRaw}`}
                            </Button>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Alert
                      severity="info"
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        borderStyle: "dashed",
                        color: "grey.500",
                      }}
                    >
                      {t("detail.selectAnother") ||
                        "Select another date to see availability."}
                    </Alert>
                  )}
                </Box>

                {/* PAYMENT SECTION */}
                <Box
                  sx={{
                    mb: 4,
                    p: 3,
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 2,
                      color: "grey.500",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Payments fontSize="small" sx={{ color: "success.main" }} />
                    {t("detail.paymentMethod") || "Payment Method"}
                  </Typography>

                  <RadioGroup
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as "WALLET" | "CARD")
                    }
                  >
                    <Stack spacing={2}>
                      <Paper
                        variant="outlined"
                        onClick={() => setPaymentMethod("WALLET")}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          cursor: "pointer",
                          bgcolor:
                            paymentMethod === "WALLET"
                              ? "rgba(124,77,255,0.08)"
                              : "transparent",
                          borderColor:
                            paymentMethod === "WALLET"
                              ? "primary.main"
                              : "rgba(255,255,255,0.1)",
                          transition: "0.2s",
                        }}
                      >
                        <FormControlLabel
                          value="WALLET"
                          control={<Radio size="small" />}
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <AccountBalanceWallet
                                sx={{ color: "primary.main" }}
                              />
                              <Box>
                                <Typography variant="body2" fontWeight={700}>
                                  {t("detail.internalWallet") ||
                                    "Internal Wallet"}
                                </Typography>
                                <Typography variant="caption" color="grey.500">
                                  {t("detail.internalWalletDesc") ||
                                    "Fast & Secure internal balance"}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </Paper>

                      <Paper
                        variant="outlined"
                        onClick={() => setPaymentMethod("CARD")}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          cursor: "pointer",
                          bgcolor:
                            paymentMethod === "CARD"
                              ? "rgba(0,229,255,0.05)"
                              : "transparent",
                          borderColor:
                            paymentMethod === "CARD"
                              ? "#00E5FF"
                              : "rgba(255,255,255,0.1)",
                          transition: "0.2s",
                        }}
                      >
                        <FormControlLabel
                          value="CARD"
                          control={<Radio size="small" />}
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <CreditCard sx={{ color: "#00E5FF" }} />
                              <Box>
                                <Typography variant="body2" fontWeight={700}>
                                  {t("detail.creditCard") ||
                                    "Credit / Debit Card"}
                                </Typography>
                                <Typography variant="caption" color="grey.500">
                                  {t("detail.creditCardDesc") ||
                                    "Secure simulated gateway"}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </Paper>
                    </Stack>
                  </RadioGroup>
                </Box>

                {errorStatus && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {errorStatus}
                  </Alert>
                )}
                {successStatus && (
                  <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    {successStatus}
                  </Alert>
                )}

                <Divider sx={{ mb: 3, opacity: 0.1 }} />

                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body1"
                      color="grey.500"
                      fontWeight={500}
                    >
                      {t("detail.itemRental") || "Item Rental"}
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      €{resource.price || 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body1"
                      color="grey.500"
                      fontWeight={500}
                    >
                      {t("detail.securityDeposit") || "Security Deposit"}
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      €{resource.deposit || 0}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      p: 2,
                      borderRadius: 3,
                      bgcolor: "rgba(105,240,174,0.05)",
                      border: "1px solid rgba(105,240,174,0.2)",
                    }}
                  >
                    <Typography variant="h6" fontWeight={800} color="grey.300">
                      {t("detail.totalPrice") || "Total Price"}
                    </Typography>
                    <Typography variant="h5" fontWeight={900} color="#69F0AE">
                      €{(resource.deposit || 0) + (resource.price || 0)}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={!selectedSlot || isBooking}
                  startIcon={<CheckCircle />}
                  onClick={() => setConfirmOpen(true)}
                  sx={{
                    py: 2.5,
                    borderRadius: 4,
                    fontSize: "1.1rem",
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #7C4DFF, #651FFF)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #9C7CFF, #7C4DFF)",
                      transform: "translateY(-2px)",
                    },
                    boxShadow: "0 12px 24px rgba(124, 77, 255, 0.3)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    textTransform: "none",
                  }}
                >
                  {t("detail.confirm") || "Confirm Reservation"}
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 5,
            minWidth: 450,
            background: "#0A0E1A",
            border: "1px solid rgba(124,77,255,0.2)",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ pt: 4, px: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: "rgba(124,77,255,0.1)",
                display: "flex",
              }}
            >
              <Payments sx={{ color: "#7C4DFF" }} />
            </Box>
            <Typography variant="h5" fontWeight={900}>
              {t("detail.confirmTitle") || "Final Summary"}
            </Typography>
          </Box>
          <Typography variant="body2" color="grey.500">
            {t("detail.reviewDetails") ||
              "Please review your booking details before confirming."}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pt: 3 }}>
          <Stack spacing={2.5}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body1" color="grey.400">
                {t("detail.resource") || "Resource"}
              </Typography>
              <Typography variant="body1" fontWeight={800}>
                {resource.name}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body1" color="grey.400">
                {t("detail.date") || "Date"}
              </Typography>
              <Typography variant="body1" fontWeight={800}>
                {dayjs(date).format("MMMM D, YYYY")}
              </Typography>
            </Box>
            {selectedSlot && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1" color="grey.400">
                  {t("detail.time") || "Time"}
                </Typography>
                <Typography variant="body1" fontWeight={800}>
                  {new Date(selectedSlot.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  })}
                  {" - "}
                  {new Date(selectedSlot.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  })}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body1" color="grey.400">
                {t("detail.paymentVia") || "Payment via"}
              </Typography>
              <Chip
                icon={
                  paymentMethod === "CARD" ? (
                    <CreditCard fontSize="small" />
                  ) : (
                    <AccountBalanceWallet fontSize="small" />
                  )
                }
                label={
                  paymentMethod === "CARD"
                    ? t("detail.cardLabel") || "CARD"
                    : t("detail.walletLabel") || "WALLET"
                }
                size="small"
                sx={{
                  fontWeight: 700,
                  borderRadius: 1.5,
                  bgcolor:
                    paymentMethod === "CARD"
                      ? "rgba(0,229,255,0.1)"
                      : "rgba(124,77,255,0.1)",
                  color: paymentMethod === "CARD" ? "#00E5FF" : "#7C4DFF",
                }}
              />
            </Box>
            <Divider sx={{ opacity: 0.1 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h5" fontWeight={600} color="grey.200">
                {t("detail.totalPrice") || "Total Price"}
              </Typography>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ color: "#69F0AE" }}
              >
                €{(resource.price || 0) + (resource.deposit || 0)}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, gap: 2 }}>
          <Button
            fullWidth
            onClick={() => setConfirmOpen(false)}
            variant="text"
            sx={{ py: 1.5, fontWeight: 700, color: "grey.600" }}
          >
            {t("detail.cancel") || "Go Back"}
          </Button>
          <Button
            fullWidth
            disabled={isBooking}
            onClick={() => {
              setConfirmOpen(false);
              handleBook();
            }}
            variant="contained"
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: 900,
              background: "linear-gradient(135deg, #7C4DFF, #651FFF)",
              boxShadow: "0 8px 16px rgba(124, 77, 255, 0.2)",
            }}
          >
            {t("detail.confirmBtn") || "Authorize Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CARD PAYMENT PROCESSING ANIMATION */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 5000,
          flexDirection: "column",
          gap: 4,
          background: "rgba(10,14,26,0.95)",
          backdropFilter: "blur(20px)",
        }}
        open={isBooking}
      >
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress
            color="primary"
            size={120}
            thickness={2}
            sx={{ opacity: 0.3 }}
          />
          <CircularProgress
            color="primary"
            size={120}
            thickness={2}
            sx={{
              position: "absolute",
              left: 0,
              animationDuration: "1.5s",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {paymentMethod === "CARD" ? (
              <CreditCard sx={{ fontSize: 50, color: "primary.main" }} />
            ) : (
              <CalendarMonth sx={{ fontSize: 50, color: "primary.main" }} />
            )}
          </Box>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ letterSpacing: -1, mb: 1 }}
          >
            {paymentMethod === "CARD"
              ? t("detail.processingCard") || "Processing Card Payment"
              : t("detail.processingReservation") || "Creating Reservation"}
          </Typography>
          <Typography variant="h6" color="grey.500" sx={{ fontWeight: 500 }}>
            {t("detail.pleaseWait") || "Please do not refresh the page..."}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "primary.main",
                animation: `pulse 1s infinite alternate`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </Box>
        <style>
          {`
            @keyframes pulse {
                from { transform: scale(0.5); opacity: 0.3; }
                to { transform: scale(1.2); opacity: 1; }
            }
            `}
        </style>
      </Backdrop>

      {/* LIGHTBOX DIALOG */}
      <Dialog
        fullScreen
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        PaperProps={{
          sx: { bgcolor: "rgba(0,0,0,0.95)", backgroundImage: "none" },
        }}
      >
        <Box
          sx={{
            height: "100%",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: "absolute",
              top: 24,
              right: 24,
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <Close />
          </IconButton>

          {resource.photoUrls && resource.photoUrls.length > 0 && (
            <>
              <img
                src={resource.photoUrls[activePhotoIndex]}
                alt="Full representation"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />

              {resource.photoUrls.length > 1 && (
                <>
                  <IconButton
                    onClick={() =>
                      setActivePhotoIndex(
                        (prev) =>
                          (prev - 1 + resource.photoUrls.length) %
                          resource.photoUrls.length,
                      )
                    }
                    sx={{
                      position: "absolute",
                      left: 32,
                      color: "white",
                      scale: "1.5",
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      setActivePhotoIndex(
                        (prev) => (prev + 1) % resource.photoUrls.length,
                      )
                    }
                    sx={{
                      position: "absolute",
                      right: 32,
                      color: "white",
                      scale: "1.5",
                    }}
                  >
                    <ChevronRight />
                  </IconButton>

                  {/* Photo Counter */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 40,
                      color: "white",
                      bgcolor: "rgba(0,0,0,0.5)",
                      px: 3,
                      py: 1,
                      borderRadius: 10,
                      fontWeight: 700,
                    }}
                  >
                    {activePhotoIndex + 1} / {resource.photoUrls.length}
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
