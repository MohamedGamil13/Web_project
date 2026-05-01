import { Router } from 'express';
import healthRoutes from './health.routes.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      version: 'v1',
      modules: ['health', 'auth', 'users', 'hotels', 'rooms', 'reservations', 'reviews'],
    },
  });
});

router.use('/health', healthRoutes);

// Phase 3+ modules will be mounted here:
// router.use('/auth', authRoutes);
// router.use('/users', usersRoutes);
// router.use('/hotels', hotelsRoutes);
// router.use('/rooms', roomsRoutes);
// router.use('/reservations', reservationsRoutes);
// router.use('/reviews', reviewsRoutes);

export default router;
