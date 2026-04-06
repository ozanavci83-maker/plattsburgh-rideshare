import { Router, Request, Response } from 'express';
import { db, schema } from '../db';
import { authMiddleware, requireUserType } from '../middleware/auth';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Request a new ride
router.post('/', authMiddleware, requireUserType('rider'), async (req: Request, res: Response) => {
  try {
    const {
      riderId,
      pickupLatitude,
      pickupLongitude,
      pickupAddress,
      dropoffLatitude,
      dropoffLongitude,
      dropoffAddress,
      requestedPrice,
      paymentMethod,
    } = req.body;

    if (
      !riderId ||
      !pickupLatitude ||
      !pickupLongitude ||
      !pickupAddress ||
      !dropoffLatitude ||
      !dropoffLongitude ||
      !dropoffAddress ||
      !requestedPrice ||
      !paymentMethod
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newRide = await db
      .insert(schema.rides)
      .values({
        riderId,
        pickupLatitude,
        pickupLongitude,
        pickupAddress,
        dropoffLatitude,
        dropoffLongitude,
        dropoffAddress,
        requestedPrice,
        paymentMethod: paymentMethod as 'cash' | 'zelle' | 'paypal' | 'venmo',
      })
      .returning();

    res.json(newRide[0]);
  } catch (error) {
    console.error('Request ride error:', error);
    res.status(500).json({ error: 'Failed to request ride' });
  }
});

// Get ride details
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ride = await db
      .select()
      .from(schema.rides)
      .where(eq(schema.rides.id, id))
      .limit(1);

    if (ride.length === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    res.json(ride[0]);
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ error: 'Failed to get ride' });
  }
});

// Accept ride (driver)
router.put('/:id/accept', authMiddleware, requireUserType('driver'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const updated = await db
      .update(schema.rides)
      .set({
        driverId,
        status: 'accepted',
      })
      .where(eq(schema.rides.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({ error: 'Failed to accept ride' });
  }
});

// Reject ride (driver)
router.put('/:id/reject', authMiddleware, requireUserType('driver'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await db
      .update(schema.rides)
      .set({
        driverId: null,
        status: 'requested',
      })
      .where(eq(schema.rides.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Reject ride error:', error);
    res.status(500).json({ error: 'Failed to reject ride' });
  }
});

// Start ride (driver)
router.put('/:id/start', authMiddleware, requireUserType('driver'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await db
      .update(schema.rides)
      .set({
        status: 'in_progress',
        startedAt: new Date(),
      })
      .where(eq(schema.rides.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Start ride error:', error);
    res.status(500).json({ error: 'Failed to start ride' });
  }
});

// Complete ride (driver)
router.put('/:id/complete', authMiddleware, requireUserType('driver'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { finalPrice } = req.body;

    const updated = await db
      .update(schema.rides)
      .set({
        status: 'completed',
        finalPrice: finalPrice ?? undefined,
        completedAt: new Date(),
      })
      .where(eq(schema.rides.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Complete ride error:', error);
    res.status(500).json({ error: 'Failed to complete ride' });
  }
});

// Cancel ride
router.put('/:id/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await db
      .update(schema.rides)
      .set({
        status: 'cancelled',
      })
      .where(eq(schema.rides.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ error: 'Failed to cancel ride' });
  }
});

// Get active rides (for drivers)
router.get('/active/list', authMiddleware, async (req: Request, res: Response) => {
  try {
    const rides = await db
      .select()
      .from(schema.rides)
      .where(eq(schema.rides.status, 'requested'));

    res.json(rides);
  } catch (error) {
    console.error('Get active rides error:', error);
    res.status(500).json({ error: 'Failed to get active rides' });
  }
});

export default router;
