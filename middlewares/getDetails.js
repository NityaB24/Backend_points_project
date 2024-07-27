const jwt = require('jsonwebtoken');
const Retailer = require('../models/retailer-model');
const User = require('../models/user-model');
require('dotenv').config();

// Middleware to authenticate retailer
module.exports.authenticateRetailer = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.retailerId = decoded.retailerId;
        next();
    } catch (error) {
        res.status(401).send('Authentication failed');
    }
};

// Middleware to get selected user
module.exports.getSelectedUser = (req, res, next) => {
    const { userId } = req.body; // Or get it from query params or other parts of the request
    if (!userId) {
        return res.status(400).send('User ID is required');
    }
    req.userId = userId;
    next();
};
