const express = require('express');
const router = express.Router();
const {registerUser,loginUser} = require('../controllers/authController');
const { UserPoints, getAllUsers, userrequestRedemption } = require('../controllers/userController');
const { authMiddleware, authToken } = require('../middlewares/isLoggedIn');

router.get('/',getAllUsers);

router.post('/register',registerUser );

router.post('/login',loginUser);

// Get available points
router.get('/points',authToken, UserPoints);

// Redeem points
router.post('/request-redemption',authToken, userrequestRedemption);


module.exports = router;