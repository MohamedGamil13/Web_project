import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Container,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getOccupancyInsights } from "../api";

function levelColor(level) {
  if (level === "critical") return "error";
  if (level === "warning") return "warning";
  return "default";
}

export default function AdminInsightsPage() {
  const [days, setDays] = useState(14);
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await getOccupancyInsights({ days });
        if (!cancelled) setState({ loading: false, error: null, data });
      } catch (err) {
        if (!cancelled) {
          setState({
            loading: false,
            error: err?.message ?? "Could not load insights",
            data: null,
          });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const summary = state.data?.summary;
  const items = state.data?.items ?? [];
  const alerts = state.data?.alerts ?? [];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Occupancy Insights
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Capacity utilization, threshold alerts, and sell-out forecast.
              </Typography>
            </Box>
            <Select
              size="small"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value={7}>Next 7 days</MenuItem>
              <MenuItem value={14}>Next 14 days</MenuItem>
              <MenuItem value={30}>Next 30 days</MenuItem>
            </Select>
          </Stack>
        </Paper>

        {state.error && <Alert severity="error">{state.error}</Alert>}
        {state.loading && <Typography color="text.secondary">Loading insights...</Typography>}

        {!state.loading && summary && (
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Overall utilization
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {(summary.overallUtilization * 100).toFixed(1)}%
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Capacity nights
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {summary.capacityNights}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Alerted room types
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {summary.alertCount}
              </Typography>
            </Paper>
          </Stack>
        )}

        {!state.loading && alerts.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Proactive Alerts
            </Typography>
            <Stack spacing={1}>
              {alerts.map((a) => (
                <Stack
                  key={`${a.roomId}-${a.hotelName}-${a.roomType}`}
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  alignItems={{ md: "center" }}
                  justifyContent="space-between"
                  sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.25 }}
                >
                  <Typography variant="body2">
                    {a.hotelName} - {a.roomType} ({(a.utilization * 100).toFixed(1)}%)
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" color={levelColor(a.thresholdLevel)} label={`Threshold: ${a.thresholdLevel}`} />
                    <Chip size="small" color={levelColor(a.forecastLevel)} label={`Forecast: ${a.forecastLevel}`} />
                    {a.daysToFull !== null && (
                      <Chip size="small" label={`~${a.daysToFull} days to full`} />
                    )}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Paper>
        )}

        {!state.loading && items.length > 0 && (
          <Paper variant="outlined" sx={{ p: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ px: 2, pt: 2, pb: 1 }}>
              Room-Type Utilization
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Hotel</TableCell>
                    <TableCell>Room Type</TableCell>
                    <TableCell align="right">Units</TableCell>
                    <TableCell align="right">Booked / Capacity</TableCell>
                    <TableCell align="right">Utilization</TableCell>
                    <TableCell>Threshold</TableCell>
                    <TableCell>Forecast</TableCell>
                    <TableCell align="right">ETA Full</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((i) => (
                    <TableRow key={i.roomId} hover>
                      <TableCell>{i.hotel?.name ?? "Unknown"}</TableCell>
                      <TableCell sx={{ textTransform: "capitalize" }}>{i.roomType}</TableCell>
                      <TableCell align="right">{i.quantity}</TableCell>
                      <TableCell align="right">
                        {i.bookedNights} / {i.capacityNights}
                      </TableCell>
                      <TableCell align="right">{(i.utilization * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={levelColor(i.thresholdLevel)}
                          label={i.thresholdLevel}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" color={levelColor(i.forecast.level)} label={i.forecast.level} />
                      </TableCell>
                      <TableCell align="right">
                        {i.forecast.daysToFull === null ? "-" : `${i.forecast.daysToFull}d`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
