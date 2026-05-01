import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  Skeleton,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import { ReserveDialog } from "@/features/reservations/ReserveDialog";
import { ReviewsSection } from "@/features/reviews/ReviewsSection";
import { useAuth } from "@/hooks/useAuth";
import { createRoom, deleteRoom, getHotel, updateRoom } from "../api";

const ROOM_LABEL = {
  single: "Single room",
  double: "Double room",
  suite: "Suite",
  family: "Family room",
};

export default function HotelDetailsPage() {
  const { id } = useParams();
  const [state, setState] = useState({
    status: "loading",
    hotel: null,
    error: null,
  });

  const fetchHotel = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setState((s) => ({ ...s, status: "loading", error: null }));
      try {
        const hotel = await getHotel(id);
        setState({ status: "success", hotel, error: null });
      } catch (err) {
        setState({ status: "error", hotel: null, error: err });
      }
    },
    [id],
  );

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", hotel: null, error: null });
    getHotel(id)
      .then((hotel) => {
        if (!cancelled) setState({ status: "success", hotel, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", hotel: null, error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      <Button
        component={RouterLink}
        to="/hotels"
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 2 }}
      >
        Back to hotels
      </Button>

      {state.status === "loading" && (
        <Stack spacing={2}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="30%" />
          <Skeleton
            variant="rectangular"
            height={300}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 2 }}
          />
        </Stack>
      )}

      {state.status === "error" && (
        <Alert
          severity={state.error?.code === "NOT_FOUND" ? "warning" : "error"}
          action={
            <Button
              component={RouterLink}
              to="/hotels"
              color="inherit"
              size="small"
            >
              Browse other hotels
            </Button>
          }
        >
          {state.error?.code === "NOT_FOUND"
            ? "Hotel not found"
            : (state.error?.message ?? "Could not load this hotel")}
        </Alert>
      )}

      {state.status === "success" && state.hotel && (
        <HotelView
          hotel={state.hotel}
          onReviewsChanged={() => fetchHotel({ silent: true })}
        />
      )}
    </Container>
  );
}

