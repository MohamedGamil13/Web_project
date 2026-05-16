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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ReservationCard } from "../ReservationCard";
import { ReservationTimelineDialog } from "../ReservationTimelineDialog";
import { listMyReservations } from "../api";

function isPastStay(reservation) {
  return (
    reservation.status === "active" &&
    new Date(reservation.checkOut) <= new Date()
  );
}

function isCancelled(reservation) {
  return reservation.status === "cancelled";
}

export default function ReservationsHistoryPage() {
  const [state, setState] = useState({
    status: "loading",
    items: [],
    error: null,
  });
  const [timelineTarget, setTimelineTarget] = useState(null);

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

  const items = state.items ?? [];
  const past = items.filter(isPastStay);
  const cancelled = items.filter(isCancelled);
  const hasHistory = past.length > 0 || cancelled.length > 0;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack spacing={4}>
        <Box>
          <Button
            component={RouterLink}
            to="/reservations"
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{ mb: 1 }}
          >
            Back to current
          </Button>
          <Typography variant="h5" fontWeight={600}>
            Past reservations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stays you've already taken and any reservations you've cancelled.
          </Typography>
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

        {state.status === "success" && !hasHistory && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>
                No history yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Past stays and cancelled reservations will show up here.
              </Typography>
              <Button
                component={RouterLink}
                to="/reservations"
                variant="contained"
              >
                Back to current
              </Button>
            </CardContent>
          </Card>
        )}

        {state.status === "success" && past.length > 0 && (
          <Section title="Past stays">
            {past.map((r) => (
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

        {state.status === "success" && cancelled.length > 0 && (
          <Section title="Cancelled">
            {cancelled.map((r) => (
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
      </Stack>
      <ReservationTimelineDialog
        open={Boolean(timelineTarget)}
        onClose={() => setTimelineTarget(null)}
        reservation={timelineTarget}
      />
    </Container>
  );
}

function Section({ title, children }) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>
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
