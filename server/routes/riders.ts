import { Router, Request, Response } from 'express';
import { db, schema } from '../db';
import { authMiddleware, requireUserType } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// Get rider profile
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rider = await db
      .select()
      .from(schema.riders)
      .where(eq(schema.riders.id, id))
      .limit(1);

    if (rider.length === 0) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, rider[0].userId))
      .limit(1);

    res.json({
      ...rider[0],
      user: user[0],
    });
  } catch (error) {
    console.error('Get rider error:', error);
    res.status(500).json({ error: 'Failed to get rider' });
  }
});

// Update rider profile
router.put('/:id', authMiddleware, requireUserType('rider'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { phoneVerified, profileCompleted, paymentMethods } = req.body;

    const updated = await db
      .update(schema.riders)
      .set({
        phoneVerified: phoneVerified ?? undefined,
        profileCompleted: profileCompleted ?? undefined,
        paymentMethods: paymentMethods ?? undefined,
      })
      .where(eq(schema.riders.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Update rider error:', error);
    res.status(500).json({ error: 'Failed to update rider' });
  }
});

// Get rider rides
router.get('/:id/rides', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rides = await db
      .select()
      .from(schema.rides)
      .where(eq(schema.rides.riderId, id));

    res.json(rides);
  } catch (error) {
    console.error('Get rider rides error:', error);
    res.status(500).json({ error: 'Failed to get rides' });
  }
});

export default router;
