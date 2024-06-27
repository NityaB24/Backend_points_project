const User = require('../models/user-model');
const Retailer = require('../models/retailer-model');
const { validationResult } = require('express-validator');
const Transaction = require('../models/transaction-model');
const RedemptionRequest = require('../models/redeem-model');
module.exports.getAllRetailers = async (req, res) => {
    try {
        const retailers = await Retailer.find();
        res.status(200).json(retailers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
module.exports.retailerPoints = (req, res) => {
    const { name } = req.query;
    Retailer.findOne({name:name}).then(retailer => {
        if (!retailer) {
            return res.status(404).send('Retailer not found');
        }
        res.status(200).send({ points: retailer.points });
    }).catch(error => {
        res.status(500).send(error);
    });
}

module.exports.transferPointsToUser = async (req, res) => {
    const { retailerId, userId, points, invoice_number, bill_amount } = req.body;

    try {
        const retailer = await Retailer.findById(retailerId);
        if (!retailer) {
            return res.status(404).send({ message: 'Retailer not found' });
        }

        let pointsToTransfer = parseInt(points, 10);
        
        const now = new Date();
        let after = new Date();
        after.setMonth(after.getMonth() + 3);

        // Filter expired points
        retailer.points_to_be_Sent = retailer.points_to_be_Sent.filter(entry => {
            const expiryDate = new Date(entry.date);
            expiryDate.setMonth(expiryDate.getMonth() + 3);
            return expiryDate >= now;
        });

        // Calculate total available points
        const totalAvailablePoints = retailer.points_to_be_Sent.reduce((total, entry) => {
            return entry.type === 'received' ? total + entry.points : total;
        }, 0);

        if (totalAvailablePoints < pointsToTransfer) {
            return res.status(400).send({ message: 'Insufficient points' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Use FIFO to transfer points
        let pointsTransferred = 0;
        for (let i = 0; i < retailer.points_to_be_Sent.length; i++) {
            const entry = retailer.points_to_be_Sent[i];
            if (pointsToTransfer <= 0) break;
            if (entry.type === 'received' && entry.points > 0) {
                const pointsToDeduct = Math.min(entry.points, pointsToTransfer);
                entry.points -= pointsToDeduct;
                pointsToTransfer -= pointsToDeduct;
                pointsTransferred += pointsToDeduct;
                retailer.pointsSent += pointsToDeduct;
                user.points += pointsToDeduct;
                user.pointsReceived += pointsToDeduct;
                await user.pointsHistory.push({ points: pointsToDeduct, type: 'received', date: now, expiryDate: after });
                // If entry points are reduced to 0, remove it
                if (entry.points <= 0) {
                    retailer.points_to_be_Sent.splice(i, 1);
                    i--; // Adjust index after removal
                }
            }
        }

        // Add single entry for the total points sent
        await retailer.allEntries.push({ points: pointsTransferred, type: 'sent', date: now });

        // Update retailer total points
        retailer.totalPoints = retailer.pointsReceived - retailer.pointsSent - retailer.pointsRedeemed;

        await Promise.all([retailer.save(), user.save()]);

        const transaction = new Transaction({
            invoice_number,
            bill_amount,
            points,
            from_id: retailerId,
            to_id: userId,
            status: 'completed'
        });
        const result = await transaction.save();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// retailer redeem request
module.exports.requestRedemption = async (req, res) => {
    try {
        const { retailerId, points, method } = req.body;

        const retailer = await Retailer.findById(retailerId);
        if (!retailer) {
            return res.status(404).send('Retailer not found');
        }

        let pointsToRedeem = parseInt(points, 10);
        const now = new Date();

        // Filter expired points
        retailer.points_to_be_Redeemed = retailer.points_to_be_Redeemed.filter(entry => {
            const expiryDate = new Date(entry.date);
            expiryDate.setMonth(expiryDate.getMonth() + 3);
            return expiryDate >= now;
        });

        // Calculate total available points
        const totalAvailablePoints = retailer.points_to_be_Redeemed.reduce((total, entry) => {
            return entry.type === 'received' ? total + entry.points : total;
        }, 0);

        if (totalAvailablePoints < pointsToRedeem) {
            return res.status(400).send({ message: 'Insufficient points' });
        }

        // Use FIFO to transfer points
        for (let i = 0; i < retailer.points_to_be_Redeemed.length; i++) {
            const entry = retailer.points_to_be_Redeemed[i];
            if (pointsToRedeem <= 0) break;
            if (entry.type === 'received' && entry.points > 0) {
                const pointsToDeduct = Math.min(entry.points, pointsToRedeem);
                entry.points -= pointsToDeduct;
                pointsToRedeem -= pointsToDeduct;
                retailer.pointsRedeemed += pointsToDeduct;
                // If entry points are reduced to 0, remove it
                if (entry.points <= 0) {
                    retailer.points_to_be_Redeemed.splice(i, 1);
                    i--; // Adjust index after removal
                }
            }
        }
        await retailer.allEntries.push({ points: parseInt(points, 10), type: 'redeemed', date: now });
        retailer.totalPoints = retailer.pointsReceived - retailer.pointsSent - retailer.pointsRedeemed;

        await retailer.save();

        const redemptionRequest = new RedemptionRequest({
            retailerId,
            points,
            method,
            status: 'pending'
        });

        const result = await redemptionRequest.save();
        res.status(200).send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};