import { Router, Request, Response } from 'express';
import { db, schema } from '../db';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// Sign up
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, phone, password, firstName, lastName, userType } = req.body;

    if (!email || !phone || !password || !firstName || !lastName || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(schema.users)
      .values({
        email,
        phone,
        passwordHash,
        firstName,
        lastName,
        userType: userType as 'rider' | 'driver' | 'admin',
      })
      .returning();

    if (userType === 'rider') {
      await db.insert(schema.riders).values({
        userId: newUser[0].id,
      });
    } else if (userType === 'driver') {
      await db.insert(schema.drivers).values({
        userId: newUser[0].id,
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: new Date().getFullYear(),
        vehicleColor: '',
        licensePlate: '',
        driverLicenseNumber: '',
      });
    }

    const token = generateToken({
      userId: newUser[0].id,
      email: newUser[0].email,
      userType: newUser[0].userType as 'rider' | 'driver' | 'admin',
    });

    res.json({
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        firstName: newUser[0].firstName,
        lastName: newUser[0].lastName,
        userType: newUser[0].userType,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await verifyPassword(password, user[0].passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user[0].id,
      email: user[0].email,
      userType: user[0].userType as 'rider' | 'driver' | 'admin',
    });

    res.json({
      user: {
        id: user[0].id,
        email: user[0].email,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        userType: user[0].userType,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
