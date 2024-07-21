const express = require('express');
const router = express.Router();
const { registerManufacturer, loginManufacturer } = require('../controllers/authController');
const { transferPointstoRetailer, approveRedemption, userapproveRedemption, getUserRedemptionRequests, getRetailererRedemptionRequests, getAllTransactions, getScheme, uploadScheme } = require('../controllers/manufacturerController');
const { authToken_manu, authToken } = require('../middlewares/isLoggedIn');
const manufacturerModel = require('../models/manufacturer-model');
// Create a new retailer
router.post('/register', registerManufacturer);

// Login
router.post('/login', loginManufacturer);

// Transfer points to a retailer
router.post('/transfer-points', authToken, transferPointstoRetailer);

// Verify a transaction or points redemption request (retailer)
router.post('/approve-redemption',authToken, approveRedemption);

// get all redemption requests made by Retailers
router.get('/retailer/all-requests',getRetailererRedemptionRequests);

// Verify a transaction or points redemption request (user)
router.post('/user-approve-redemption',authToken, userapproveRedemption);

// get all redemption requests made by Users
router.get('/users/all-requests',getUserRedemptionRequests);

router.get('/transactions',getAllTransactions);

router.post('/scheme', uploadScheme);

router.get('/scheme', getScheme);

module.exports = router;
