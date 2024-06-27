const express = require('express');
const router = express.Router();
const { registerManufacturer, loginManufacturer } = require('../controllers/authController');
const { transferPointstoRetailer, verifyRedeem, verifyRedemptionRequest, approveRedemption, userapproveRedemption } = require('../controllers/manufacturerController');

// Create a new retailer
router.post('/register', registerManufacturer);

// Login
router.post('/login', loginManufacturer);

// Transfer points to a retailer
router.post('/transfer-points', transferPointstoRetailer);

// Verify a transaction or points redemption request (retailer)
router.post('/approve-redemption', approveRedemption);

// Verify a transaction or points redemption request (user)
router.post('/user-approve-redemption', userapproveRedemption);

module.exports = router;
