const User = require('../models/user-model');
const Retailer = require('../models/retailer-model');
const Transaction = require('../models/transaction-model');
const RedemptionRequest = require('../models/redeem-model');
const UserRedemptionRequest = require('../models/user-redeem-model');

module.exports.transferPointstoRetailer = (req, res) => {
    const { retailerId, points, invoice_number, bill_amount } = req.body;
    Retailer.findById(retailerId).then(retailer => {
        if (!retailer) {
            return res.status(404).send('Retailer not found');
        }
        const pointsToAdd = parseInt(points, 10);
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3); // Points expire after 3 months


        retailer.points_to_be_Sent.push({ points, type: 'received', expiryDate });
        retailer.points_to_be_Redeemed.push({ points, type: 'received', expiryDate });
        retailer.pointsReceived = retailer.pointsReceived + pointsToAdd;
        retailer.totalPoints = retailer.pointsReceived - retailer.pointsSent - retailer.pointsRedeemed;
        retailer.allEntries.push({ points: pointsToAdd, type: 'received', expiryDate });

        retailer.save().then(() => {
            const transaction = new Transaction({
                invoice_number,
                bill_amount,
                points:pointsToAdd,
                from_id: null,
                to_id: retailerId,
                status: 'completed'
            });
            transaction.save().then(result => {
                res.status(200).send(result);
            }).catch(error => {
                res.status(500).send(error);
            });
        });
    }).catch(error => {
        res.status(500).send(error);
    });
}

// approval for retailer
module.exports.approveRedemption = (req, res) => {
    const { redemptionRequestId, couponCode } = req.body;

    RedemptionRequest.findById(redemptionRequestId).then(request => {
        if (!request) {
            return res.status(404).send('Redemption request not found');
        }

        if (request.status !== 'pending') {
            return res.status(400).send('Redemption request already processed');
        }

        Retailer.findById(request.retailerId).then(retailer => {
            if (!retailer) {
                return res.status(404).send('Retailer not found');
            }

            // Update redemption request status
            request.status = 'approved';
            request.couponCode = couponCode;

            Promise.all([request.save(), retailer.updateOne({ $push: { couponCodes: couponCode } })])
            .then(() => {
                res.status(200).send({ message: 'Redemption approved', couponCode });
            }).catch(error => {
                res.status(500).send(error);
            });
        }).catch(error => {
            res.status(500).send(error);
        });
    }).catch(error => {
        res.status(500).send(error);
    });
};

// approval for user 
module.exports.userapproveRedemption = (req, res) => {
    const { userredemptionRequestId, couponCode } = req.body;

    UserRedemptionRequest.findById(userredemptionRequestId).then(request => {
        if (!request) {
            return res.status(404).send('Redemption request not found');
        }

        if (request.status !== 'pending') {
            return res.status(400).send('Redemption request already processed');
        }

        User.findById(request.userId).then(user => {
            if (!user) {
                return res.status(404).send('Retailer not found');
            }

            // Update redemption request status
            request.status = 'approved';
            request.couponCode = couponCode;

            Promise.all([request.save(), user.updateOne({ $push: { couponCodes: couponCode } })])
            .then(() => {
                res.status(200).send({ message: 'Redemption approved', couponCode });
            }).catch(error => {
                res.status(500).send(error);
            });
        }).catch(error => {
            res.status(500).send(error);
        });
    }).catch(error => {
        res.status(500).send(error);
    });
};