"use strict";
// Mock Database - In-memory storage for development/testing
// Data persists during the session but resets on server restart
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDb = void 0;
var MockDatabase = /** @class */ (function () {
    function MockDatabase() {
        this.users = new Map();
        this.riders = new Map();
        this.drivers = new Map();
        this.rides = new Map();
        this.ratings = new Map();
        this.initializeTestData();
    }
    MockDatabase.prototype.initializeTestData = function () {
        // Create test admin
        var adminId = 'admin-1';
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
        var riderId = 'rider-1';
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
        var driverId = 'driver-1';
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
    };
    // User methods
    MockDatabase.prototype.getUserByEmail = function (email) {
        return Array.from(this.users.values()).find(function (u) { return u.email === email; });
    };
    MockDatabase.prototype.getUserById = function (id) {
        return this.users.get(id);
    };
    MockDatabase.prototype.createUser = function (user) {
        this.users.set(user.id, user);
        return user;
    };
    // Rider methods
    MockDatabase.prototype.getRiderById = function (id) {
        return this.riders.get(id);
    };
    MockDatabase.prototype.createRider = function (rider) {
        this.riders.set(rider.id, rider);
        return rider;
    };
    MockDatabase.prototype.updateRider = function (id, data) {
        var rider = this.riders.get(id);
        if (rider) {
            var updated = __assign(__assign({}, rider), data);
            this.riders.set(id, updated);
            return updated;
        }
        return undefined;
    };
    // Driver methods
    MockDatabase.prototype.getDriverById = function (id) {
        return this.drivers.get(id);
    };
    MockDatabase.prototype.getDriverByUserId = function (userId) {
        return Array.from(this.drivers.values()).find(function (d) { return d.userId === userId; });
    };
    MockDatabase.prototype.getPendingDrivers = function () {
        return Array.from(this.drivers.values()).filter(function (d) { return d.status === 'pending'; });
    };
    MockDatabase.prototype.getAllDrivers = function () {
        return Array.from(this.drivers.values());
    };
    MockDatabase.prototype.createDriver = function (driver) {
        this.drivers.set(driver.id, driver);
        return driver;
    };
    MockDatabase.prototype.updateDriver = function (id, data) {
        var driver = this.drivers.get(id);
        if (driver) {
            var updated = __assign(__assign({}, driver), data);
            this.drivers.set(id, updated);
            return updated;
        }
        return undefined;
    };
    // Ride methods
    MockDatabase.prototype.getRideById = function (id) {
        return this.rides.get(id);
    };
    MockDatabase.prototype.getRidesByRiderId = function (riderId) {
        return Array.from(this.rides.values()).filter(function (r) { return r.riderId === riderId; });
    };
    MockDatabase.prototype.getRidesByDriverId = function (driverId) {
        return Array.from(this.rides.values()).filter(function (r) { return r.driverId === driverId; });
    };
    MockDatabase.prototype.getActiveRides = function () {
        return Array.from(this.rides.values()).filter(function (r) { return r.status === 'requested' || r.status === 'accepted' || r.status === 'in_progress'; });
    };
    MockDatabase.prototype.getAllRides = function () {
        return Array.from(this.rides.values());
    };
    MockDatabase.prototype.createRide = function (ride) {
        this.rides.set(ride.id, ride);
        return ride;
    };
    MockDatabase.prototype.updateRide = function (id, data) {
        var ride = this.rides.get(id);
        if (ride) {
            var updated = __assign(__assign({}, ride), data);
            this.rides.set(id, updated);
            return updated;
        }
        return undefined;
    };
    // Rating methods
    MockDatabase.prototype.getRatingsByUserId = function (userId) {
        return Array.from(this.ratings.values()).filter(function (r) { return r.rateeId === userId; });
    };
    MockDatabase.prototype.createRating = function (rating) {
        this.ratings.set(rating.id, rating);
        return rating;
    };
    // Analytics
    MockDatabase.prototype.getAnalytics = function () {
        var users = Array.from(this.users.values());
        var drivers = Array.from(this.drivers.values());
        var rides = Array.from(this.rides.values());
        return {
            totalUsers: users.length,
            totalDrivers: drivers.length,
            approvedDrivers: drivers.filter(function (d) { return d.status === 'approved'; }).length,
            totalRides: rides.length,
            completedRides: rides.filter(function (r) { return r.status === 'completed'; }).length,
            totalRevenue: rides
                .filter(function (r) { return r.status === 'completed'; })
                .reduce(function (sum, r) { return sum + (r.finalPrice || r.requestedPrice); }, 0),
        };
    };
    return MockDatabase;
}());
exports.mockDb = new MockDatabase();
