const express = require('express');
const router = express.Router();
const { registerManufacturer, loginManufacturer } = require('../controllers/authController');
const { transferPointstoRetailer, approveRedemption, userapproveRedemption, getUserRedemptionRequests, getRetailererRedemptionRequests } = require('../controllers/manufacturerController');
// Create a new retailer
router.post('/register', registerManufacturer);

// Login
router.post('/login', loginManufacturer);

// Transfer points to a retailer
router.post('/transfer-points', transferPointstoRetailer);

// Verify a transaction or points redemption request (retailer)
router.post('/approve-redemption', approveRedemption);

// get all redemption requests made by Retailers
router.get('/retailer/all-requests',getRetailererRedemptionRequests);

// Verify a transaction or points redemption request (user)
router.post('/user-approve-redemption', userapproveRedemption);
// router.get('/:userId',getUserRedemptionRequests);

// get all redemption requests made by Users
router.get('/users/all-requests',getUserRedemptionRequests);


module.exports = router;
