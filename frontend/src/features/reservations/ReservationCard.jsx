import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";

const ROOM_LABEL = {
  single: "Single room",
  double: "Double room",
  suite: "Suite",
  family: "Family room",
};

function fmtDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ReservationCard({
  reservation,
  onCancel,
  cancellable,
  actions = null,
}) {
  const { hotel, room, checkIn, checkOut, nights, guests, totalPrice, status } =
    reservation;
  const isPastStay = status === "active" && new Date(checkOut) <= new Date();
  return (
    <Card
      variant="outlined"
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {hotel?.name ?? "Hotel"}
            </Typography>
            {status === "cancelled" && (
              <Chip
                label="Cancelled"
                size="small"
                variant="outlined"
                sx={{ flexShrink: 0 }}
              />
            )}
            {isPastStay && (
              <Chip label="Past" size="small" sx={{ flexShrink: 0 }} />
            )}
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", color: "text.secondary" }}
          >
            <LocationOnIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">
              {hotel?.city}
              {hotel?.country ? `, ${hotel.country}` : ""}
            </Typography>
          </Stack>
          <Stack spacing={0.75}>
            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
              {ROOM_LABEL[room?.roomType] ?? room?.roomType ?? "Room"}
            </Typography>
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: "center", color: "text.secondary" }}
            >
              <CalendarMonthIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">
                {fmtDate(checkIn)} → {fmtDate(checkOut)} · {nights} night
                {nights === 1 ? "" : "s"}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: "center", color: "text.secondary" }}
            >
              <GroupIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">
                {guests} guest{guests === 1 ? "" : "s"}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Typography variant="body2">
          <Box component="span" color="text.secondary">
            Total:{" "}
          </Box>
          <Box component="span" fontWeight={600}>
            ${totalPrice}
          </Box>
        </Typography>
        <Stack direction="row" spacing={1}>
          {actions}
          {cancellable && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
}
