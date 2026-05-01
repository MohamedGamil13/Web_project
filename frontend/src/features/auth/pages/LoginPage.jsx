import { useState } from 'react';
import { Formik, Form } from 'formik';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Container,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { FTextField } from '@/lib/formik-mui';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '../schemas';
import { login as loginApi } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();
  const [serverError, setServerError] = useState(null);
  const returnTo = params.get('returnTo') ?? '/';

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
        <Stack spacing={1} mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to manage your reservations.
          </Typography>
        </Stack>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setServerError(null);
            try {
              const { user, token } = await loginApi(values);
              login(user, token);
              navigate(decodeURIComponent(returnTo), { replace: true });
            } catch (err) {
              setServerError(err?.message ?? 'Login failed');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form noValidate>
              <Stack spacing={2.5}>
                <FTextField name="email" label="Email" type="email" autoComplete="email" />
                <FTextField
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                />
                {serverError && <Alert severity="error">{serverError}</Alert>}
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
                <Typography variant="body2" textAlign="center" color="text.secondary">
                  No account?{' '}
                  <MuiLink component={Link} to="/register" underline="hover">
                    Create one
                  </MuiLink>
                </Typography>
              </Stack>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
}
