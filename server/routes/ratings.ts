import { Router, Request, Response } from 'express';
import { db, schema } from '../db';
import { authMiddleware } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// Submit rating
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { rideId, raterId, rateeId, rating, comment } = req.body;

    if (!rideId || !raterId || !rateeId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const newRating = await db
      .insert(schema.ratings)
      .values({
        rideId,
        raterId,
        rateeId,
        rating,
        comment: comment ?? undefined,
      })
      .returning();

    res.json(newRating[0]);
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get user ratings
router.get('/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const ratings = await db
      .select()
      .from(schema.ratings)
      .where(eq(schema.ratings.rateeId, userId));

    const averageRating =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 5.0;

    res.json({
      ratings,
      averageRating,
      totalRatings: ratings.length,
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ error: 'Failed to get ratings' });
  }
});

export default router;
