"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var dotenv = require("dotenv");
var uuid_1 = require("uuid");
var bcryptjs = require("bcryptjs");
var jwt = require("jsonwebtoken");
var mock_1 = require("./db/mock");
dotenv.config();
var app = express();
var PORT = process.env.PORT || 3000;
var JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Middleware
app.use(cors());
app.use(express.json());
// Auth middleware
var authMiddleware = function (req, res, next) {
    var _a;
    var token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        var decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
// ============ AUTH ROUTES ============
app.post('/api/auth/signup', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, firstName, lastName, email, phone, password, userType, hashedPassword, userId, user, token, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, firstName = _a.firstName, lastName = _a.lastName, email = _a.email, phone = _a.phone, password = _a.password, userType = _a.userType;
                if (mock_1.mockDb.getUserByEmail(email)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Email already exists' })];
                }
                return [4 /*yield*/, bcryptjs.hash(password, 10)];
            case 1:
                hashedPassword = _b.sent();
                userId = (0, uuid_1.v4)();
                user = mock_1.mockDb.createUser({
                    id: userId,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone,
                    password: hashedPassword,
                    userType: userType,
                    createdAt: new Date(),
                });
                if (userType === 'rider') {
                    mock_1.mockDb.createRider({
                        id: userId,
                        userId: userId,
                        totalRides: 0,
                        rating: 5,
                        phoneVerified: true,
                        profileCompleted: true,
                        createdAt: new Date(),
                    });
                }
                else if (userType === 'driver') {
                    mock_1.mockDb.createDriver({
                        id: userId,
                        userId: userId,
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
                token = jwt.sign({ id: user.id, email: user.email, userType: userType }, JWT_SECRET, {
                    expiresIn: '7d',
                });
                res.json({ user: user, token: token });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                res.status(500).json({ error: error_1.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/auth/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, isValid, token, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, email = _a.email, password = _a.password;
                user = mock_1.mockDb.getUserByEmail(email);
                if (!user) {
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid credentials' })];
                }
                return [4 /*yield*/, bcryptjs.compare(password, user.password)];
            case 1:
                isValid = _b.sent();
                if (!isValid) {
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid credentials' })];
                }
                token = jwt.sign({ id: user.id, email: user.email, userType: user.userType }, JWT_SECRET, {
                    expiresIn: '7d',
                });
                res.json({ user: user, token: token });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                res.status(500).json({ error: error_2.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ============ RIDER ROUTES ============
app.get('/api/riders/:id', authMiddleware, function (req, res) {
    var rider = mock_1.mockDb.getRiderById(req.params.id);
    if (!rider) {
        return res.status(404).json({ error: 'Rider not found' });
    }
    res.json(rider);
});
app.get('/api/riders/:id/rides', authMiddleware, function (req, res) {
    var rides = mock_1.mockDb.getRidesByRiderId(req.params.id);
    res.json(rides);
});
app.put('/api/riders/:id', authMiddleware, function (req, res) {
    var updated = mock_1.mockDb.updateRider(req.params.id, req.body);
    if (!updated) {
        return res.status(404).json({ error: 'Rider not found' });
    }
    res.json(updated);
});
// ============ DRIVER ROUTES ============
app.get('/api/drivers/:id', authMiddleware, function (req, res) {
    var driver = mock_1.mockDb.getDriverById(req.params.id);
    if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
});
app.get('/api/drivers/:id/rides', authMiddleware, function (req, res) {
    var rides = mock_1.mockDb.getRidesByDriverId(req.params.id);
    res.json(rides);
});
app.put('/api/drivers/:id', authMiddleware, function (req, res) {
    var updated = mock_1.mockDb.updateDriver(req.params.id, req.body);
    if (!updated) {
        return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(updated);
});
app.post('/api/drivers/:id/toggle-online', authMiddleware, function (req, res) {
    var driver = mock_1.mockDb.getDriverById(req.params.id);
    if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
    }
    var updated = mock_1.mockDb.updateDriver(req.params.id, { isOnline: !driver.isOnline });
    res.json(updated);
});
// ============ RIDE ROUTES ============
app.post('/api/rides', authMiddleware, function (req, res) {
    var ride = mock_1.mockDb.createRide({
        id: (0, uuid_1.v4)(),
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
app.get('/api/rides/:id', authMiddleware, function (req, res) {
    var ride = mock_1.mockDb.getRideById(req.params.id);
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    res.json(ride);
});
app.put('/api/rides/:id/accept', authMiddleware, function (req, res) {
    var ride = mock_1.mockDb.updateRide(req.params.id, { driverId: req.body.driverId, status: 'accepted' });
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    res.json(ride);
});
app.put('/api/rides/:id/start', authMiddleware, function (req, res) {
    var ride = mock_1.mockDb.updateRide(req.params.id, { status: 'in_progress' });
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    res.json(ride);
});
app.put('/api/rides/:id/complete', authMiddleware, function (req, res) {
    var ride = mock_1.mockDb.updateRide(req.params.id, {
        status: 'completed',
        finalPrice: req.body.finalPrice,
    });
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    res.json(ride);
});
app.put('/api/rides/:id/cancel', authMiddleware, function (req, res) {
    var ride = mock_1.mockDb.updateRide(req.params.id, { status: 'cancelled' });
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    res.json(ride);
});
app.get('/api/rides/active/list', authMiddleware, function (req, res) {
    var rides = mock_1.mockDb.getActiveRides();
    res.json(rides);
});
// ============ RATING ROUTES ============
app.post('/api/ratings', authMiddleware, function (req, res) {
    var rating = mock_1.mockDb.createRating({
        id: (0, uuid_1.v4)(),
        rideId: req.body.rideId,
        raterId: req.body.raterId,
        rateeId: req.body.rateeId,
        rating: req.body.rating,
        comment: req.body.comment,
        createdAt: new Date(),
    });
    res.json(rating);
});
app.get('/api/ratings/:userId', authMiddleware, function (req, res) {
    var ratings = mock_1.mockDb.getRatingsByUserId(req.params.userId);
    res.json(ratings);
});
// ============ ADMIN ROUTES ============
app.get('/api/admin/analytics', authMiddleware, function (req, res) {
    var analytics = mock_1.mockDb.getAnalytics();
    res.json(analytics);
});
app.get('/api/admin/drivers/pending', authMiddleware, function (req, res) {
    var drivers = mock_1.mockDb.getPendingDrivers();
    var driversWithUsers = drivers.map(function (d) { return (__assign(__assign({}, d), { user: mock_1.mockDb.getUserById(d.userId) })); });
    res.json(driversWithUsers);
});
app.put('/api/admin/drivers/:id/approve', authMiddleware, function (req, res) {
    var driver = mock_1.mockDb.updateDriver(req.params.id, { status: 'approved' });
    if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
});
app.put('/api/admin/drivers/:id/reject', authMiddleware, function (req, res) {
    var driver = mock_1.mockDb.updateDriver(req.params.id, { status: 'rejected' });
    if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(driver);
});
app.get('/api/admin/rides', authMiddleware, function (req, res) {
    var rides = mock_1.mockDb.getAllRides();
    res.json(rides);
});
// Health check
app.get('/health', function (req, res) {
    res.json({ status: 'OK', message: 'Plattsburgh RideShare API is running (Mock Database)' });
});
// Start server
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 Plattsburgh RideShare API running on port ".concat(PORT));
    console.log("\uD83D\uDCCA Using Mock Database (in-memory storage)");
    console.log("\uD83D\uDD17 Health check: http://localhost:".concat(PORT, "/health"));
});
