import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { listMyNotifications, markNotificationRead } from "../api";

function NotificationRow({ item, onRead }) {
  const isRead = Boolean(item.readAt);
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderColor: isRead ? "divider" : "primary.main",
        bgcolor: isRead ? "background.paper" : "action.hover",
        borderRadius: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
              {item.title}
            </Typography>
            <Chip
              size="small"
              color={isRead ? "default" : "primary"}
              label={isRead ? "Read" : "Unread"}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            {item.message}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(item.createdAt).toLocaleString()}
          </Typography>
        </Stack>
        {!isRead && (
          <Button
            size="small"
            variant="contained"
            onClick={() => onRead(item.id)}
            sx={{ alignSelf: { xs: "flex-start", sm: "center" }, px: 1.75 }}
          >
            Mark read
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await listMyNotifications({ page: 1, pageSize: 30 });
      setItems(result.items);
    } catch (e) {
      setError(e?.message ?? "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
    } catch (e) {
      setError(e?.message ?? "Failed to update notification");
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <NotificationsNoneOutlinedIcon fontSize="small" />
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
      </Stack>

      {error && (
        <Alert sx={{ mb: 2 }} severity="error">
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography color="text.secondary">Loading notifications...</Typography>
      ) : items.length === 0 ? (
        <Box sx={{ py: 4 }}>
          <Typography color="text.secondary">No notifications yet.</Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {items.map((item) => (
            <NotificationRow key={item.id} item={item} onRead={handleMarkRead} />
          ))}
        </Stack>
      )}
    </Container>
  );
}
