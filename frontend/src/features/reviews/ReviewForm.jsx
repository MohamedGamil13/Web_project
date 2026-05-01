import { Formik, Form, useField } from "formik";
import {
  Alert,
  Box,
  Button,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { reviewFormSchema } from "./schemas";

function RatingField() {
  const [field, meta, helpers] = useField("rating");
  const showError = meta.touched && Boolean(meta.error);
  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Typography variant="body2" fontWeight={500}>
          Rating
        </Typography>
        <Rating
          value={field.value || 0}
          onChange={async (_e, v) => {
            // Set value with validation, THEN mark touched without re-running
            // validation. Calling setTouched with shouldValidate=true after
            // setValue races against React state and can flash "Pick at least
            // 1 star" against the OLD (zero) value even though the new value
            // is valid.
            await helpers.setValue(v ?? 0, true);
            helpers.setTouched(true, false);
          }}
          size="medium"
        />
        {field.value ? (
          <Typography variant="caption" color="text.secondary">
            {field.value} / 5
          </Typography>
        ) : null}
      </Stack>
      {showError && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 0.5, display: "block" }}
        >
          {meta.error}
        </Typography>
      )}
    </Box>
  );
}

function CommentField() {
  const [field, meta] = useField("comment");
  const showError = meta.touched && Boolean(meta.error);
  return (
    <TextField
      {...field}
      value={field.value ?? ""}
      label="Comment (optional)"
      placeholder="Share details about your stay…"
      multiline
      minRows={3}
      maxRows={8}
      fullWidth
      size="small"
      error={showError}
      helperText={
        showError ? meta.error : `${(field.value ?? "").length} / 1000`
      }
      slotProps={{ htmlInput: { maxLength: 1000 } }}
    />
  );
}

export function ReviewForm({
  initialValues,
  submitLabel = "Submit",
  onSubmit,
  onCancel,
  busy,
}) {
  const defaults = { rating: 0, comment: "", ...(initialValues ?? {}) };
  return (
    <Formik
      initialValues={defaults}
      validationSchema={reviewFormSchema}
      enableReinitialize
      onSubmit={onSubmit}
    >
      {({ isSubmitting, errors, touched, dirty, isValid }) => {
        const submitting = isSubmitting || busy;
        const showFormError = Boolean(errors.form && touched.form);
        return (
          <Form noValidate>
            <Stack spacing={2}>
              <RatingField />
              <CommentField />
              {showFormError && <Alert severity="error">{errors.form}</Alert>}
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "flex-end" }}
              >
                {onCancel && (
                  <Button
                    type="button"
                    variant="text"
                    onClick={onCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || (!dirty && initialValues) || !isValid}
                >
                  {submitting ? "Saving…" : submitLabel}
                </Button>
              </Stack>
            </Stack>
          </Form>
        );
      }}
    </Formik>
  );
}
