import { useState } from "react";
import { Formik, Form } from "formik";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Container,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { FTextField } from "@/lib/formik-mui";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema } from "../schemas";
import { register as registerApi } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState(null);

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
        <Stack spacing={1} mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            It only takes a minute.
          </Typography>
        </Stack>

        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
          }}
          validationSchema={registerSchema}
          onSubmit={async (values, { setSubmitting, setFieldError }) => {
            setServerError(null);
            const { confirmPassword: _ignored, ...payload } = values;
            if (!payload.phone) delete payload.phone;
            try {
              const { user, token } = await registerApi(payload);
              login(user, token);
              navigate("/", { replace: true });
            } catch (err) {
              if (err?.code === "CONFLICT") {
                setFieldError("email", err.message);
              } else if (
                err?.code === "VALIDATION_ERROR" &&
                Array.isArray(err.details)
              ) {
                for (const d of err.details) {
                  if (d.field) setFieldError(d.field, d.message);
                }
              } else {
                setServerError(err?.message ?? "Could not create account");
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form noValidate>
              <Stack spacing={2.5}>
                <FTextField name="name" label="Name" autoComplete="name" />
                <FTextField
                  name="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                />
                <FTextField
                  name="phone"
                  label="Phone (optional)"
                  type="tel"
                  autoComplete="tel"
                />
                <FTextField
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                />
                <FTextField
                  name="confirmPassword"
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                />
                {serverError && <Alert severity="error">{serverError}</Alert>}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account…" : "Create account"}
                </Button>
                <Typography
                  variant="body2"
                  textAlign="center"
                  color="text.secondary"
                >
                  Already have one?{" "}
                  <MuiLink component={Link} to="/login" underline="hover">
                    Sign in
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
