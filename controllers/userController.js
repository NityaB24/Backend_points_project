const User = require('../models/user-model');
const UserRedemptionRequest = require('../models/user-redeem-model');
const KYC = require('../models/user-kyc-model');
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
        const last5Entries = user.allEntries
        .slice(-5) // Get first 5 entries (assuming allEntries is sorted appropriately)
        .map(entry => ({
            points: entry.points,
            type: entry.type,
            date: entry.date
        }));
        const pointsToBeRedeemedSum = user.points_to_be_Redeemed
            // .reduce((total, entry) => total + entry.points, 0);

        // Return user points
        res.status(200).json({name:user.name, points: user.points,pointsRedeemed:user.pointsRedeemed, pointsReceived : user.pointsReceived, last5Entries: last5Entries, couponCodes: user.couponCodes,kycStatus:user.status, points_to_be_Redeemed : pointsToBeRedeemedSum });
    } catch (error) {
        console.error('Error fetching user points:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports.userrequestRedemption = async (req, res) => {
    try {
        const { points, method, holderName, ifscCode, accountNumber, upiNumber  } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
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
                user.allEntries.push({ points: pointsToDeduct, type: 'redeemed', date: now });

                // Only keep entry if it still has points left
                if (entry.points > 0) {
                    updatedPointsHistory.push(entry);
                }
            } else {
                updatedPointsHistory.push(entry);
            }
        }

        user.pointsHistory = updatedPointsHistory;

        await user.save();

        const userredemptionRequest = new UserRedemptionRequest({
            userId,
            points,
            method,
            holderName,
            ifscCode,
            accountNumber,
            upiNumber,
            status: 'pending'
        });

        const result = await userredemptionRequest.save();
        res.status(200).send(result);
    } catch (error) {
        console.error('Error processing redemption request:', error);
        res.status(500).send({ message: 'An error occurred while processing your request.', error });
    }
};

module.exports.allEntries = async(req,res)=>{
    try{
        const userId = req.user.id;

        // Fetch user from database by userId
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const allEntriesreq = user.pointsHistory
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

module.exports.userKYCrequest = async (req, res) => {
    const userId = req.user.id; // Assuming retailerId is extracted from token
    const { aadharNumber, name, currentAddress, city, state, phoneNumber, emailAddress, aadharFront, aadharBack, panCardFront } = req.body;
  
    try {
      const user = await User.findById(userId).populate('kyc');
      if (!user) return res.status(404).send('Retailer not found');
  
      // Check existing KYC status
  
      // Create new KYC request
      const kycDetails = new KYC({
        user: userId,
        status: 'pending',
        aadharNumber,
        aadharFront, // URLs of the uploaded images
        aadharBack,
        panCardFront,
        address: {
          name,
          currentAddress,
          city,
          state,
          phoneNumber,
          emailAddress
        }
      });
      const savedKycDetails = await kycDetails.save();
      user.kyc = savedKycDetails._id;
      await user.save();
  
      res.status(200).send('KYC request submitted successfully');
    } catch (error) {
      console.error('KYC request error:', error.message);
      res.status(500).send(error.message);
    }
  }

module.exports.KYCstatus = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'Retailer not found' });
      }
  
      if (user.kyc) {
        const existingKyc = await KYC.findById(user.kyc._id);
        if (existingKyc) {
          if (existingKyc.status === 'approved') {
            user.status = 'approved';
            await user.save();
            return res.json({ status: 'approved' });
          } else if (existingKyc.status === 'rejected') {
            user.status = 'rejected';
            await user.save();
            return res.json({
              status: 'rejected',
              comment: existingKyc.comment,
              details: existingKyc // Include other relevant KYC details if necessary
            });
          } else {
            user.status = 'pending';
            await user.save();
            return res.json({ status: 'pending' });
          }
        } else {
          return res.status(404).json({ message: 'KYC details not found' });
        }
      } else {
        user.status = 'pending';
        await user.save();
        return res.status(200).json({ status: 'pending' });
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

module.exports.getProfileDetails = async (req, res) => {
  try {
    const userId = req.user.id; // Assume userId is extracted from token
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).send('User not found');
    }
    let profilePhoto = user.profilePhoto;
    res.status(200).send({
      ...user.toObject(),
      profilePhoto,
    });
  } catch (error) {
    console.error('Backend error:', error.message, error.stack);
    res.status(500).send(error.message);
  }
}

module.exports.updateProfileDetails = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming userId is extracted from token
    const { name, email,phone, profilePhoto } = req.body; // Expect profilePhoto as a base64 string

    const formattedPhone = phone.startsWith('+91-') ? phone : `+91-${phone}`;
    const updates = { name, email ,profilePhoto,phone:formattedPhone};


    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) return res.status(404).send('User not found');

    await user.save();

    res.status(200).send('User profile updated successfully');
  } catch (error) {
    console.error('Update error:', error.message);
    res.status(500).send(error.message);
  }
}