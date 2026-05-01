import { Box, Container, Typography } from '@mui/material';

export function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 48 }}>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Hotel Booking — Academic Project
          </Typography>
          <Typography variant="caption" color="text.secondary">
            v0.1
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
