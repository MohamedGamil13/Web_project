import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import hotelsRoutes from './hotels.routes.js';
import reservationsRoutes from './reservations.routes.js';

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
router.use('/hotels', hotelsRoutes);
router.use('/reservations', reservationsRoutes);

// Later phase:
// router.use('/reviews', reviewsRoutes);

export default router;
