const User = require('../models/user-model');
const Retailer = require('../models/retailer-model');
const Transaction = require('../models/transaction-model');
const RedemptionRequest = require('../models/redeem-model');
const UserRedemptionRequest = require('../models/user-redeem-model');
const transactionModel = require('../models/transaction-model');

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
module.exports.approveRedemption =  async (req, res) => {
    const { redemptionRequestId, couponCode } = req.body;

    try {
        // Find redemption request by ID
        const request = await RedemptionRequest.findById(redemptionRequestId);
        if (!request) {
            return res.status(404).send('Redemption request not found');
        }

        // Check if request is pending
        if (request.status !== 'pending') {
            return res.status(400).send('Redemption request has already been processed');
        }

        // Find retailer by ID
        const retailer = await Retailer.findById(request.retailerId);
        if (!retailer) {
            return res.status(404).send('Retailer not found');
        }

        // Update redemption request status and add coupon code
        request.status = 'approved';
        request.couponCode = couponCode;

        // Save request and update retailer's coupon codes
        await Promise.all([request.save(), retailer.updateOne({ $push: { couponCodes: couponCode } })]);

        res.status(200).send({ message: 'Redemption request approved', couponCode });
    } catch (error) {
        console.error('Error approving redemption:', error);
        res.status(500).send('Server error');
    }
}

module.exports.getRetailerRedemptionRequests = async (req, res) => {
    const retailerId = req.params.retailerId;

    try {
        // Find pending redemption requests for the specified retailer
        const requests = await RedemptionRequest.find({ retailerId, status: 'pending' });
        
        if (requests.length === 0) {
            return res.status(404).json({ message: 'No pending redemption requests found' });
        }

        res.json({ requests });
    } catch (error) {
        console.error('Error fetching redemption requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// approval for user 
module.exports.userapproveRedemption = async (req, res) => {
    const { userredemptionRequestId, couponCode } = req.body;
    try{
        const request = await UserRedemptionRequest.findById(userredemptionRequestId)
        if (!request) {
            return res.status(404).send('Redemption request not found');
        }

        if (request.status !== 'pending') {
            return res.status(400).send('Redemption request already processed');
        }

        const user = User.findById(request.userId)
            if (!user) {
                return res.status(404).send('User not found');
            }
             // Update redemption request status
             request.status = 'approved';
             request.couponCode = couponCode;
            await Promise.all([request.save(), user.updateOne({ $push: { couponCodes: couponCode } })]);
            res.status(200).send({ message: 'Redemption approved', couponCode });
    }   catch(error){
        console.error('Error fetching redemption requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.getUserRedemptionRequests = async (req, res) => {
    try {
        const requests = await UserRedemptionRequest.find();
        // console.log('All requests:', requests);
        res.json({ requests });
    } catch (error) {
        console.error('Error fetching all requests:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
module.exports.getRetailererRedemptionRequests = async (req, res) => {
    try {
        const requests = await RedemptionRequest.find();
        // console.log('All requests:', requests); 
        res.json({ requests });
    } catch (error) {
        console.error('Error fetching all requests:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports.getAllTransactions = async(req,res)=>{
    try {
        const transactions = await transactionModel.find();
        // console.log('All requests:', requests); 
        res.json({ transactions });
    } catch (error) {
        console.error('Error fetching all transactions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}