import { useState } from "react";
import { Formik, Form, useFormikContext } from "formik";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { FDatePicker } from "@/lib/formik-mui";
import { useAuth } from "@/hooks/useAuth";
import { createReservationSchema } from "./schemas";
import { createReservation } from "./api";

const ROOM_LABEL = {
  single: "Single room",
  double: "Double room",
  suite: "Suite",
  family: "Family room",
};

function tomorrow() {
  return dayjs().add(1, "day");
}

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = dayjs(checkOut).diff(dayjs(checkIn), "day");
  return diff > 0 ? diff : 0;
}

function PriceSummary({ pricePerNight }) {
  const { values } = useFormikContext();
  const nights = nightsBetween(values.checkIn, values.checkOut);
  const total = nights * pricePerNight;
  return (
    <Stack spacing={0.75}>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "baseline" }}
      >
        <Typography variant="body2" color="text.secondary">
          ${pricePerNight} × {nights || 0} night{nights === 1 ? "" : "s"}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          ${total}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "baseline" }}
      >
        <Typography variant="body1" fontWeight={600}>
          Total
        </Typography>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          ${total}
        </Typography>
      </Stack>
    </Stack>
  );
}

function GuestsSelect({ capacity }) {
  const { values, setFieldValue } = useFormikContext();
  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="guests-label">Guests</InputLabel>
      <Select
        labelId="guests-label"
        label="Guests"
        value={values.guests}
        onChange={(e) => setFieldValue("guests", Number(e.target.value), true)}
      >
        {Array.from({ length: capacity }, (_, i) => {
          const n = i + 1;
          return (
            <MenuItem key={n} value={n}>
              {n} {n === 1 ? "guest" : "guests"}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

function CheckInPicker() {
  const { values, setFieldValue } = useFormikContext();
  return (
    <FDatePicker
      name="checkIn"
      label="Check-in"
      minDate={tomorrow()}
      onChange={(d) => {
        if (!d) return;
        // Keep checkOut strictly after checkIn — bump it forward when needed.
        const currentCheckOut = values.checkOut ? dayjs(values.checkOut) : null;
        if (!currentCheckOut || !currentCheckOut.isAfter(d, "day")) {
          setFieldValue("checkOut", d.add(1, "day").format("YYYY-MM-DD"), true);
        }
      }}
    />
  );
}

function CheckOutPicker() {
  const { values } = useFormikContext();
  const checkInDay = values.checkIn ? dayjs(values.checkIn) : null;
  const minCheckOut = checkInDay
    ? checkInDay.add(1, "day")
    : tomorrow().add(1, "day");
  return (
    <FDatePicker name="checkOut" label="Check-out" minDate={minCheckOut} />
  );
}

function SubmitButton({ pricePerNight, isSubmitting }) {
  const { values, isValid, dirty } = useFormikContext();
  const nights = nightsBetween(values.checkIn, values.checkOut);
  const total = nights * pricePerNight;
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={isSubmitting || nights === 0 || (!isValid && dirty)}
    >
      {isSubmitting ? "Reserving…" : `Confirm${total ? ` · $${total}` : ""}`}
    </Button>
  );
}

export function ReserveDialog({ open, onOpenChange, hotel, room }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  if (!room) return null;

  // Variant: unauthenticated
  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return (
      <Dialog
        open={open}
        onClose={() => onOpenChange(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Sign in to reserve</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You need an account to make a booking.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/login?returnTo=${returnTo}`)}
          >
            Sign in
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Variant: confirmation
  if (confirmation) {
    return (
      <Dialog
        open={open}
        onClose={() => {
          onOpenChange(false);
          setConfirmation(null);
          setServerError(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reservation confirmed</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {hotel?.name} · {ROOM_LABEL[room.roomType] ?? room.roomType}
          </DialogContentText>
          <Stack spacing={1.25}>
            <SummaryRow
              label="Check-in"
              value={dayjs(confirmation.checkIn).format("MMM D, YYYY")}
            />
            <SummaryRow
              label="Check-out"
              value={dayjs(confirmation.checkOut).format("MMM D, YYYY")}
            />
            <SummaryRow label="Nights" value={confirmation.nights} />
            <SummaryRow label="Guests" value={confirmation.guests} />
            <SummaryRow
              label="Total"
              value={`$${confirmation.totalPrice}`}
              bold
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="contained" onClick={() => navigate("/reservations")}>
            View my reservations
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Variant: form
  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Reserve {ROOM_LABEL[room.roomType] ?? room.roomType}
      </DialogTitle>
      <Formik
        initialValues={{
          roomId: room.id,
          checkIn: tomorrow().format("YYYY-MM-DD"),
          checkOut: tomorrow().add(1, "day").format("YYYY-MM-DD"),
          guests: 1,
        }}
        validationSchema={createReservationSchema}
        enableReinitialize
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          setServerError(null);
          try {
            const reservation = await createReservation(values);
            setConfirmation(reservation);
          } catch (err) {
            if (err?.code === "CONFLICT") {
              setServerError(err.message);
            } else if (
              err?.code === "VALIDATION_ERROR" &&
              Array.isArray(err.details)
            ) {
              for (const d of err.details) {
                if (d.field) setFieldError(d.field, d.message);
              }
            } else {
              setServerError(err?.message ?? "Could not create reservation");
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form noValidate>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                {hotel?.name} · ${room.pricePerNight} / night · sleeps up to{" "}
                {room.capacity}
              </DialogContentText>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <CheckInPicker />
                  <CheckOutPicker />
                </Stack>
                <GuestsSelect capacity={room.capacity} />
                <Divider sx={{ my: 0.5 }} />
                <PriceSummary pricePerNight={room.pricePerNight} />
                {serverError && <Alert severity="error">{serverError}</Alert>}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button
                type="button"
                variant="text"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <SubmitButton
                pricePerNight={room.pricePerNight}
                isSubmitting={isSubmitting}
              />
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        alignItems: "baseline",
        gap: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={bold ? 600 : 400}>
        {value}
      </Typography>
    </Box>
  );
}
