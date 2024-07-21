const express = require('express');
const router = express.Router();
const {registerUser,loginUser} = require('../controllers/authController');
const { UserPoints, getAllUsers, userrequestRedemption, allEntries, KYCstatus, userKYCrequest, getProfileDetails, updateProfileDetails } = require('../controllers/userController');
const { authToken } = require('../middlewares/isLoggedIn');

router.get('/',getAllUsers);

router.post('/register',registerUser );

router.post('/login',loginUser);

// Get available points
router.get('/points',authToken, UserPoints);

// Redeem points
router.post('/request-redemption',authToken, userrequestRedemption);

// history
router.get('/allentries',authToken,allEntries);
  
// KYC request
router.post('/kyc/request', authToken, userKYCrequest);

// KYC status
  router.get('/kyc/status', authToken, KYCstatus);

router.get('/profile',authToken,getProfileDetails);

router.put('/profile',authToken,updateProfileDetails);
module.exports = router;