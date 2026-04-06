import { Router, Request, Response } from 'express';
import { db, schema } from '../db';
import { authMiddleware, requireUserType } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// Get pending drivers
router.get('/drivers/pending', authMiddleware, requireUserType('admin'), async (req: Request, res: Response) => {
  try {
    const pendingDrivers = await db
      .select()
      .from(schema.drivers)
      .where(eq(schema.drivers.status, 'pending'));

    res.json(pendingDrivers);
  } catch (error) {
    console.error('Get pending drivers error:', error);
    res.status(500).json({ error: 'Failed to get pending drivers' });
  }
});

// Approve driver
router.put('/drivers/:id/approve', authMiddleware, requireUserType('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await db
      .update(schema.drivers)
      .set({ status: 'approved' })
      .where(eq(schema.drivers.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Approve driver error:', error);
    res.status(500).json({ error: 'Failed to approve driver' });
  }
});

// Reject driver
router.put('/drivers/:id/reject', authMiddleware, requireUserType('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updated = await db
      .update(schema.drivers)
      .set({ status: 'rejected' })
      .where(eq(schema.drivers.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Reject driver error:', error);
    res.status(500).json({ error: 'Failed to reject driver' });
  }
});

// Get all rides
router.get('/rides', authMiddleware, requireUserType('admin'), async (req: Request, res: Response) => {
  try {
    const rides = await db.select().from(schema.rides);

    res.json(rides);
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ error: 'Failed to get rides' });
  }
});

// Get platform analytics
router.get('/analytics', authMiddleware, requireUserType('admin'), async (req: Request, res: Response) => {
  try {
    const totalUsers = await db.select().from(schema.users);
    const totalRiders = await db.select().from(schema.riders);
    const totalDrivers = await db.select().from(schema.drivers);
    const totalRides = await db.select().from(schema.rides);

    const completedRides = totalRides.filter((r) => r.status === 'completed');
    const totalRevenue = completedRides.reduce((sum, r) => sum + (r.finalPrice || 0), 0);

    res.json({
      totalUsers: totalUsers.length,
      totalRiders: totalRiders.length,
      totalDrivers: totalDrivers.length,
      approvedDrivers: totalDrivers.filter((d) => d.status === 'approved').length,
      totalRides: totalRides.length,
      completedRides: completedRides.length,
      totalRevenue,
      averageRidePrice: completedRides.length > 0 ? totalRevenue / completedRides.length : 0,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default router;
