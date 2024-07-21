const User = require('../models/user-model');
const Retailer = require('../models/retailer-model');
const Transaction = require('../models/transaction-model');
const RedemptionRequest = require('../models/redeem-model');
const KYC = require('../models/kyc-model');

module.exports.getProfileDetails = async (req, res) => {
    try {
        const retailerId = req.retailer.id; // Assume userId is extracted from token
        const retailer = await Retailer.findById(retailerId);
        if (!retailer) {
          console.log('Retailer not found');
          return res.status(404).send('Retailer not found');
        }
        let profilePhoto = retailer.profilePhoto;
        res.status(200).send({
          ...retailer.toObject(),
          profilePhoto,
        });
      } catch (error) {
        console.error('Backend error:', error.message, error.stack);
        res.status(500).send(error.message);
      }
  }

  module.exports.updateProfileDetails = async (req, res) => {
    try {
        const retailerId = req.retailer.id; // Assuming userId is extracted from token
        const { name, email, profilePhoto } = req.body; // Expect profilePhoto as a base64 string
    
        const updates = { name, email ,profilePhoto};
    
    
        const retailer = await Retailer.findByIdAndUpdate(retailerId, updates, { new: true });
        if (!retailer) return res.status(404).send('Retailer not found');
    
        await retailer.save();
    
        res.status(200).send('Retailer profile updated successfully');
      } catch (error) {
        console.error('Update error:', error.message);
        res.status(500).send(error.message);
      }
  }
module.exports.getAllRetailers = async (req, res) => {
    try {
        const retailers = await Retailer.find();
        res.status(200).json(retailers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.transferPointsToUser = async (req, res) => {
    const { retailerId, userId, points, invoice_number, bill_amount } = req.body;

    try {
        const retailer = await Retailer.findById(retailerId);
        if (!retailer) {
            return res.status(404).send({ message: 'Retailer not found' });
        }

        let pointsToTransfer = parseInt(points, 10);
        if (isNaN(pointsToTransfer)) {
            return res.status(400).send({ message: 'Invalid points value' });
        }
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
        await user.allEntries.push({ points: pointsTransferred, type: 'received', date: now });

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
        const { points, method } = req.body;
        const retailerId = req.retailer.id;
        const retailer = await Retailer.findById(retailerId);
        if (!retailer) {
            return res.status(404).send('Retailer not found');
        }

        let pointsToRedeem = parseInt(points, 10);
        if (isNaN(pointsToRedeem)) {
            return res.status(400).send('Invalid points value');
        }
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
module.exports.addUsers = async (req, res) => {
    const {  email } = req.body;
    const retailerId = req.retailer.id;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const retailer = await Retailer.findById(retailerId);
        if (!retailer) {
            return res.status(404).send({ message: 'Retailer not found' });
        }

        if (!retailer.users) {
            retailer.users = [];
        }

        if (retailer.users.includes(user._id)) {
            return res.status(400).send({ message: 'User already added to retailer' });
        }

        retailer.users.push(user._id);
        await retailer.save();

        res.status(200).send({ message: 'User added successfully', user });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

module.exports.getRetailerUsers = async (req, res) => {
    const retailerId = req.retailer.id;

    try {
        const retailer = await Retailer.findById(retailerId).populate('users');
        if (!retailer) {
            return res.status(404).json({ message: 'Retailer not found' });
        }
        res.json({ users: retailer.users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.RetailerPoints = async (req,res)=>{
    try {
        const userId = req.retailer.id;

        // Fetch user from database by userId
        const user = await Retailer.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const last5Entries = user.allEntries
        .slice(-5) // Get first 5 entries (assuming allEntries is sorted appropriately)
        .map(entry => ({
            points: entry.points,
            type: entry.type,
            date: entry.date
        }));

        // Return user points
        res.status(200).json({username:user.name, points: user.totalPoints,pointsRedeemed:user.pointsRedeemed, pointsReceived : user.pointsReceived, last5Entries: last5Entries,couponCodes: user.couponCodes,kycStatus:user.status });
    } catch (error) {
        console.error('Error fetching user points:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.allEntries = async(req,res)=>{
    try{
        const userId = req.retailer.id;

        // Fetch user from database by userId
        const user = await Retailer.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const allEntriesreq = user.allEntries
        .map(entry => ({
            points: entry.points,
            type: entry.type,
            date: entry.date,
            expiryDate: entry.expiryDate,
        }));
        res.status(200).json({allEntries: allEntriesreq});
    }
    catch(error){
        console.error('Error fetching entries:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.retailerKYCrequest = async (req, res) => {
    const retailerId = req.retailer.id; 
    const { aadharNumber, name, currentAddress, city, state, phoneNumber, emailAddress, aadharFront, aadharBack, panCardFront,gst } = req.body;
  
    try {
      const retailer = await Retailer.findById(retailerId).populate('kyc');
      if (!retailer) return res.status(404).send('Retailer not found');
  
      // Create new KYC request
      const kycDetails = new KYC({
        retailer: retailerId,
        status: 'pending',
        aadharNumber,
        aadharFront,
        aadharBack,
        panCardFront,
        address: {
          name,
          currentAddress,
          city,
          state,
          phoneNumber,
          emailAddress
        },
        gst
      });
      const savedKycDetails = await kycDetails.save();
      retailer.kyc = savedKycDetails._id;
      await retailer.save();
  
      res.status(200).send('KYC request submitted successfully');
    } catch (error) {
      console.error('KYC request error:', error.message);
      res.status(500).send(error.message);
    }
  }

module.exports.KYCstatus = async (req, res) => {
  try {
      const retailerId = req.retailer.id;
      const retailer = await Retailer.findById(retailerId);

      if (!retailer) {
          return res.status(404).json({ message: 'Retailer not found' });
      }

      if (retailer.kyc) {
          const existingKyc = await KYC.findById(retailer.kyc);
          if (existingKyc) {
              if (existingKyc.status === 'approved') {
                  retailer.status = 'approved';
                  await retailer.save(); // Save updated status in the retailer document
                  return res.json({ status: 'approved' });
              } else if (existingKyc.status === 'rejected') {
                  retailer.status = 'rejected';
                  await retailer.save(); // Save updated status in the retailer document
                  return res.json({
                      status: 'rejected',
                      comment: existingKyc.comment,
                      details: existingKyc // Include other relevant KYC details if necessary
                  });
              } else {
                  retailer.status = 'pending'; // Optional: Ensure status is set to 'pending'
                  await retailer.save(); // Save updated status in the retailer document
                  return res.json({ status: 'pending' });
              }
          } else {
              return res.status(404).json({ message: 'KYC details not found' });
          }
      } else {
          retailer.status = 'pending';
          await retailer.save(); // Save updated status in the retailer document
          return res.status(200).json({ status: 'pending' });
      }
  } catch (error) {
      console.error('Error fetching KYC status:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
}