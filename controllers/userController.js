const User = require('../models/user-model');
const UserRedemptionRequest = require('../models/user-redeem-model');
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.UserPoints = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user from database by userId
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return user points
        res.status(200).json({ points: user.points });
    } catch (error) {
        console.error('Error fetching user points:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// user redeem request
module.exports.userrequestRedemption = async (req, res) => {
    const { userId, points, method } = req.body;

    User.findById(userId).then(user => {
        if (!user) {
            return res.status(404).send('User not found');
        }

        let pointsToTransfer = parseInt(points, 10);
        const now = new Date();

        // Filter expired points
        user.pointsHistory = user.pointsHistory.filter(entry => {
            const expiryDate = new Date(entry.date);
            expiryDate.setMonth(expiryDate.getMonth() + 3);
            return expiryDate >= now;
        });

        // Calculate total available points
        const totalAvailablePoints = user.pointsHistory.reduce((total, entry) => {
            return entry.type === 'received' ? total + entry.points : total;
        }, 0);

        if (totalAvailablePoints < pointsToTransfer) {
            return res.status(400).send({ message: 'Insufficient points' });
        }

        // Use FIFO to transfer points
        let updatedPointsHistory = [];
        for (const entry of user.pointsHistory) {
            if (pointsToTransfer <= 0) {
                updatedPointsHistory.push(entry);
                continue;
            }
            if (entry.type === 'received' && entry.points > 0) {
                const pointsToDeduct = Math.min(entry.points, pointsToTransfer);
                entry.points -= pointsToDeduct;
                pointsToTransfer -= pointsToDeduct;
                user.pointsRedeemed += pointsToDeduct;
                user.allEntries.push({ points: parseInt(points, 10), type: 'redeemed', date: now });

                // Only keep entry if it still has points left
                if (entry.points > 0) {
                    updatedPointsHistory.push(entry);
                }
            } else {
                updatedPointsHistory.push(entry);
            }
        }
        
        user.pointsHistory = updatedPointsHistory;

        user.save().then(() => {
            const userredemptionRequest = new UserRedemptionRequest({
                userId,
                points,
                method,
                status: 'pending'
            });

            userredemptionRequest.save().then(result => {
                res.status(200).send(result);
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