const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    status: { type: String,enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    aadharNumber: String,
    aadharFront: { type: String },
    aadharBack: { type: String },
    panCardFront: { type: String },
    address: {
        name: String,
        currentAddress: String,
        city: String,
        state: String,
        phoneNumber: String,
        emailAddress: String
    },
    comment: String,
});

module.exports = mongoose.model('userKYC', kycSchema);
