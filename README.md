# Plattsburgh RideShare Platform

A complete Uber-like ride-sharing platform for Plattsburgh, NY built with React Native, Express, and PostgreSQL.

## Platform Overview

Plattsburgh RideShare consists of three main applications:

1. **Rider App** - Mobile app for passengers to request rides
2. **Driver App** - Mobile app for drivers to accept and complete rides
3. **Admin Dashboard** - Web dashboard for platform management

## Features

### Rider App
- User registration and authentication
- Request rides with pickup/dropoff locations
- Real-time ride tracking
- Driver information and ratings
- Rate drivers after ride completion
- Multiple payment methods (Cash, Zelle, PayPal, Venmo)
- Ride history and profile management

### Driver App
- Driver registration and authentication
- Manual admin approval process
- Accept/reject ride requests
- Navigate to pickup and dropoff locations
- Complete rides and negotiate final price
- Rate riders after ride completion
- Earnings tracking and history
- Online/offline status management
- Vehicle information management

### Admin Dashboard
- Driver application approval/rejection
- Real-time platform analytics
- Monitor active rides
- View all rides and transactions
- User and driver management
- Revenue tracking

## Project Structure

```
plattsburgh-rideshare/
├── server/                    # Backend Express server
│   ├── db/
│   │   ├── schema.ts         # Database schema with Drizzle ORM
│   │   └── index.ts          # Database connection
│   ├── routes/
│   │   ├── auth.ts           # Authentication endpoints
│   │   ├── riders.ts         # Rider endpoints
│   │   ├── drivers.ts        # Driver endpoints
│   │   ├── rides.ts          # Ride management endpoints
│   │   ├── ratings.ts        # Rating endpoints
│   │   └── admin.ts          # Admin endpoints
│   ├── middleware/
│   │   └── auth.ts           # Authentication middleware
│   ├── utils/
│   │   └── auth.ts           # JWT and password utilities
│   └── index.ts              # Server entry point
├── apps/
│   ├── rider/                # Rider React Native app
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── RequestRideScreen.tsx
│   │   │   ├── RideTrackingScreen.tsx
│   │   │   ├── RateDriverScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── App.tsx
│   │   └── package.json
│   ├── driver/               # Driver React Native app
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── AvailableRidesScreen.tsx
│   │   │   ├── RideDetailsScreen.tsx
│   │   │   ├── RateRiderScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── EarningsScreen.tsx
│   │   ├── App.tsx
│   │   └── package.json
│   └── admin/                # Admin web dashboard
│       ├── index.html        # React-based dashboard
│       ├── server.js         # Express server for admin
│       └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install Backend Dependencies**
```bash
cd /home/ubuntu/plattsburgh-rideshare
npm install
```

2. **Install Rider App Dependencies**
```bash
cd apps/rider
npm install
```

3. **Install Driver App Dependencies**
```bash
cd ../driver
npm install
```

4. **Install Admin Dashboard Dependencies**
```bash
cd ../admin
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/plattsburgh_rideshare

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:8081

# Admin
ADMIN_PORT=3001
```

### Running the Platform

1. **Start the Backend Server**
```bash
npm run dev:server
```

2. **Start the Rider App (in another terminal)**
```bash
cd apps/rider
npm start
```

3. **Start the Driver App (in another terminal)**
```bash
cd apps/driver
npm start
```

4. **Start the Admin Dashboard (in another terminal)**
```bash
cd apps/admin
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Riders
- `GET /api/riders/:id` - Get rider profile
- `GET /api/riders/:id/rides` - Get rider's rides
- `PUT /api/riders/:id` - Update rider profile

### Drivers
- `GET /api/drivers/:id` - Get driver profile
- `GET /api/drivers/:id/rides` - Get driver's rides
- `PUT /api/drivers/:id` - Update driver profile
- `POST /api/drivers/:id/toggle-online` - Toggle online status

### Rides
- `POST /api/rides` - Request a new ride
- `GET /api/rides/:id` - Get ride details
- `PUT /api/rides/:id/accept` - Driver accepts ride
- `PUT /api/rides/:id/start` - Start ride
- `PUT /api/rides/:id/complete` - Complete ride
- `PUT /api/rides/:id/cancel` - Cancel ride
- `PUT /api/rides/:id/reject` - Reject ride

### Ratings
- `POST /api/ratings` - Submit rating
- `GET /api/ratings/:userId` - Get user ratings

### Admin
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/drivers/pending` - Pending driver applications
- `PUT /api/admin/drivers/:id/approve` - Approve driver
- `PUT /api/admin/drivers/:id/reject` - Reject driver
- `GET /api/admin/rides` - All rides

## User Types

### Rider
- Can request rides
- Must have verified phone and completed profile
- Auto-approved if eligible
- Can rate drivers

### Driver
- Must apply and be manually approved by admin
- Must complete vehicle information
- Can accept/reject ride requests
- Can rate riders
- Earns money per completed ride

### Admin
- Can approve/reject driver applications
- Can view platform analytics
- Can monitor all rides
- Can manage users and drivers

## Ride Status Flow

1. **Requested** - Rider requests a ride
2. **Accepted** - Driver accepts the ride request
3. **In Progress** - Driver has picked up rider
4. **Completed** - Ride completed, payment processed
5. **Cancelled** - Ride was cancelled

## Payment Methods

- **Cash** - Pay driver in person
- **Zelle** - Digital payment via Zelle
- **PayPal** - Digital payment via PayPal
- **Venmo** - Digital payment via Venmo

## Rating System

Both riders and drivers can rate each other on a scale of 1-5 stars:
- 1 Star: Poor
- 2 Stars: Fair
- 3 Stars: Good
- 4 Stars: Very Good
- 5 Stars: Excellent

Ratings include optional comments for feedback.

## Database Schema

### Users Table
- id, firstName, lastName, email, phone, password, userType, createdAt

### Riders Table
- id, userId, totalRides, rating, phoneVerified, profileCompleted, createdAt

### Drivers Table
- id, userId, vehicleMake, vehicleModel, vehicleYear, vehicleColor, licensePlate, driverLicenseNumber, status, isOnline, totalRides, totalEarnings, rating, createdAt

### Rides Table
- id, riderId, driverId, pickupLatitude, pickupLongitude, pickupAddress, dropoffLatitude, dropoffLongitude, dropoffAddress, requestedPrice, finalPrice, status, paymentMethod, createdAt

### Ratings Table
- id, rideId, raterId, rateeId, rating, comment, createdAt

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- CORS enabled for allowed origins
- Input validation on all endpoints
- SQL injection prevention with parameterized queries

## Future Enhancements

- Real-time GPS tracking with WebSockets
- Push notifications for ride requests
- Advanced search and filtering
- Ride scheduling for future dates
- Driver background checks
- Insurance integration
- Surge pricing algorithm
- Referral program
- Multi-language support

## Support

For issues or questions, please contact the development team.

## License

Proprietary - All rights reserved
