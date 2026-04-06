import { Router, Request, Response } from 'express';
import { db, schema } from '../db';
import { authMiddleware, requireUserType } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// Get driver profile
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await db
      .select()
      .from(schema.drivers)
      .where(eq(schema.drivers.id, id))
      .limit(1);

    if (driver.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, driver[0].userId))
      .limit(1);

    res.json({
      ...driver[0],
      user: user[0],
    });
  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({ error: 'Failed to get driver' });
  }
});

// Update driver profile
router.put('/:id', authMiddleware, requireUserType('driver'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      licensePlate,
      driverLicenseNumber,
      currentLatitude,
      currentLongitude,
    } = req.body;

    const updated = await db
      .update(schema.drivers)
      .set({
        vehicleMake: vehicleMake ?? undefined,
        vehicleModel: vehicleModel ?? undefined,
        vehicleYear: vehicleYear ?? undefined,
        vehicleColor: vehicleColor ?? undefined,
        licensePlate: licensePlate ?? undefined,
        driverLicenseNumber: driverLicenseNumber ?? undefined,
        currentLatitude: currentLatitude ?? undefined,
        currentLongitude: currentLongitude ?? undefined,
      })
      .where(eq(schema.drivers.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

// Toggle driver online status
router.post('/:id/toggle-online', authMiddleware, requireUserType('driver'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await db
      .select()
      .from(schema.drivers)
      .where(eq(schema.drivers.id, id))
      .limit(1);

    if (driver.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const updated = await db
      .update(schema.drivers)
      .set({ isOnline: !driver[0].isOnline })
      .where(eq(schema.drivers.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Toggle online error:', error);
    res.status(500).json({ error: 'Failed to toggle online status' });
  }
});

// Get driver rides
router.get('/:id/rides', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const rides = await db
      .select()
      .from(schema.rides)
      .where(eq(schema.rides.driverId, id));

    res.json(rides);
  } catch (error) {
    console.error('Get driver rides error:', error);
    res.status(500).json({ error: 'Failed to get rides' });
  }
});

// Get driver earnings
router.get('/:id/earnings', authMiddleware, requireUserType('driver'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await db
      .select()
      .from(schema.drivers)
      .where(eq(schema.drivers.id, id))
      .limit(1);

    if (driver.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({
      totalEarnings: driver[0].totalEarnings,
      totalRides: driver[0].totalRides,
      averageEarningsPerRide: driver[0].totalRides > 0 ? driver[0].totalEarnings / driver[0].totalRides : 0,
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Failed to get earnings' });
  }
});

export default router;
