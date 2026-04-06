# Plattsburgh RideShare Platform Architecture

## Overview
A complete ride-sharing platform for Plattsburgh, NY with three applications:
1. **Rider App** — Mobile app for passengers
2. **Driver App** — Mobile app for drivers
3. **Admin Dashboard** — Web interface for platform management

## Technology Stack

### Backend
- **Runtime:** Node.js + Express
- **Database:** PostgreSQL (via Drizzle ORM)
- **Authentication:** JWT + OAuth
- **Real-time:** WebSockets (Socket.io)
- **File Storage:** S3-compatible

### Mobile Apps
- **Framework:** React Native + Expo
- **State Management:** Context API + AsyncStorage
- **Styling:** NativeWind (Tailwind CSS)
- **Maps:** Expo Maps / Google Maps API

### Admin Dashboard
- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts

## Database Schema

### Users Table
```sql
- id (UUID, PK)
- email (string, unique)
- phone (string, unique)
- password_hash (string)
- first_name (string)
- last_name (string)
- profile_picture_url (string)
- user_type (enum: 'rider', 'driver', 'admin')
- status (enum: 'active', 'suspended', 'deleted')
- created_at (timestamp)
- updated_at (timestamp)
```

### Riders Table
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- phone_verified (boolean)
- profile_completed (boolean)
- rating (float, default 5.0)
- total_rides (integer, default 0)
- payment_methods (json: {cash, zelle, paypal, venmo})
```

### Drivers Table
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- vehicle_make (string)
- vehicle_model (string)
- vehicle_year (integer)
- vehicle_color (string)
- license_plate (string)
- driver_license_number (string)
- status (enum: 'pending', 'approved', 'rejected', 'suspended')
- rating (float, default 5.0)
- total_rides (integer, default 0)
- total_earnings (float, default 0)
- is_online (boolean, default false)
- current_location (geometry)
- created_at (timestamp)
- updated_at (timestamp)
```

### Rides Table
```sql
- id (UUID, PK)
- rider_id (UUID, FK)
- driver_id (UUID, FK, nullable)
- pickup_location (geometry)
- dropoff_location (geometry)
- pickup_address (string)
- dropoff_address (string)
- requested_price (float)
- final_price (float, nullable)
- status (enum: 'requested', 'accepted', 'in_progress', 'completed', 'cancelled')
- payment_method (enum: 'cash', 'zelle', 'paypal', 'venmo')
- created_at (timestamp)
- started_at (timestamp, nullable)
- completed_at (timestamp, nullable)
```

### Ratings Table
```sql
- id (UUID, PK)
- ride_id (UUID, FK)
- rater_id (UUID, FK)
- ratee_id (UUID, FK)
- rating (integer, 1-5)
- comment (text)
- created_at (timestamp)
```

## API Endpoints

### Authentication
- `POST /auth/signup` — Register new user
- `POST /auth/login` — Login user
- `POST /auth/logout` — Logout user
- `POST /auth/refresh` — Refresh JWT token

### Riders
- `GET /riders/:id` — Get rider profile
- `PUT /riders/:id` — Update rider profile
- `POST /riders/:id/verify-phone` — Verify phone number
- `GET /riders/:id/rides` — Get ride history

### Drivers
- `GET /drivers/:id` — Get driver profile
- `PUT /drivers/:id` — Update driver profile
- `POST /drivers/:id/toggle-online` — Go online/offline
- `GET /drivers/:id/rides` — Get ride history
- `GET /drivers/:id/earnings` — Get earnings summary

### Rides
- `POST /rides` — Request a new ride
- `GET /rides/:id` — Get ride details
- `PUT /rides/:id/accept` — Driver accepts ride
- `PUT /rides/:id/reject` — Driver rejects ride
- `PUT /rides/:id/start` — Start ride
- `PUT /rides/:id/complete` — Complete ride
- `PUT /rides/:id/cancel` — Cancel ride
- `GET /rides/active` — Get active rides

### Ratings
- `POST /ratings` — Submit rating
- `GET /ratings/:userId` — Get user ratings

### Admin
- `GET /admin/drivers/pending` — Get pending driver approvals
- `PUT /admin/drivers/:id/approve` — Approve driver
- `PUT /admin/drivers/:id/reject` — Reject driver
- `GET /admin/rides` — Get all rides
- `GET /admin/analytics` — Get platform analytics

## Real-time Features (WebSockets)

### Events
- `driver:location-update` — Driver location changed
- `ride:status-update` — Ride status changed
- `ride:driver-assigned` — Driver assigned to ride
- `ride:cancelled` — Ride cancelled
- `ride:completed` — Ride completed

## Security Considerations
- JWT tokens with 1-hour expiry
- Phone verification for riders
- Manual driver approval process
- Rate limiting on API endpoints
- HTTPS only
- Password hashing (bcrypt)
- XSS and CSRF protection

## Deployment
- Backend: Node.js server
- Database: PostgreSQL
- Mobile Apps: Expo (iOS/Android)
- Admin: React web app
- Storage: S3-compatible service
