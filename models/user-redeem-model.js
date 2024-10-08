const mongoose = require('mongoose');

const userredemptionRequestSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    points: Number,
    method: String,
    holderName: String,
    ifscCode: String,
    accountNumber: Number,
    upiNumber: Number,
    status: { type: String, default: 'pending' },
    dateRequested: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserRedemptionRequest', userredemptionRequestSchema);
