import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ReservationCard } from "../ReservationCard";
import { ReservationTimelineDialog } from "../ReservationTimelineDialog";
import { cancelReservation, listMyReservations } from "../api";

const RECENT_CANCELLED_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isUpcoming(reservation) {
  return (
    reservation.status === "active" &&
    new Date(reservation.checkIn) > new Date()
  );
}

function isRecentlyCancelled(reservation) {
  if (reservation.status !== "cancelled") return false;
  if (!reservation.cancelledAt) return false;
  return (
    Date.now() - new Date(reservation.cancelledAt).getTime() <=
    RECENT_CANCELLED_WINDOW_MS
  );
}

export default function ReservationsPage() {
  const [state, setState] = useState({
    status: "loading",
    items: [],
    error: null,
  });
  const [target, setTarget] = useState(null);
  const [timelineTarget, setTimelineTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  async function refresh() {
    setState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const items = await listMyReservations();
      setState({ status: "success", items, error: null });
    } catch (err) {
      setState({ status: "error", items: [], error: err });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleConfirmCancel() {
    if (!target) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelReservation(target.id);
      setTarget(null);
      await refresh();
    } catch (err) {
      setCancelError(err?.message ?? "Could not cancel");
    } finally {
      setCancelling(false);
    }
  }

  const items = state.items ?? [];
  const upcoming = items.filter(isUpcoming);
  const recentlyCancelled = items.filter(isRecentlyCancelled);
  const hasCurrent = upcoming.length > 0 || recentlyCancelled.length > 0;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack spacing={4}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1.5,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight={600}>
              Current reservations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upcoming stays, plus anything you've cancelled in the last hour.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/reservations/history"
            variant="text"
            size="small"
            startIcon={<HistoryIcon />}
            sx={{
              flexShrink: 0,
              alignSelf: { xs: "flex-start", sm: "center" },
            }}
          >
            View past reservations
          </Button>
        </Box>

        {state.status === "loading" && <ReservationGridSkeleton />}

        {state.status === "error" && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refresh}>
                Try again
              </Button>
            }
          >
            {state.error?.message ?? "Could not load reservations."}
          </Alert>
        )}

        {state.status === "success" && !hasCurrent && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>
                No current reservations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Browse hotels to make your first booking, or check your history.
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button component={RouterLink} to="/hotels" variant="contained">
                  Browse hotels
                </Button>
                <Button
                  component={RouterLink}
                  to="/reservations/history"
                  variant="outlined"
                >
                  Past reservations
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {state.status === "success" && hasCurrent && (
          <>
            {upcoming.length > 0 && (
              <Section title="Upcoming">
                {upcoming.map((r) => (
                  <ReservationCard
                    key={r.id}
                    reservation={r}
                    onCancel={() => setTarget(r)}
                    cancellable
                    actions={
                      <Button size="small" variant="outlined" onClick={() => setTimelineTarget(r)}>
                        Timeline
                      </Button>
                    }
                  />
                ))}
              </Section>
            )}

            {recentlyCancelled.length > 0 && (
              <Section
                title="Recently cancelled"
                subtitle="Cancelled in the last hour. Older cancellations live under past reservations."
              >
                {recentlyCancelled.map((r) => (
                  <ReservationCard
                    key={r.id}
                    reservation={r}
                    actions={
                      <Button size="small" variant="outlined" onClick={() => setTimelineTarget(r)}>
                        Timeline
                      </Button>
                    }
                  />
                ))}
              </Section>
            )}
          </>
        )}

        {cancelError && <Alert severity="error">{cancelError}</Alert>}
      </Stack>

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(open) => {
          if (!open) {
            setTarget(null);
            setCancelError(null);
          }
        }}
        title="Cancel this reservation?"
        description={
          target
            ? `${target.hotel?.name} · ${new Date(target.checkIn).toLocaleDateString()} → ${new Date(target.checkOut).toLocaleDateString()} · $${target.totalPrice}`
            : ""
        }
        confirmLabel="Yes, cancel"
        cancelLabel="Keep reservation"
        destructive
        busy={cancelling}
        onConfirm={handleConfirmCancel}
      />

      <ReservationTimelineDialog
        open={Boolean(timelineTarget)}
        onClose={() => setTimelineTarget(null)}
        reservation={timelineTarget}
      />
    </Container>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}

function ReservationGridSkeleton() {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        },
      }}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} variant="outlined">
          <CardContent>
            <Skeleton width="60%" />
            <Skeleton width="45%" />
            <Box mt={1.5}>
              <Skeleton width="80%" />
              <Skeleton width="50%" />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
