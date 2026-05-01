import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthProvider } from '@/features/auth/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#171717', contrastText: '#ffffff' },
    background: { default: '#ffffff' },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
  },
});

export function Providers({ children }) {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <AuthProvider>{children}</AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
