import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

const FEATURES = [
  { title: 'Search', description: 'Filter by city, price, stars, amenities.', phase: 'Phase 4 deliverable.' },
  { title: 'Reserve', description: 'Pick a room and dates, get a confirmation.', phase: 'Phase 5 deliverable.' },
  { title: 'Review', description: "Rate hotels you've stayed at.", phase: 'Phase 7 deliverable.' },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={5}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {isAuthenticated ? `Welcome back, ${user?.name?.split(' ')[0] ?? ''}` : 'Find your next stay'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, mb: 3 }}>
            Browse hotels, check availability, and book a room. This is the academic project shell —
            pages are wired but the data layer is mocked until each backend module ships.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button component={RouterLink} to="/hotels" variant="contained">
              Browse hotels
            </Button>
            {isAuthenticated ? (
              <Button component={RouterLink} to="/reservations" variant="outlined">
                My reservations
              </Button>
            ) : (
              <Button component={RouterLink} to="/register" variant="outlined">
                Create an account
              </Button>
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          }}
        >
          {FEATURES.map((f) => (
            <Card key={f.title} variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600}>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                  {f.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {f.phase}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>
    </Container>
  );
}
