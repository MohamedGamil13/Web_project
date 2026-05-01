import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';

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
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

// Later phases:
// router.use('/hotels', hotelsRoutes);
// router.use('/rooms', roomsRoutes);
// router.use('/reservations', reservationsRoutes);
// router.use('/reviews', reviewsRoutes);

export default router;
