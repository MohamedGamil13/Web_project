import { useRef, useState } from "react";
import { Formik, Form } from "formik";
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
import * as yup from "yup";
import { Link as RouterLink } from "react-router-dom";
import { FTextField } from "@/lib/formik-mui";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { removeAvatar, updateProfile, uploadAvatar } from "../api";

// Form-only schema (avatar is handled separately via the upload widget).
const profileFormSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name is too short")
    .max(80)
    .required("Name is required"),
  email: yup
    .string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: yup.string().trim().max(40).nullable(),
});

export default function ProfilePage() {
  const { user, setUser, bootstrapping } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  if (bootstrapping || !user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card variant="outlined">
          <CardHeader title="Profile" subheader="Loading…" />
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </Typography>
        </Box>

        <AvatarCard user={user} setUser={setUser} />

        <Card variant="outlined">
          <CardHeader
            title={user.name}
            subheader={user.email}
            action={
              !isEditing && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )
            }
          />
          <Divider />
          <CardContent>
            {isEditing ? (
              <Formik
                initialValues={{
                  name: user.name ?? "",
                  email: user.email ?? "",
                  phone: user.phone ?? "",
                }}
                validationSchema={profileFormSchema}
                onSubmit={async (
                  values,
                  { setSubmitting, setFieldError, resetForm },
                ) => {
                  setServerError(null);
                  setSavedAt(null);
                  try {
                    const updated = await updateProfile(values);
                    setUser(updated);
                    resetForm({
                      values: {
                        name: updated.name ?? "",
                        email: updated.email ?? "",
                        phone: updated.phone ?? "",
                      },
                    });
                    setIsEditing(false);
                    setSavedAt(new Date());
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
                      setServerError(
                        err?.message ?? "Could not update profile",
                      );
                    }
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting, dirty, resetForm }) => (
                  <Form noValidate>
                    <Stack spacing={2.5}>
                      <FTextField name="name" label="Name" />
                      <FTextField name="email" label="Email" type="email" />
                      <FTextField name="phone" label="Phone" type="tel" />
                      {serverError && (
                        <Alert severity="error">{serverError}</Alert>
                      )}
                      <Stack direction="row" spacing={1}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting || !dirty}
                        >
                          {isSubmitting ? "Saving…" : "Save changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="text"
                          disabled={isSubmitting}
                          onClick={() => {
                            resetForm();
                            setIsEditing(false);
                            setServerError(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  </Form>
                )}
              </Formik>
            ) : (
              <Stack spacing={1.5}>
                <DetailRow label="Phone" value={user.phone || "—"} />
                <DetailRow label="Role" value={user.role} />
                {savedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Saved {savedAt.toLocaleTimeString()}.
                  </Typography>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader
            title="Password"
            subheader="Update your password on the dedicated security page."
            action={
              <Button
                component={RouterLink}
                to="/profile/password"
                variant="outlined"
                size="small"
              >
                Change password
              </Button>
            }
          />
        </Card>
      </Stack>
    </Container>
  );
}

function AvatarCard({ user, setUser }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const updated = await uploadAvatar(file);
      setUser(updated);
    } catch (err) {
      setError(err?.message ?? "Could not upload avatar");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setUploading(true);
    try {
      const updated = await removeAvatar();
      setUser(updated);
    } catch (err) {
      setError(err?.message ?? "Could not remove avatar");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2.5}
          sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
        >
          <UserAvatar user={user} size={80} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Profile photo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {user.avatarUrl
                ? "Replace or remove your current photo."
                : "Showing your initials. Upload an image to personalize."}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="small"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading
                  ? "Working…"
                  : user.avatarUrl
                    ? "Change photo"
                    : "Upload photo"}
              </Button>
              {user.avatarUrl && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled={uploading}
                  onClick={handleRemove}
                >
                  Remove
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = ""; // allow re-uploading the same file
                  handleFile(file);
                }}
              />
            </Stack>
            {error && (
              <Alert severity="error" sx={{ mt: 1.5 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 2,
        alignItems: "baseline",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
