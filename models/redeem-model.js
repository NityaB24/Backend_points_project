const mongoose = require('mongoose');

const redemptionRequestSchema = new mongoose.Schema({
    retailerId: mongoose.Schema.Types.ObjectId,
    points: Number,
    method: String,
    status: { type: String, default: 'pending' },
    dateRequested: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RedemptionRequest', redemptionRequestSchema);
