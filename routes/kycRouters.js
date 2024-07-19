
const express = require('express');
const router = express.Router();
const { authToken } = require('../middlewares/isLoggedIn');
const { retailerKYCrequests, userKYCrequests, approveRetailerKYC, approveUserKYC, rejectRetailerKYC, rejectUserKYC } = require('../controllers/kycController');


// Route to get all KYC requests
router.get('/kyc/requests', authToken, retailerKYCrequests);
router.get('/userkyc/requests', authToken, userKYCrequests);

// Route to approve KYC requests
router.post('/kyc/approve', authToken, approveRetailerKYC);
router.post('/userkyc/approve', authToken, approveUserKYC);
  
// Route to reject KYC requests
router.post('/kyc/reject',authToken, rejectRetailerKYC);
router.post('/userkyc/reject',authToken, rejectUserKYC);

module.exports = router;
