const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    invoice_number: String,
    bill_amount: Number,
    points: Number,
    from_id: mongoose.Schema.Types.ObjectId,
    to_id: mongoose.Schema.Types.ObjectId,
    status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Transaction', transactionSchema);
