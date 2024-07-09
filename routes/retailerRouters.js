const express = require('express');
const router = express.Router();
const { registerRetailer, loginRetailer } = require('../controllers/authController');
const { transferPointsToUser, getAllRetailers, requestRedemption, addUsers, getRetailerUsers, RetailerPoints, allEntries } = require('../controllers/retailerController');
const {  authToken_retial } = require('../middlewares/isLoggedIn');
const retailerModel = require('../models/retailer-model');

router.get('/',getAllRetailers);

// Register  
router.post('/register', registerRetailer);

// Login
router.post('/login', loginRetailer);

// Transfer points to a user
router.post('/transfer-points', transferPointsToUser);

// Redeem points
router.post('/request-redemption',authToken_retial, requestRedemption);

router.post('/addusers',authToken_retial,addUsers);

router.get('/users',authToken_retial,getRetailerUsers);

router.get('/points',authToken_retial,RetailerPoints);
router.get('/allentries',authToken_retial,allEntries);

module.exports = router;
