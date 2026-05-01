import { useState } from "react";
import dayjs from "dayjs";
import { Box, Button, Rating, Stack, Typography } from "@mui/material";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ReviewForm } from "./ReviewForm";

export function ReviewItem({ review, isOwn, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave(values, helpers) {
    setSaving(true);
    setError(null);
    try {
      await onUpdate(review.id, values);
      setEditing(false);
    } catch (err) {
      if (err?.code === "VALIDATION_ERROR" && Array.isArray(err.details)) {
        for (const d of err.details) helpers.setFieldError(d.field, d.message);
      } else {
        setError(err?.message ?? "Could not update");
      }
    } finally {
      setSaving(false);
      helpers.setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(review.id);
      setConfirmDelete(false);
    } catch (err) {
      setError(err?.message ?? "Could not delete");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
        <UserAvatar user={review.user} size={36} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", flexWrap: "wrap" }}
          >
            <Typography variant="body2" fontWeight={600} noWrap>
              {review.user?.name ?? "Guest"}
            </Typography>
            {isOwn && (
              <Typography variant="caption" color="primary" fontWeight={600}>
                You
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              · {dayjs(review.createdAt).format("MMM D, YYYY")}
              {review.updatedAt !== review.createdAt ? " (edited)" : ""}
            </Typography>
          </Stack>
          <Rating
            value={review.rating}
            readOnly
            size="small"
            sx={{ mt: 0.25 }}
          />

          {editing ? (
            <Box sx={{ mt: 1.5 }}>
              <ReviewForm
                initialValues={{
                  rating: review.rating,
                  comment: review.comment,
                }}
                submitLabel="Save changes"
                busy={saving}
                onSubmit={handleSave}
                onCancel={() => {
                  setEditing(false);
                  setError(null);
                }}
              />
            </Box>
          ) : (
            review.comment && (
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}
              >
                {review.comment}
              </Typography>
            )
          )}

          {error && (
            <Typography
              variant="caption"
              color="error"
              sx={{ display: "block", mt: 0.5 }}
            >
              {error}
            </Typography>
          )}

          {isOwn && !editing && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="text"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
              <Button
                size="small"
                variant="text"
                color="error"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            </Stack>
          )}
        </Box>
      </Stack>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(false)}
        title="Delete this review?"
        description="This cannot be undone. The hotel's average rating will update."
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
