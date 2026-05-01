import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
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
  Rating,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { ReserveDialog } from '@/features/reservations/ReserveDialog';
import { getHotel } from '../api';

const ROOM_LABEL = {
  single: 'Single room',
  double: 'Double room',
  suite: 'Suite',
  family: 'Family room',
};

export default function HotelDetailsPage() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading', hotel: null, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', hotel: null, error: null });
    getHotel(id)
      .then((hotel) => {
        if (!cancelled) setState({ status: 'success', hotel, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', hotel: null, error: err });
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

      {state.status === 'loading' && (
        <Stack spacing={2}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        </Stack>
      )}

      {state.status === 'error' && (
        <Alert
          severity={state.error?.code === 'NOT_FOUND' ? 'warning' : 'error'}
          action={
            <Button component={RouterLink} to="/hotels" color="inherit" size="small">
              Browse other hotels
            </Button>
          }
        >
          {state.error?.code === 'NOT_FOUND'
            ? 'Hotel not found'
            : state.error?.message ?? 'Could not load this hotel'}
        </Alert>
      )}

      {state.status === 'success' && state.hotel && <HotelView hotel={state.hotel} />}
    </Container>
  );
}

function HotelView({ hotel }) {
  const [pickedRoom, setPickedRoom] = useState(null);

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {hotel.name}
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 0.5, sm: 2 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          color="text.secondary"
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocationOnIcon fontSize="small" />
            <Typography variant="body2">
              {hotel.address ? `${hotel.address}, ` : ''}
              {hotel.city}
              {hotel.country ? `, ${hotel.country}` : ''}
            </Typography>
          </Stack>
          <Rating value={hotel.starRating ?? 0} readOnly size="small" />
          <Typography variant="body2">
            {hotel.reviewCount > 0
              ? `${(hotel.reviewAvg ?? 0).toFixed?.(1) ?? hotel.reviewAvg} · ${hotel.reviewCount} reviews`
              : 'No reviews yet'}
          </Typography>
        </Stack>
      </Box>

      {hotel.images?.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' },
            gridTemplateRows: { sm: 'repeat(2, 1fr)' },
          }}
        >
          <Box
            component="img"
            src={hotel.images[0]}
            alt=""
            sx={{
              gridRow: { sm: 'span 2' },
              width: '100%',
              aspectRatio: '16 / 9',
              objectFit: 'cover',
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
                width: '100%',
                aspectRatio: '16 / 9',
                objectFit: 'cover',
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
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {hotel.description}
          </Typography>
        </Box>
      )}

      {hotel.amenities?.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Amenities
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {hotel.amenities.map((a) => (
              <Chip key={a} label={a} size="small" sx={{ textTransform: 'capitalize' }} />
            ))}
          </Stack>
        </Box>
      )}

      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Rooms
        </Typography>
        {hotel.rooms?.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No rooms have been added yet.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
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
                    Up to {room.capacity} guest{room.capacity > 1 ? 's' : ''} · {room.quantity}{' '}
                    available
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Typography variant="body2">
                    <Box component="span" fontWeight={600}>
                      ${room.pricePerNight}
                    </Box>
                    <Box component="span" color="text.secondary">
                      {' '}/ night
                    </Box>
                  </Typography>
                  <Button size="small" variant="contained" onClick={() => setPickedRoom(room)}>
                    Reserve
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Reviews
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reviews land in Phase 7.
        </Typography>
      </Box>

      <ReserveDialog
        open={Boolean(pickedRoom)}
        onOpenChange={(open) => !open && setPickedRoom(null)}
        hotel={hotel}
        room={pickedRoom}
      />
    </Stack>
  );
}
