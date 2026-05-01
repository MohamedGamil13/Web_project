import { useEffect, useMemo, useState } from "react";
import { Formik, Form } from "formik";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { FTextField } from "@/lib/formik-mui";
import { changePassword, verifyPassword } from "../api";
import { changePasswordSchema } from "../schemas";

const REAUTH_CACHE_KEY = "hb.reauth";
const REAUTH_TTL_MS = 10 * 60 * 1000;

function readCachedReauth() {
  try {
    const raw = localStorage.getItem(REAUTH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.expiresAt) return null;
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(REAUTH_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedReauth(token) {
  const value = { token, expiresAt: Date.now() + REAUTH_TTL_MS };
  localStorage.setItem(REAUTH_CACHE_KEY, JSON.stringify(value));
  return value;
}

export default function ChangePasswordPage() {
  const [reauth, setReauth] = useState(() => readCachedReauth());
  const [verifyError, setVerifyError] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState(null);

  useEffect(() => {
    const existing = readCachedReauth();
    if (!existing) setReauth(null);
  }, []);

  const hasReauth = Boolean(reauth?.token && reauth?.expiresAt > Date.now());
  const expiresLabel = useMemo(() => {
    if (!reauth?.expiresAt) return null;
    const mins = Math.max(
      1,
      Math.ceil((reauth.expiresAt - Date.now()) / 60000),
    );
    return `${mins} min`;
  }, [reauth]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Button
            component={RouterLink}
            to="/profile"
            variant="text"
            size="small"
            sx={{ px: 1 }}
          >
            Back to profile
          </Button>
          <Typography variant="h5" fontWeight={600} sx={{ mt: 1 }}>
            Change password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            For security, verify your current password first. The verification
            stays active for 10 minutes.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardHeader title="1) Confirm current password" />
          <Divider />
          <CardContent>
            {hasReauth ? (
              <Alert severity="success">
                Verified. You can change your password for the next{" "}
                {expiresLabel}.
              </Alert>
            ) : (
              <Formik
                initialValues={{ currentPassword: "" }}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                  setVerifyError(null);
                  setVerifyStatus(null);
                  try {
                    const result = await verifyPassword(values.currentPassword);
                    setReauth(writeCachedReauth(result.reauthToken));
                    setVerifyStatus("verified");
                    resetForm();
                  } catch (err) {
                    setVerifyError(err?.message ?? "Verification failed");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting }) => (
                  <Form noValidate>
                    <Stack spacing={2}>
                      <FTextField
                        name="currentPassword"
                        label="Current password"
                        type="password"
                        autoComplete="current-password"
                      />
                      {verifyError && (
                        <Alert severity="error">{verifyError}</Alert>
                      )}
                      {verifyStatus === "verified" && (
                        <Alert severity="success">Password confirmed.</Alert>
                      )}
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Verifying…" : "Verify"}
                      </Button>
                    </Stack>
                  </Form>
                )}
              </Formik>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader title="2) Set new password" />
          <Divider />
          <CardContent>
            <Formik
              initialValues={{ newPassword: "", confirmNewPassword: "" }}
              validationSchema={changePasswordSchema}
              onSubmit={async (
                values,
                { setSubmitting, setStatus, resetForm },
              ) => {
                setStatus(null);
                try {
                  if (!hasReauth) {
                    throw { message: "Please verify current password first." };
                  }
                  await changePassword({
                    reauthToken: reauth.token,
                    body: { newPassword: values.newPassword },
                  });
                  localStorage.removeItem(REAUTH_CACHE_KEY);
                  setReauth(null);
                  resetForm();
                  setStatus({
                    ok: true,
                    message: "Password updated successfully.",
                  });
                } catch (err) {
                  if (err?.code === "UNAUTHORIZED") {
                    localStorage.removeItem(REAUTH_CACHE_KEY);
                    setReauth(null);
                    setStatus({
                      ok: false,
                      message:
                        "Verification expired. Please confirm current password again.",
                    });
                  } else {
                    setStatus({
                      ok: false,
                      message: err?.message ?? "Could not change password",
                    });
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, dirty, isValid, status }) => (
                <Form noValidate>
                  <Stack spacing={2.5}>
                    <FTextField
                      name="newPassword"
                      label="New password"
                      type="password"
                      autoComplete="new-password"
                    />
                    <FTextField
                      name="confirmNewPassword"
                      label="Confirm new password"
                      type="password"
                      autoComplete="new-password"
                    />
                    {status?.message && (
                      <Alert severity={status.ok ? "success" : "error"}>
                        {status.message}
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={
                        isSubmitting || !dirty || !isValid || !hasReauth
                      }
                    >
                      {isSubmitting ? "Updating…" : "Update password"}
                    </Button>
                  </Stack>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
