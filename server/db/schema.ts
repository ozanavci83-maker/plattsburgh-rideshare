import { pgTable, text, varchar, integer, float, boolean, timestamp, uuid, enum as pgEnum, jsonb, geometry } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const userTypeEnum = pgEnum('user_type', ['rider', 'driver', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'deleted']);
export const driverStatusEnum = pgEnum('driver_status', ['pending', 'approved', 'rejected', 'suspended']);
export const rideStatusEnum = pgEnum('ride_status', ['requested', 'accepted', 'in_progress', 'completed', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'zelle', 'paypal', 'venmo']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 20 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  profilePictureUrl: text('profile_picture_url'),
  userType: userTypeEnum('user_type').notNull(),
  status: userStatusEnum('user_status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Riders table
export const riders = pgTable('riders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  phoneVerified: boolean('phone_verified').default(false).notNull(),
  profileCompleted: boolean('profile_completed').default(false).notNull(),
  rating: float('rating').default(5.0).notNull(),
  totalRides: integer('total_rides').default(0).notNull(),
  paymentMethods: jsonb('payment_methods').default(sql`'{}'`).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Drivers table
export const drivers = pgTable('drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  vehicleMake: varchar('vehicle_make', { length: 100 }).notNull(),
  vehicleModel: varchar('vehicle_model', { length: 100 }).notNull(),
  vehicleYear: integer('vehicle_year').notNull(),
  vehicleColor: varchar('vehicle_color', { length: 50 }).notNull(),
  licensePlate: varchar('license_plate', { length: 20 }).notNull(),
  driverLicenseNumber: varchar('driver_license_number', { length: 50 }).notNull(),
  status: driverStatusEnum('driver_status').default('pending').notNull(),
  rating: float('rating').default(5.0).notNull(),
  totalRides: integer('total_rides').default(0).notNull(),
  totalEarnings: float('total_earnings').default(0).notNull(),
  isOnline: boolean('is_online').default(false).notNull(),
  currentLatitude: float('current_latitude'),
  currentLongitude: float('current_longitude'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Rides table
export const rides = pgTable('rides', {
  id: uuid('id').primaryKey().defaultRandom(),
  riderId: uuid('rider_id').notNull().references(() => riders.id),
  driverId: uuid('driver_id').references(() => drivers.id),
  pickupLatitude: float('pickup_latitude').notNull(),
  pickupLongitude: float('pickup_longitude').notNull(),
  pickupAddress: text('pickup_address').notNull(),
  dropoffLatitude: float('dropoff_latitude').notNull(),
  dropoffLongitude: float('dropoff_longitude').notNull(),
  dropoffAddress: text('dropoff_address').notNull(),
  requestedPrice: float('requested_price').notNull(),
  finalPrice: float('final_price'),
  status: rideStatusEnum('ride_status').default('requested').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
});

// Ratings table
export const ratings = pgTable('ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  rideId: uuid('ride_id').notNull().references(() => rides.id),
  raterId: uuid('rater_id').notNull().references(() => users.id),
  rateeId: uuid('ratee_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Rider = typeof riders.$inferSelect;
export type NewRider = typeof riders.$inferInsert;
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
export type Ride = typeof rides.$inferSelect;
export type NewRide = typeof rides.$inferInsert;
export type Rating = typeof ratings.$inferSelect;
export type NewRating = typeof ratings.$inferInsert;
