import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { createHotel, getHotel, updateHotel } from "../api";

const initialForm = {
  name: "",
  city: "",
  country: "",
  starRating: 4,
  description: "",
  address: "",
  amenities: "",
  images: "",
  priceFrom: 0,
};

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

function hotelToForm(hotel) {
  return {
    name: hotel.name || "",
    city: hotel.city || "",
    country: hotel.country || "",
    starRating: hotel.starRating ?? 4,
    description: hotel.description || "",
    address: hotel.address || "",
    amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : "",
    images: Array.isArray(hotel.images) ? hotel.images.join(", ") : "",
    priceFrom: hotel.priceFrom ?? 0,
  };
}

export default function HotelFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const title = useMemo(
    () => (isEdit ? "Edit hotel" : "Create hotel"),
    [isEdit],
  );

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setLoading(true);
    getHotel(id)
      .then((hotel) => {
        if (!cancelled) setForm(hotelToForm(hotel));
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Could not load hotel");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...form,
        amenities: csvToArray(form.amenities),
        images: csvToUrlArray(form.images),
        starRating: Number(form.starRating),
        priceFrom: Number(form.priceFrom),
      };
      const hotel = isEdit
        ? await updateHotel(id, payload)
        : await createHotel(payload);
      navigate(`/hotels/${hotel.id}`);
    } catch (err) {
      setError(err?.message || "Could not save hotel");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading…</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Button
          component={RouterLink}
          to={isEdit ? `/hotels/${id}` : "/hotels"}
          startIcon={<ArrowBackIcon />}
          size="small"
          sx={{ alignSelf: "flex-start" }}
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {title}
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Paper component="form" variant="outlined" sx={{ p: 3 }} onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Hotel name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="City"
                value={form.city}
                onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Country"
                value={form.country}
                onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))}
                required
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                select
                label="Star rating"
                value={form.starRating}
                onChange={(e) =>
                  setForm((s) => ({ ...s, starRating: Number(e.target.value) }))
                }
                sx={{ maxWidth: 180 }}
              >
                {[1, 2, 3, 4, 5].map((x) => (
                  <MenuItem key={x} value={x}>
                    {x}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Price from"
                type="number"
                value={form.priceFrom}
                onChange={(e) =>
                  setForm((s) => ({ ...s, priceFrom: Number(e.target.value) }))
                }
                sx={{ maxWidth: 180 }}
              />
            </Stack>
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm((s) => ({ ...s, description: e.target.value }))
              }
              fullWidth
              multiline
              minRows={3}
            />
            <TextField
              label="Amenities (comma separated)"
              value={form.amenities}
              onChange={(e) =>
                setForm((s) => ({ ...s, amenities: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Image URLs (comma separated)"
              value={form.images}
              onChange={(e) => setForm((s) => ({ ...s, images: e.target.value }))}
              fullWidth
            />
            <Box>
              <Button type="submit" variant="contained" disabled={submitting}>
                {isEdit ? "Save changes" : "Create hotel"}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
