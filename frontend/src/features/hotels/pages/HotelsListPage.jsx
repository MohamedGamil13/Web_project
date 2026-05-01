import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  InputAdornment,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { HotelCard } from '../HotelCard';
import { HotelFilters } from '../HotelFilters';
import {
  FILTER_DEFAULTS,
  filtersToApiQuery,
  filtersToParams,
  isEmpty,
  readFilters,
} from '../filters';
import { listHotels } from '../api';

export default function HotelsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const [state, setState] = useState({ status: 'idle', items: [], meta: null, error: null });

  const searchKey = searchParams.toString();
  const debouncedSearchKey = useDebouncedValue(searchKey, 400);
  const isPending = searchKey !== debouncedSearchKey;

  function updateFilters(patch) {
    const next = { ...filters, ...patch };
    setSearchParams(filtersToParams(next), { replace: true });
  }

  function resetFilters() {
    setSearchParams({}, { replace: true });
  }

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    listHotels(filtersToApiQuery(readFilters(new URLSearchParams(debouncedSearchKey))))
      .then((res) => {
        if (cancelled) return;
        setState({ status: 'success', items: res.items, meta: res.meta, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: 'error', items: [], meta: null, error: err });
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearchKey]);

  const total = state.meta?.total ?? 0;
  const page = filters.page;
  const pageSize = filters.pageSize || FILTER_DEFAULTS.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showSkeletons = state.status === 'loading' && state.items.length === 0;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack spacing={4}>
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={600}>
            Find your stay
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Search across our hotels, then refine with the filters on the left.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ maxWidth: 600 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="City or hotel name…"
              value={filters.q}
              onChange={(e) => updateFilters({ q: e.target.value, page: 1 })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            {!isEmpty(filters) && (
              <Button variant="text" onClick={resetFilters}>
                Clear
              </Button>
            )}
          </Stack>
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', lg: '260px 1fr' },
          }}
        >
          <Box component="aside">
            <HotelFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />
          </Box>

          <Box component="section">
            <Stack spacing={2}>
              <Box sx={{ minHeight: 22 }}>
                <Typography variant="body2" color="text.secondary">
                  {state.status === 'error'
                    ? 'Could not load hotels'
                    : isPending
                      ? 'Updating…'
                      : showSkeletons
                        ? 'Searching…'
                        : `${total} hotel${total === 1 ? '' : 's'}`}
                </Typography>
              </Box>

              {showSkeletons && (
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      xl: 'repeat(3, 1fr)',
                    },
                  }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Paper key={i} variant="outlined" sx={{ overflow: 'hidden' }}>
                      <Skeleton variant="rectangular" sx={{ aspectRatio: '16 / 9' }} />
                      <Box p={2}>
                        <Skeleton width="75%" />
                        <Skeleton width="50%" />
                        <Skeleton width="60%" sx={{ mt: 1 }} />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}

              {state.status === 'error' && (
                <Alert
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={() => updateFilters({})}>
                      Try again
                    </Button>
                  }
                >
                  {state.error?.message ?? 'Could not reach the API.'}
                </Alert>
              )}

              {state.status === 'success' && state.items.length === 0 && (
                <Alert
                  severity="info"
                  action={
                    <Button color="inherit" size="small" onClick={resetFilters}>
                      Reset
                    </Button>
                  }
                >
                  No hotels matched your filters. Try widening the price range or removing some
                  amenities.
                </Alert>
              )}

              {state.items.length > 0 && (
                <>
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 2,
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        xl: 'repeat(3, 1fr)',
                      },
                      transition: 'opacity 200ms',
                      opacity: isPending || state.status === 'loading' ? 0.6 : 1,
                    }}
                  >
                    {state.items.map((h) => (
                      <HotelCard key={h.id} hotel={h} />
                    ))}
                  </Box>
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_e, value) => updateFilters({ page: value })}
                        shape="rounded"
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
