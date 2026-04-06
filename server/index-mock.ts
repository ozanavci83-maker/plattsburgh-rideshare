import * as express from 'express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import * as bcryptjs from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { mockDb } from './db/mock';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============
app.post('/api/auth/signup', async (req: any, res: any) => {
  try {
    const { firstName, lastName, email, phone, password, userType } = req.body;

    if (mockDb.getUserByEmail(email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const userId = uuidv4();

    const user = mockDb.createUser({
      id: userId,
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      userType,
      createdAt: new Date(),
    });

    if (userType === 'rider') {
      mockDb.createRider({
        id: userId,
        userId,
        totalRides: 0,
        rating: 5,
        phoneVerified: true,
        profileCompleted: true,
        createdAt: new Date(),
      });
    } else if (userType === 'driver') {
      mockDb.createDriver({
        id: userId,
        userId,
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: new Date().getFullYear(),
        vehicleColor: '',
        licensePlate: '',
        driverLicenseNumber: '',
        status: 'pending',
        isOnline: false,
        totalRides: 0,
        totalEarnings: 0,
        rating: 5,
        createdAt: new Date(),
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email, userType }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user = mockDb.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, userType: user.userType }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ user, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ RIDER ROUTES ============
app.get('/api/riders/:id', authMiddleware, (req: any, res: any) => {
  const rider = mockDb.getRiderById(req.params.id);
  if (!rider) {
    return res.status(404).json({ error: 'Rider not found' });
  }
  res.json(rider);
});

app.get('/api/riders/:id/rides', authMiddleware, (req: any, res: any) => {
  const rides = mockDb.getRidesByRiderId(req.params.id);
  res.json(rides);
});

app.put('/api/riders/:id', authMiddleware, (req: any, res: any) => {
  const updated = mockDb.updateRider(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Rider not found' });
  }
  res.json(updated);
});

// ============ DRIVER ROUTES ============
app.get('/api/drivers/:id', authMiddleware, (req: any, res: any) => {
  const driver = mockDb.getDriverById(req.params.id);
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  res.json(driver);
});

app.get('/api/drivers/:id/rides', authMiddleware, (req: any, res: any) => {
  const rides = mockDb.getRidesByDriverId(req.params.id);
  res.json(rides);
});

app.put('/api/drivers/:id', authMiddleware, (req: any, res: any) => {
  const updated = mockDb.updateDriver(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  res.json(updated);
});

app.post('/api/drivers/:id/toggle-online', authMiddleware, (req: any, res: any) => {
  const driver = mockDb.getDriverById(req.params.id);
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  const updated = mockDb.updateDriver(req.params.id, { isOnline: !driver.isOnline });
  res.json(updated);
});

// ============ RIDE ROUTES ============
app.post('/api/rides', authMiddleware, (req: any, res: any) => {
  const ride = mockDb.createRide({
    id: uuidv4(),
    riderId: req.body.riderId,
    pickupLatitude: req.body.pickupLatitude,
    pickupLongitude: req.body.pickupLongitude,
    pickupAddress: req.body.pickupAddress,
    dropoffLatitude: req.body.dropoffLatitude,
    dropoffLongitude: req.body.dropoffLongitude,
    dropoffAddress: req.body.dropoffAddress,
    requestedPrice: req.body.requestedPrice,
    status: 'requested',
    paymentMethod: req.body.paymentMethod,
    createdAt: new Date(),
  });
  res.json(ride);
});

app.get('/api/rides/:id', authMiddleware, (req: any, res: any) => {
  const ride = mockDb.getRideById(req.params.id);
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }
  res.json(ride);
});

app.put('/api/rides/:id/accept', authMiddleware, (req: any, res: any) => {
  const ride = mockDb.updateRide(req.params.id, { driverId: req.body.driverId, status: 'accepted' });
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }
  res.json(ride);
});

app.put('/api/rides/:id/start', authMiddleware, (req: any, res: any) => {
  const ride = mockDb.updateRide(req.params.id, { status: 'in_progress' });
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }
  res.json(ride);
});

app.put('/api/rides/:id/complete', authMiddleware, (req: any, res: any) => {
  const ride = mockDb.updateRide(req.params.id, {
    status: 'completed',
    finalPrice: req.body.finalPrice,
  });
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }
  res.json(ride);
});

app.put('/api/rides/:id/cancel', authMiddleware, (req: any, res: any) => {
  const ride = mockDb.updateRide(req.params.id, { status: 'cancelled' });
  if (!ride) {
    return res.status(404).json({ error: 'Ride not found' });
  }
  res.json(ride);
});

app.get('/api/rides/active/list', authMiddleware, (req: any, res: any) => {
  const rides = mockDb.getActiveRides();
  res.json(rides);
});

// ============ RATING ROUTES ============
app.post('/api/ratings', authMiddleware, (req: any, res: any) => {
  const rating = mockDb.createRating({
    id: uuidv4(),
    rideId: req.body.rideId,
    raterId: req.body.raterId,
    rateeId: req.body.rateeId,
    rating: req.body.rating,
    comment: req.body.comment,
    createdAt: new Date(),
  });
  res.json(rating);
});

app.get('/api/ratings/:userId', authMiddleware, (req: any, res: any) => {
  const ratings = mockDb.getRatingsByUserId(req.params.userId);
  res.json(ratings);
});

// ============ ADMIN ROUTES ============
app.get('/api/admin/analytics', authMiddleware, (req: any, res: any) => {
  const analytics = mockDb.getAnalytics();
  res.json(analytics);
});

app.get('/api/admin/drivers/pending', authMiddleware, (req: any, res: any) => {
  const drivers = mockDb.getPendingDrivers();
  const driversWithUsers = drivers.map((d) => ({
    ...d,
    user: mockDb.getUserById(d.userId),
  }));
  res.json(driversWithUsers);
});

app.put('/api/admin/drivers/:id/approve', authMiddleware, (req: any, res: any) => {
  const driver = mockDb.updateDriver(req.params.id, { status: 'approved' });
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  res.json(driver);
});

app.put('/api/admin/drivers/:id/reject', authMiddleware, (req: any, res: any) => {
  const driver = mockDb.updateDriver(req.params.id, { status: 'rejected' });
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  res.json(driver);
});

app.get('/api/admin/rides', authMiddleware, (req: any, res: any) => {
  const rides = mockDb.getAllRides();
  res.json(rides);
});

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'OK', message: 'Plattsburgh RideShare API is running (Mock Database)' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Plattsburgh RideShare API running on port ${PORT}`);
  console.log(`📊 Using Mock Database (in-memory storage)`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
