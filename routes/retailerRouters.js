const express = require('express');
const router = express.Router();
const { registerRetailer, loginRetailer } = require('../controllers/authController');
const { transferPointsToUser, retailerPoints, getAllRetailers, requestRedemption } = require('../controllers/retailerController');
const { authenticateRetailer, getSelectedUser } = require('../middlewares/getDetails');
const { authToken } = require('../middlewares/isLoggedIn');

router.get('/',getAllRetailers);

// Register  
router.post('/register', registerRetailer);

// Login
router.post('/login', loginRetailer);

// Get available points
router.get('/points', retailerPoints);

// Transfer points to a user
router.post('/transfer-points', transferPointsToUser);

// Redeem points
router.post('/request-redemption', requestRedemption);

module.exports = router;
