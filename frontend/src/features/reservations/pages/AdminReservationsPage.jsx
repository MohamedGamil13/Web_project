import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ReservationCard } from "../ReservationCard";
import {
  cancelReservation,
  listAdminReservations,
  updateReservationAsAdmin,
} from "../api";

const DEFAULT_FILTERS = {
  status: "active",
  priceRange: [0, 1000],
  minHotelRating: "",
  page: 1,
  pageSize: 9,
};

const DEFAULT_FORM = { checkIn: "", checkOut: "", guests: 1 };

function cleanQuery(filters) {
  const q = {
    status: filters.status || "active",
    page: filters.page,
    pageSize: filters.pageSize,
    minRoomPrice: filters.priceRange[0],
    maxRoomPrice: filters.priceRange[1],
  };
  if (filters.minHotelRating !== "") q.minHotelRating = Number(filters.minHotelRating);
  return q;
}

export default function AdminReservationsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [state, setState] = useState({
    status: "loading",
    items: [],
    meta: { page: 1, pageSize: 9, total: 0 },
    error: null,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [priceDraft, setPriceDraft] = useState(DEFAULT_FILTERS.priceRange);

  async function refresh(nextFilters = filters) {
    setState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const res = await listAdminReservations(cleanQuery(nextFilters));
      setState({ status: "success", items: res.items, meta: res.meta, error: null });
    } catch (err) {
      setState({
        status: "error",
        items: [],
        meta: { page: 1, pageSize: 9, total: 0 },
        error: err,
      });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function openEditDialog(reservation) {
    setEditingReservation(reservation);
    setForm({
      checkIn: reservation.checkIn?.slice(0, 10) || "",
      checkOut: reservation.checkOut?.slice(0, 10) || "",
      guests: reservation.guests ?? 1,
    });
    setDialogError(null);
    setDialogOpen(true);
  }

  async function submitReservation() {
    if (!editingReservation) return;
    setSaving(true);
    setDialogError(null);
    try {
      await updateReservationAsAdmin(editingReservation.id, {
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
      });
      setDialogOpen(false);
      await refresh();
    } catch (err) {
      setDialogError(err?.message || "Could not save reservation");
    } finally {
      setSaving(false);
    }
  }

  async function confirmCancelReservation() {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelReservation(cancelTarget.id);
      setCancelTarget(null);
      await refresh();
    } catch (err) {
      setCancelError(err?.message || "Could not cancel reservation");
    } finally {
      setCancelling(false);
    }
  }

  const total = state.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (state.meta?.pageSize || 9)));
  const showSkeletons = state.status === "loading" && state.items.length === 0;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack spacing={4}>
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            Reservations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage reservations across all users.
          </Typography>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "280px 1fr" },
          }}
        >
          <Box component="aside">
            <Paper
              variant="outlined"
              sx={{ p: 2, position: { lg: "sticky" }, top: { lg: 88 } }}
            >
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Filters
                </Typography>

                <FormControl size="small" fullWidth>
                  <InputLabel id="reservation-status-label">Status</InputLabel>
                  <Select
                    labelId="reservation-status-label"
                    label="Status"
                    value={filters.status}
                  onChange={(e) =>
                      setFilters((s) => ({ ...s, status: e.target.value, page: 1 }))
                    }
                  >
                    <MenuItem value="active">Active</MenuItem>
                  </Select>
                </FormControl>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Room price (${priceDraft[0]} - ${priceDraft[1]})
                  </Typography>
                  <Slider
                    value={priceDraft}
                    min={0}
                    max={1000}
                    step={10}
                    onChange={(_e, value) => setPriceDraft(value)}
                    valueLabelDisplay="auto"
                  />
                </Box>

                <TextField
                  label="Min hotel rating"
                  size="small"
                  type="number"
                  value={filters.minHotelRating}
                  onChange={(e) =>
                    setFilters((s) => ({ ...s, minHotelRating: e.target.value, page: 1 }))
                  }
                  slotProps={{ htmlInput: { min: 0, max: 5, step: 0.1 } }}
                  fullWidth
                />

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      const next = { ...filters, priceRange: priceDraft, page: 1 };
                      setFilters(next);
                      refresh(next);
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => {
                      setFilters(DEFAULT_FILTERS);
                      setPriceDraft(DEFAULT_FILTERS.priceRange);
                      refresh(DEFAULT_FILTERS);
                    }}
                  >
                    Reset
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Box>

          <Box component="section">
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                {state.status === "error"
                  ? "Could not load reservations"
                  : showSkeletons
                    ? "Loading…"
                    : `${total} reservation${total === 1 ? "" : "s"}`}
              </Typography>

              {showSkeletons && (
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      xl: "repeat(3, 1fr)",
                    },
                  }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Paper key={i} variant="outlined" sx={{ p: 2 }}>
                      <Skeleton width="70%" />
                      <Skeleton width="40%" />
                      <Skeleton width="85%" sx={{ mt: 1 }} />
                    </Paper>
                  ))}
                </Box>
              )}

              {state.status === "error" && (
                <Alert severity="error">
                  {state.error?.message || "Could not load reservations"}
                </Alert>
              )}
              {cancelError && <Alert severity="error">{cancelError}</Alert>}

              {state.status === "success" && state.items.length === 0 && (
                <Alert severity="info">No reservations matched your filters.</Alert>
              )}

              {state.items.length > 0 && (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        xl: "repeat(3, 1fr)",
                      },
                    }}
                  >
                    {state.items.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        cancellable={reservation.status === "active"}
                        onCancel={() => setCancelTarget(reservation)}
                        actions={
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openEditDialog(reservation)}
                          >
                            Edit
                          </Button>
                        }
                      />
                    ))}
                  </Box>
                  {totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
                      <Pagination
                        count={totalPages}
                        page={filters.page}
                        onChange={(_e, value) => {
                          const next = { ...filters, page: value };
                          setFilters(next);
                          refresh(next);
                        }}
                        shape="rounded"
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </Stack>
          </Box>
        </Box>
      </Stack>

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit reservation</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <DatePicker
                label="Check-in"
                value={form.checkIn ? dayjs(form.checkIn) : null}
                onChange={(d) => {
                  const next = d ? d.format("YYYY-MM-DD") : "";
                  setForm((s) => {
                    // Keep checkOut strictly after checkIn — bump it forward
                    // when the new check-in lands on/after the current one.
                    const currentOut = s.checkOut ? dayjs(s.checkOut) : null;
                    const needsBump =
                      d && (!currentOut || !currentOut.isAfter(d, "day"));
                    return {
                      ...s,
                      checkIn: next,
                      checkOut: needsBump
                        ? d.add(1, "day").format("YYYY-MM-DD")
                        : s.checkOut,
                    };
                  });
                }}
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
              <DatePicker
                label="Check-out"
                value={form.checkOut ? dayjs(form.checkOut) : null}
                onChange={(d) =>
                  setForm((s) => ({
                    ...s,
                    checkOut: d ? d.format("YYYY-MM-DD") : "",
                  }))
                }
                minDate={
                  form.checkIn
                    ? dayjs(form.checkIn).add(1, "day")
                    : undefined
                }
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
            </Stack>
            <TextField
              label="Guests"
              type="number"
              size="small"
              value={form.guests}
              onChange={(e) =>
                setForm((s) => ({ ...s, guests: Number(e.target.value) }))
              }
              slotProps={{ htmlInput: { min: 1 } }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={submitReservation} disabled={saving}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancelError(null);
          }
        }}
        title="Cancel this reservation?"
        description={
          cancelTarget
            ? `${cancelTarget.hotel?.name} · ${new Date(cancelTarget.checkIn).toLocaleDateString()} → ${new Date(cancelTarget.checkOut).toLocaleDateString()} · $${cancelTarget.totalPrice}`
            : ""
        }
        confirmLabel="Yes, cancel"
        cancelLabel="Keep reservation"
        destructive
        busy={cancelling}
        onConfirm={confirmCancelReservation}
      />
    </Container>
  );
}
