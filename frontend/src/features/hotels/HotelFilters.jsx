import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AMENITY_OPTIONS,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  RATING_OPTIONS,
  SORT_OPTIONS,
} from "./filters";

function priceFromFilters(filters) {
  const lo = filters.minPrice === "" ? PRICE_MIN : Number(filters.minPrice);
  const hi = filters.maxPrice === "" ? PRICE_MAX : Number(filters.maxPrice);
  return [
    Number.isFinite(lo) ? lo : PRICE_MIN,
    Number.isFinite(hi) ? hi : PRICE_MAX,
  ];
}

export function HotelFilters({ filters, onChange, onReset }) {
  const [priceRange, setPriceRange] = useState(() => priceFromFilters(filters));

  useEffect(() => {
    setPriceRange(priceFromFilters(filters));
  }, [filters.minPrice, filters.maxPrice]);

  function commitPrice(value) {
    const [lo, hi] = value;
    onChange({
      minPrice: lo === PRICE_MIN ? "" : String(lo),
      maxPrice: hi === PRICE_MAX ? "" : String(hi),
      page: 1,
    });
  }

  function toggleAmenity(value) {
    const next = new Set(filters.amenities);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange({ amenities: Array.from(next), page: 1 });
  }

  const [lo, hi] = priceRange;
  const priceLabel = `$${lo} – $${hi}${hi >= PRICE_MAX ? "+" : ""}`;

  return (
    <Card
      variant="outlined"
      sx={{ position: "sticky", top: 16, alignSelf: "flex-start" }}
    >
      <CardHeader
        title={
          <Typography variant="subtitle1" fontWeight={600}>
            Filters
          </Typography>
        }
        action={
          <Button
            variant="text"
            size="small"
            onClick={onReset}
            sx={{ mt: 0.25 }}
          >
            Reset
          </Button>
        }
        sx={{
          py: 1.25,
          px: 2,
          "& .MuiCardHeader-action": { m: 0, alignSelf: "center" },
        }}
      />
      <Divider />
      <CardContent sx={{ pt: 2.5 }}>
        <Stack spacing={3}>
          <TextField
            label="City"
            placeholder="e.g. Lisbon"
            size="small"
            fullWidth
            value={filters.city}
            onChange={(e) => onChange({ city: e.target.value, page: 1 })}
          />

          <Box>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                Price per night
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {priceLabel}
              </Typography>
            </Stack>
            {/* Pad the slider so its thumbs at the endpoints don't overflow,
                and align the min/max labels to the same inset. */}
            <Box sx={{ px: 1 }}>
              <Slider
                value={priceRange}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                disableSwap
                onChange={(_e, value) => setPriceRange(value)}
                onChangeCommitted={(_e, value) => commitPrice(value)}
                size="small"
                sx={{ py: 1 }}
              />
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", mt: 0.5 }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontVariantNumeric: "tabular-nums" }}
                >
                  ${PRICE_MIN}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontVariantNumeric: "tabular-nums" }}
                >
                  ${PRICE_MAX}+
                </Typography>
              </Stack>
            </Box>
          </Box>

          <FormControl size="small" fullWidth>
            <InputLabel id="filter-stars-label">Minimum rating</InputLabel>
            <Select
              labelId="filter-stars-label"
              label="Minimum rating"
              value={filters.minStars}
              onChange={(e) => onChange({ minStars: e.target.value, page: 1 })}
            >
              {RATING_OPTIONS.map((o) => (
                <MenuItem key={o.value || "any"} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="body2" fontWeight={500} mb={0.75}>
              Amenities
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                rowGap: 0.5,
                columnGap: 1,
              }}
            >
              {AMENITY_OPTIONS.map((a) => {
                const checked = filters.amenities.includes(a.value);
                return (
                  <FormControlLabel
                    key={a.value}
                    sx={{ m: 0 }}
                    control={
                      <Checkbox
                        checked={checked}
                        size="small"
                        onChange={() => toggleAmenity(a.value)}
                      />
                    }
                    label={<Typography variant="body2">{a.label}</Typography>}
                  />
                );
              })}
            </Box>
          </Box>

          <FormControl size="small" fullWidth>
            <InputLabel id="filter-sort-label">Sort by</InputLabel>
            <Select
              labelId="filter-sort-label"
              label="Sort by"
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value, page: 1 })}
            >
              {SORT_OPTIONS.map((o) => (
                <MenuItem key={o.value || "default"} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </CardContent>
    </Card>
  );
}
