// Mock Database - In-memory storage for development/testing
// Data persists during the session but resets on server restart

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  userType: 'rider' | 'driver' | 'admin';
  createdAt: Date;
}

export interface Rider {
  id: string;
  userId: string;
  totalRides: number;
  rating: number;
  phoneVerified: boolean;
  profileCompleted: boolean;
  createdAt: Date;
}

export interface Driver {
  id: string;
  userId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  licensePlate: string;
  driverLicenseNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  isOnline: boolean;
  totalRides: number;
  totalEarnings: number;
  rating: number;
  createdAt: Date;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  dropoffAddress: string;
  requestedPrice: number;
  finalPrice?: number;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: Date;
}

export interface Rating {
  id: string;
  rideId: string;
  raterId: string;
  rateeId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

class MockDatabase {
  private users: Map<string, User> = new Map();
  private riders: Map<string, Rider> = new Map();
  private drivers: Map<string, Driver> = new Map();
  private rides: Map<string, Ride> = new Map();
  private ratings: Map<string, Rating> = new Map();

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData() {
    // Create test admin
    const adminId = 'admin-1';
    this.users.set(adminId, {
      id: adminId,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@plattsburgh-rideshare.com',
      phone: '5185551234',
      password: '$2b$10$YourHashedPasswordHere', // Password: Admin123!
      userType: 'admin',
      createdAt: new Date(),
    });

    // Create test rider
    const riderId = 'rider-1';
    this.users.set(riderId, {
      id: riderId,
      firstName: 'John',
      lastName: 'Rider',
      email: 'rider@test.com',
      phone: '5185555555',
      password: '$2b$10$YourHashedPasswordHere', // Password: Rider123!
      userType: 'rider',
      createdAt: new Date(),
    });

    this.riders.set(riderId, {
      id: riderId,
      userId: riderId,
      totalRides: 5,
      rating: 4.8,
      phoneVerified: true,
      profileCompleted: true,
      createdAt: new Date(),
    });

    // Create test driver
    const driverId = 'driver-1';
    this.users.set(driverId, {
      id: driverId,
      firstName: 'Jane',
      lastName: 'Driver',
      email: 'driver@test.com',
      phone: '5185556666',
      password: '$2b$10$YourHashedPasswordHere', // Password: Driver123!
      userType: 'driver',
      createdAt: new Date(),
    });

    this.drivers.set(driverId, {
      id: driverId,
      userId: driverId,
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      vehicleYear: 2022,
      vehicleColor: 'Silver',
      licensePlate: 'ABC123',
      driverLicenseNumber: 'DL123456',
      status: 'approved',
      isOnline: true,
      totalRides: 10,
      totalEarnings: 250.5,
      rating: 4.9,
      createdAt: new Date(),
    });
  }

  // User methods
  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  // Rider methods
  getRiderById(id: string): Rider | undefined {
    return this.riders.get(id);
  }

  createRider(rider: Rider): Rider {
    this.riders.set(rider.id, rider);
    return rider;
  }

  updateRider(id: string, data: Partial<Rider>): Rider | undefined {
    const rider = this.riders.get(id);
    if (rider) {
      const updated = { ...rider, ...data };
      this.riders.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Driver methods
  getDriverById(id: string): Driver | undefined {
    return this.drivers.get(id);
  }

  getDriverByUserId(userId: string): Driver | undefined {
    return Array.from(this.drivers.values()).find((d) => d.userId === userId);
  }

  getPendingDrivers(): Driver[] {
    return Array.from(this.drivers.values()).filter((d) => d.status === 'pending');
  }

  getAllDrivers(): Driver[] {
    return Array.from(this.drivers.values());
  }

  createDriver(driver: Driver): Driver {
    this.drivers.set(driver.id, driver);
    return driver;
  }

  updateDriver(id: string, data: Partial<Driver>): Driver | undefined {
    const driver = this.drivers.get(id);
    if (driver) {
      const updated = { ...driver, ...data };
      this.drivers.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Ride methods
  getRideById(id: string): Ride | undefined {
    return this.rides.get(id);
  }

  getRidesByRiderId(riderId: string): Ride[] {
    return Array.from(this.rides.values()).filter((r) => r.riderId === riderId);
  }

  getRidesByDriverId(driverId: string): Ride[] {
    return Array.from(this.rides.values()).filter((r) => r.driverId === driverId);
  }

  getActiveRides(): Ride[] {
    return Array.from(this.rides.values()).filter(
      (r) => r.status === 'requested' || r.status === 'accepted' || r.status === 'in_progress'
    );
  }

  getAllRides(): Ride[] {
    return Array.from(this.rides.values());
  }

  createRide(ride: Ride): Ride {
    this.rides.set(ride.id, ride);
    return ride;
  }

  updateRide(id: string, data: Partial<Ride>): Ride | undefined {
    const ride = this.rides.get(id);
    if (ride) {
      const updated = { ...ride, ...data };
      this.rides.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Rating methods
  getRatingsByUserId(userId: string): Rating[] {
    return Array.from(this.ratings.values()).filter((r) => r.rateeId === userId);
  }

  createRating(rating: Rating): Rating {
    this.ratings.set(rating.id, rating);
    return rating;
  }

  // Analytics
  getAnalytics() {
    const users = Array.from(this.users.values());
    const drivers = Array.from(this.drivers.values());
    const rides = Array.from(this.rides.values());

    return {
      totalUsers: users.length,
      totalDrivers: drivers.length,
      approvedDrivers: drivers.filter((d) => d.status === 'approved').length,
      totalRides: rides.length,
      completedRides: rides.filter((r) => r.status === 'completed').length,
      totalRevenue: rides
        .filter((r) => r.status === 'completed')
        .reduce((sum, r) => sum + (r.finalPrice || r.requestedPrice), 0),
    };
  }
}

export const mockDb = new MockDatabase();
