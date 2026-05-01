import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Pagination,
  Rating,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import {
  createReview,
  deleteReview,
  getMyReviewForHotel,
  listHotelReviews,
  updateReview,
} from "./api";
import { ReviewForm } from "./ReviewForm";
import { ReviewItem } from "./ReviewItem";

const PAGE_SIZE = 5;

function ReviewSummary({ hotel }) {
  const { reviewAvg = 0, reviewCount = 0 } = hotel ?? {};
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 0.5,
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {reviewCount === 0
            ? "No reviews yet"
            : `${reviewCount} review${reviewCount === 1 ? "" : "s"}`}
        </Typography>

        <Rating
          value={reviewCount > 0 ? Number(reviewAvg) : 0}
          precision={0.1}
          readOnly
          size="small"
        />

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: "baseline", pl: 1 }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {reviewCount > 0 ? Number(reviewAvg).toFixed(1) : "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            / 5
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export function ReviewsSection({ hotel, onMutate }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const hotelId = hotel?.id;

  const [page, setPage] = useState(1);
  const [list, setList] = useState({
    status: "loading",
    items: [],
    meta: null,
    error: null,
  });
  const [myReview, setMyReview] = useState({ status: "idle", data: null });
  const [creating, setCreating] = useState(false);
  const [topError, setTopError] = useState(null);

  const refreshList = useCallback(
    async (targetPage = page) => {
      if (!hotelId) return;
      setList((s) => ({ ...s, status: "loading", error: null }));
      try {
        const res = await listHotelReviews(hotelId, {
          page: targetPage,
          pageSize: PAGE_SIZE,
        });
        setList({
          status: "success",
          items: res.items,
          meta: res.meta,
          error: null,
        });
      } catch (err) {
        setList({ status: "error", items: [], meta: null, error: err });
      }
    },
    [hotelId, page],
  );

  const refreshMine = useCallback(async () => {
    if (!hotelId || !isAuthenticated) {
      setMyReview({ status: "idle", data: null });
      return;
    }
    setMyReview({ status: "loading", data: null });
    try {
      const data = await getMyReviewForHotel(hotelId);
      setMyReview({ status: "success", data });
    } catch {
      setMyReview({ status: "error", data: null });
    }
  }, [hotelId, isAuthenticated]);

  useEffect(() => {
    refreshList(page).then((r) => {});
  }, [refreshList, page]);

  useEffect(() => {
    refreshMine().then((r) => {});
  }, [refreshMine]);

  async function handleCreate(values, helpers) {
    setCreating(true);
    setTopError(null);
    try {
      await createReview(hotelId, values);
      await Promise.all([refreshList(1), refreshMine()]);
      setPage(1);
      onMutate?.();
      helpers.resetForm({ values: { rating: 0, comment: "" } });
    } catch (err) {
      if (err?.code === "CONFLICT") {
        setTopError(err.message);
        await refreshMine();
      } else if (
        err?.code === "VALIDATION_ERROR" &&
        Array.isArray(err.details)
      ) {
        for (const d of err.details) helpers.setFieldError(d.field, d.message);
      } else {
        setTopError(err?.message ?? "Could not post review");
      }
    } finally {
      setCreating(false);
      helpers.setSubmitting(false);
    }
  }

  async function handleUpdate(reviewId, payload) {
    await updateReview(reviewId, payload);
    await Promise.all([refreshList(page), refreshMine()]);
    onMutate?.();
  }

  async function handleDelete(reviewId) {
    await deleteReview(reviewId);
    await Promise.all([refreshList(1), refreshMine()]);
    setPage(1);
    onMutate?.();
  }

  if (!hotel) return null;

  const totalPages = Math.max(
    1,
    Math.ceil((list.meta?.total ?? 0) / PAGE_SIZE),
  );
  const items = list.items ?? [];
  const hasMine = Boolean(myReview.data);
  const writeReturnTo = encodeURIComponent(location.pathname + location.search);

  // Pin the current user's review to the top of page 1 so they can edit it
  // without scrolling. Wherever it appears in the server-sorted page (or in
  // later pages), filter it out so it never renders twice.
  const mineId = myReview.data?.id;
  const otherItems = mineId ? items.filter((r) => r.id !== mineId) : items;
  const displayItems =
    hasMine && page === 1 ? [myReview.data, ...otherItems] : otherItems;

  return (
    <Stack spacing={3}>
      <ReviewSummary hotel={hotel} />

      {!isAuthenticated && (
        <Alert
          severity="info"
          action={
            <Button
              component={RouterLink}
              to={`/login?returnTo=${writeReturnTo}`}
              color="inherit"
              size="small"
            >
              Sign in
            </Button>
          }
        >
          Sign in to share your experience.
        </Alert>
      )}

      {isAuthenticated && !hasMine && myReview.status !== "loading" && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Write a review
            </Typography>
            {topError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {topError}
              </Alert>
            )}
            <ReviewForm
              submitLabel="Post review"
              busy={creating}
              onSubmit={handleCreate}
            />
          </CardContent>
        </Card>
      )}

      {list.status === "loading" && (
        <Stack spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Box key={i}>
              <Stack direction="row" spacing={1.5}>
                <Skeleton variant="circular" width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="40%" />
                  <Skeleton width="20%" />
                  <Skeleton width="80%" sx={{ mt: 1 }} />
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      {list.status === "error" && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => refreshList(page)}
            >
              Retry
            </Button>
          }
        >
          {list.error?.message ?? "Could not load reviews."}
        </Alert>
      )}

      {list.status === "success" && displayItems.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {hasMine
            ? "Your review is the only one so far."
            : "Be the first to review this hotel."}
        </Typography>
      )}

      {displayItems.length > 0 && (
        <Stack divider={<Divider flexItem />}>
          {displayItems.map((r) => (
            <ReviewItem
              key={r.id}
              review={r}
              isOwn={Boolean(user?.id && r.user?.id === user.id)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, v) => setPage(v)}
            shape="rounded"
            size="small"
          />
        </Box>
      )}
    </Stack>
  );
}
