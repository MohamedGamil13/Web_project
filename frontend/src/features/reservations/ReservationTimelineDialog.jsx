import { useEffect, useState } from "react";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import { getReservationTimeline } from "./api";

function colorForRole(role) {
  if (role === "owner") return "error";
  if (role === "admin") return "warning";
  if (role === "user") return "primary";
  return "default";
}

function actorLabel(ev) {
  if (ev.actorName && ev.actorEmail) return `${ev.actorName} (${ev.actorEmail})`;
  if (ev.actorName) return ev.actorName;
  if (ev.actorEmail) return ev.actorEmail;
  return ev.actorRole;
}

export function ReservationTimelineDialog({ open, onClose, reservation }) {
  const [state, setState] = useState({ loading: false, error: null, items: [] });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!open || !reservation?.id) return;
      setState({ loading: true, error: null, items: [] });
      try {
        const items = await getReservationTimeline(reservation.id);
        if (!cancelled) setState({ loading: false, error: null, items });
      } catch (err) {
        if (!cancelled) {
          setState({
            loading: false,
            error: err?.message ?? "Could not load workflow timeline",
            items: [],
          });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [open, reservation?.id]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Reservation workflow timeline</DialogTitle>
      <DialogContent>
        {state.error && <Alert severity="error">{state.error}</Alert>}
        {state.loading && <Typography color="text.secondary">Loading timeline...</Typography>}
        {!state.loading && !state.error && (
          <Stack spacing={1.25}>
            {(state.items ?? []).map((ev, idx) => (
              <Stack
                key={`${ev.event}-${ev.at}-${idx}`}
                spacing={0.5}
                sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.25 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" fontWeight={600}>
                    {ev.event}
                  </Typography>
                  <Chip size="small" color={colorForRole(ev.actorRole)} label={ev.actorRole} />
                  <Typography variant="caption" color="text.secondary">
                    by {actorLabel(ev)}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {ev.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(ev.at).toLocaleString()}
                </Typography>
              </Stack>
            ))}
            {state.items.length === 0 && (
              <Typography color="text.secondary">No workflow events yet.</Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
