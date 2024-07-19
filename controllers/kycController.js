const KYC = require('../models/kyc-model');
const userKYC = require('../models/user-kyc-model');

module.exports.retailerKYCrequests = async (req, res) => {
    try {
      const kycRequests = await KYC.find(); 
      const requestsData = kycRequests.map(request => ({
        ...request.toObject(),
        aadharBack: request.aadharBack,
        aadharFront: request.aadharFront,
        panCardFront: request.panCardFront,
      }));
  
      res.status(200).send(requestsData);
    } catch (error) {
      console.error('Error fetching KYC requests:', error.message);
      res.status(500).send(error.message);
    }
  }
  
module.exports.userKYCrequests = async (req, res) => {
    try {
      const kycRequests = await userKYC.find(); 
      const requestsData = kycRequests.map(request => ({
        ...request.toObject(),
        aadharBack: request.aadharBack,
        aadharFront: request.aadharFront,
        panCardFront: request.panCardFront,
      }));
  
      res.status(200).send(requestsData);
    } catch (error) {
      console.error('Error fetching KYC requests:', error.message);
      res.status(500).send(error.message);
    }
  }

module.exports.approveRetailerKYC = async (req, res) => {
    const { id } = req.body;
  
    try {
      const kycRequest = await KYC.findById(id);
      if (!kycRequest) return res.status(404).send('KYC request not found');
  
      kycRequest.status = 'approved'; // Update the status to 'approved'
      await kycRequest.save(); // Save the updated request
  
      res.status(200).send('KYC request approved successfully');
    } catch (error) {
      console.error('Error approving KYC request:', error.message);
      res.status(500).send(error.message);
    }
  }

  module.exports.approveUserKYC = async (req, res) => {
    const { id } = req.body;
  
    try {
      const kycRequest = await userKYC.findById(id);
      if (!kycRequest) return res.status(404).send('KYC request not found');
  
      kycRequest.status = 'approved'; // Update the status to 'approved'
      await kycRequest.save(); // Save the updated request
  
      res.status(200).send('KYC request approved successfully');
    } catch (error) {
      console.error('Error approving KYC request:', error.message);
      res.status(500).send(error.message);
    }
  }

  module.exports.rejectRetailerKYC = async (req, res) => {
    const { id, comment } = req.body;

    try {
        // Find the KYC request by id and update its status to 'rejected' along with the comment
        await KYC.findByIdAndUpdate(id, { status: 'rejected', comment });

        res.status(200).json({ message: 'KYC request rejected successfully' });
    } catch (error) {
        console.error('Error rejecting KYC request:', error);
        res.status(500).json({ message: 'Failed to reject KYC request' });
    }
}

module.exports.rejectUserKYC = async (req, res) => {
    const { id, comment } = req.body;

    try {
        // Find the KYC request by id and update its status to 'rejected' along with the comment
        await userKYC.findByIdAndUpdate(id, { status: 'rejected', comment });

        res.status(200).json({ message: 'KYC request rejected successfully' });
    } catch (error) {
        console.error('Error rejecting KYC request:', error);
        res.status(500).json({ message: 'Failed to reject KYC request' });
    }
}