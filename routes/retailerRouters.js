const express = require('express');
const router = express.Router();
const { registerRetailer, loginRetailer } = require('../controllers/authController');
const { transferPointsToUser, getAllRetailers, requestRedemption, addUsers, getRetailerUsers, RetailerPoints, allEntries, getProfileDetails, updateProfileDetails, KYCstatus, retailerKYCrequest } = require('../controllers/retailerController');
const {  authToken } = require('../middlewares/isLoggedIn');
const retailerModel = require('../models/retailer-model');
const KYC = require('../models/kyc-model');


router.get('/',getAllRetailers);

// Register  
router.post('/register', registerRetailer);

// Login
router.post('/login', loginRetailer);

// Transfer points to a user
router.post('/transfer-points',authToken, transferPointsToUser);

// Redeem points
router.post('/request-redemption',authToken, requestRedemption);

// Add new user(plumber)
router.post('/addusers',authToken,addUsers);

// Get all added user(plumber)
router.get('/users',authToken,getRetailerUsers);

router.get('/points',authToken,RetailerPoints);
// history
router.get('/allentries',authToken,allEntries);

router.get('/profile', authToken, getProfileDetails);
// Route to update retailer profile
router.put('/profile', authToken,updateProfileDetails);
  
// KYC request
router.post('/kyc/request', authToken, retailerKYCrequest);

// KYC status
router.get('/kyc/status', authToken, KYCstatus);


module.exports = router;