function HotelView({ hotel, onReviewsChanged }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [pickedRoom, setPickedRoom] = useState(null);
  const [roomFormOpen, setRoomFormOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState("");
  const [roomError, setRoomError] = useState(null);
  const [savingRoom, setSavingRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({
    roomType: "single",
    capacity: 1,
    pricePerNight: 100,
    quantity: 1,
    amenities: "",
    images: "",
  });

  function csvToArray(csv) {
    return String(csv || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function sanitizeUrl(url) {
    try {
      const raw = String(url || "").trim();
      if (!raw) return raw;
      return encodeURI(raw);
    } catch {
      return String(url || "").trim();
    }
  }

  function csvToUrlArray(csv) {
    return csvToArray(csv).map(sanitizeUrl);
  }

  function toRoomForm(room) {
    return {
      roomType: room.roomType || "single",
      capacity: room.capacity ?? 1,
      pricePerNight: room.pricePerNight ?? 100,
      quantity: room.quantity ?? 1,
      amenities: Array.isArray(room.amenities) ? room.amenities.join(", ") : "",
      images: Array.isArray(room.images) ? room.images.join(", ") : "",
    };
  }

  async function submitRoom() {
    setSavingRoom(true);
    setRoomError(null);
    try {
      const payload = {
        roomType: roomForm.roomType,
        capacity: Number(roomForm.capacity),
        pricePerNight: Number(roomForm.pricePerNight),
        quantity: Number(roomForm.quantity),
        amenities: csvToArray(roomForm.amenities),
        images: csvToUrlArray(roomForm.images),
      };
      if (editingRoomId) await updateRoom(editingRoomId, payload);
      else await createRoom(hotel.id, payload);
      setRoomFormOpen(false);
      setEditingRoomId("");
      await onReviewsChanged();
    } catch (err) {
      setRoomError(err?.message || "Could not save room");
    } finally {
      setSavingRoom(false);
    }
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {hotel.name}
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 0.5, sm: 2 }}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            color: "text.secondary",
          }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <LocationOnIcon fontSize="small" />
            <Typography variant="body2">
              {hotel.address ? `${hotel.address}, ` : ""}
              {hotel.city}
              {hotel.country ? `, ${hotel.country}` : ""}
            </Typography>
          </Stack>
          {hotel.reviewCount > 0 && (
            <>
              <Rating
                value={hotel.reviewAvg ?? 0}
                precision={0.5}
                readOnly
                size="small"
              />
              <Typography variant="body2">
                {(hotel.reviewAvg ?? 0).toFixed?.(1) ?? hotel.reviewAvg} ·{" "}
                {hotel.reviewCount} reviews
              </Typography>
            </>
          )}
        </Stack>
      </Box>

      {hotel.images?.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gap: 1,
            gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" },
            gridTemplateRows: { sm: "repeat(2, 1fr)" },
          }}
        >
          <Box
            component="img"
            src={hotel.images[0]}
            alt=""
            sx={{
              gridRow: { sm: "span 2" },
              width: "100%",
              aspectRatio: "16 / 9",
              objectFit: "cover",
              borderRadius: 2,
            }}
          />
          {hotel.images.slice(1, 3).map((src, i) => (
            <Box
              key={i}
              component="img"
              src={src}
              alt=""
              sx={{
                width: "100%",
                aspectRatio: "16 / 9",
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          ))}
        </Box>
      )}

      {hotel.description && (
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            About
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.7 }}
          >
            {hotel.description}
          </Typography>
        </Box>
      )}

      {hotel.amenities?.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Amenities
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
            {hotel.amenities.map((a) => (
              <Chip
                key={a}
                label={a}
                size="small"
                sx={{ textTransform: "capitalize" }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
        >
          <Typography variant="h6" fontWeight={600}>
            Rooms
          </Typography>
          {isAdmin && (
            <Stack direction="row" spacing={1}>
              <Button
                component={RouterLink}
                to={`/hotels/${hotel.id}/edit`}
                size="small"
                startIcon={<EditIcon />}
              >
                Edit hotel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setEditingRoomId("");
                  setRoomForm({
                    roomType: "single",
                    capacity: 1,
                    pricePerNight: 100,
                    quantity: 1,
                    amenities: "",
                    images: "",
                  });
                  setRoomFormOpen(true);
                }}
              >
                Add room
              </Button>
            </Stack>
          )}
        </Stack>
        {hotel.rooms?.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No rooms have been added yet.
          </Typography>
        ) : (
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
            {hotel.rooms.map((room) => (
              <Card key={room.id} variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {ROOM_LABEL[room.roomType] ?? room.roomType}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Up to {room.capacity} guest{room.capacity > 1 ? "s" : ""} ·{" "}
                    {room.quantity} available
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions
                  sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">
                      <Box component="span" fontWeight={600}>
                        ${room.pricePerNight}
                      </Box>
                      <Box component="span" color="text.secondary">
                        {" "}
                        / night
                      </Box>
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {isAdmin && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setEditingRoomId(room.id);
                              setRoomForm(toRoomForm(room));
                              setRoomFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={async () => {
                              try {
                                setRoomError(null);
                                await deleteRoom(room.id);
                                await onReviewsChanged();
                              } catch (err) {
                                setRoomError(err?.message || "Could not delete room");
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => setPickedRoom(room)}
                      >
                        Reserve
                      </Button>
                    </Stack>
                  </Stack>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <ReviewsSection hotel={hotel} onMutate={onReviewsChanged} />

      <ReserveDialog
        open={Boolean(pickedRoom)}
        onOpenChange={(open) => !open && setPickedRoom(null)}
        hotel={hotel}
        room={pickedRoom}
      />

      <Dialog
        open={isAdmin && roomFormOpen}
        onClose={() => {
          if (savingRoom) return;
          setRoomFormOpen(false);
          setEditingRoomId("");
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{editingRoomId ? "Edit room" : "Add room"}</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {roomError && <Alert severity="error">{roomError}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                select
                label="Type"
                value={roomForm.roomType}
                onChange={(e) =>
                  setRoomForm((s) => ({ ...s, roomType: e.target.value }))
                }
                sx={{ minWidth: 180 }}
              >
                {Object.keys(ROOM_LABEL).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Capacity"
                type="number"
                value={roomForm.capacity}
                onChange={(e) =>
                  setRoomForm((s) => ({ ...s, capacity: Number(e.target.value) }))
                }
              />
              <TextField
                label="Price / night"
                type="number"
                value={roomForm.pricePerNight}
                onChange={(e) =>
                  setRoomForm((s) => ({
                    ...s,
                    pricePerNight: Number(e.target.value),
                  }))
                }
              />
              <TextField
                label="Quantity"
                type="number"
                value={roomForm.quantity}
                onChange={(e) =>
                  setRoomForm((s) => ({ ...s, quantity: Number(e.target.value) }))
                }
              />
            </Stack>
            <TextField
              label="Amenities (comma separated)"
              value={roomForm.amenities}
              onChange={(e) =>
                setRoomForm((s) => ({ ...s, amenities: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Image URLs (comma separated)"
              value={roomForm.images}
              onChange={(e) =>
                setRoomForm((s) => ({ ...s, images: e.target.value }))
              }
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            onClick={() => {
              setRoomFormOpen(false);
              setEditingRoomId("");
            }}
            disabled={savingRoom}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={submitRoom} disabled={savingRoom}>
            {editingRoomId ? "Save room" : "Create room"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
