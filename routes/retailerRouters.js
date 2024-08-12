const express = require('express');
const router = express.Router();
const { registerRetailer, loginRetailer } = require('../controllers/authController');
const { transferPointsToUser, getAllRetailers, requestRedemption, addUsers, getRetailerUsers, RetailerPoints, allEntries, getProfileDetails, updateProfileDetails, KYCstatus, retailerKYCrequest } = require('../controllers/retailerController');
const {  authToken } = require('../middlewares/isLoggedIn');
const retailerModel = require('../models/retailer-model');
const KYC = require('../models/kyc-model');
const userModel = require('../models/user-model');


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

router.delete('/users/:userId', authToken, async (req, res) => {
    const { userId } = req.params;

    try {
        // Check if the user exists
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await retailerModel.updateMany(
            { users: userId },  // Assuming 'users' is an array of user IDs
            { $pull: { users: userId } }  // Remove the user ID from the 'users' array
        );

        // Respond with success message
        res.status(200).json({ message: 'User successfully deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
