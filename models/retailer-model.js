const mongoose = require('mongoose');
const pointsHistorySchema = new mongoose.Schema({
    points: Number,
    type: { type: String, enum: ['received', 'sent', 'redeemed'] },
    date: { type: Date, default: Date.now },
    expiryDate: Date // Added expiryDate to manage the expiration of points
});

const retailerSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    pointsReceived: { type: Number, default: 0 },
    pointsSent: { type: Number, default: 0 },
    pointsRedeemed: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    points_to_be_Sent: [pointsHistorySchema],
    points_to_be_Redeemed: [pointsHistorySchema],
    allEntries: [pointsHistorySchema],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    couponCodes: [String] 
});


module.exports = mongoose.model('Retailer', retailerSchema);
