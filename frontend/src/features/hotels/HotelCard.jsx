import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Stack,
  Typography,
} from '@mui/material';

export function HotelCard({ hotel }) {
  return (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardMedia
        component={hotel.thumbnail ? 'img' : 'div'}
        image={hotel.thumbnail || undefined}
        alt={hotel.name}
        sx={{ aspectRatio: '16 / 9', bgcolor: 'action.hover' }}
        loading="lazy"
      />
      <CardContent sx={{ flex: 1 }}>
        <Stack spacing={1.25}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {hotel.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hotel.city}
              {hotel.country ? `, ${hotel.country}` : ''}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Rating value={hotel.starRating ?? 0} readOnly size="small" />
            <Typography variant="caption" color="text.secondary">
              {hotel.reviewCount > 0
                ? `${(hotel.reviewAvg ?? 0).toFixed?.(1) ?? hotel.reviewAvg} · ${hotel.reviewCount} reviews`
                : 'No reviews yet'}
            </Typography>
          </Stack>
          {hotel.amenities?.length > 0 && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {hotel.amenities.slice(0, 4).map((a) => (
                <Chip key={a} label={a} size="small" sx={{ textTransform: 'capitalize' }} />
              ))}
              {hotel.amenities.length > 4 && (
                <Chip label={`+${hotel.amenities.length - 4}`} size="small" variant="outlined" />
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Typography variant="body2">
          <Box component="span" color="text.secondary">
            from{' '}
          </Box>
          <Box component="span" fontWeight={600}>
            ${hotel.priceFrom}
          </Box>
          <Box component="span" color="text.secondary">
            {' '}/ night
          </Box>
        </Typography>
        <Button
          component={RouterLink}
          to={`/hotels/${hotel.id}`}
          size="small"
          variant="outlined"
        >
          View
        </Button>
      </CardActions>
    </Card>
  );
}
