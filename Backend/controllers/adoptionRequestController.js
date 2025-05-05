const AdoptionRequest = require('../models/AdoptionRequest');
const Adoption = require('../models/Adoption');
const Message = require('../models/Message');

// Create a new adoption request
exports.createRequest = async (req, res) => {
  try {
    const { adoptionId, donorName, contactNumber, email, reason, preferredContact } = req.body;
    const donorId = req.user.id; // Assumes authentication middleware sets req.user
    const newRequest = new AdoptionRequest({
      adoptionId,
      donorId,
      donorName,
      contactNumber,
      email,
      reason,
      preferredContact,
    });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating adoption request:', error);
    res.status(500).json({ message: 'Error creating adoption request' });
  }
};

// Get all requests for a specific adoption (for welfare)
exports.getRequestsForAdoption = async (req, res) => {
  try {
    const { adoptionId } = req.params;
    const requests = await AdoptionRequest.find({ adoptionId }).populate('donorId', 'name email');
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

// Get all requests by the logged-in donor
exports.getMyRequests = async (req, res) => {
  try {
    const donorId = req.user.id;
    const requests = await AdoptionRequest.find({ donorId }).populate('adoptionId');
    res.json(requests);
  } catch (error) {
    console.error('Error fetching my requests:', error);
    res.status(500).json({ message: 'Error fetching my requests' });
  }
};

// Update request status (e.g., by welfare)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, paymentProof } = req.body;
    const request = await AdoptionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (status) request.status = status;
    if (paymentProof) request.paymentProof = paymentProof;
    request.updatedAt = Date.now();
    await request.save();

    // Fetch adoption details for message
    const adoption = await Adoption.findById(request.adoptionId);
    if (adoption && (status === 'approved' || status === 'rejected')) {
      // Find welfare organization (postedBy)
      let welfareOrgId = null;
      if (adoption.postedByType === 'WelfareOrganization') {
        welfareOrgId = adoption.postedBy;
      }
      if (welfareOrgId) {
        let title, content;
        if (status === 'approved') {
          title = `Adoption Approved: ${adoption.name}`;
          content = `Congratulations! Your adoption request for ${adoption.name} has been approved. 

To complete the adoption process, please make the adoption fee payment of 30 USDT worth of ETH to the following wallet address:
\`${process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS}\`

You can make the payment by going to the "My Requests" section in your dashboard and clicking the "Pay" button next to this approved request.

After making the payment, please wait for the transaction to be verified. Once verified, we will finalize the adoption process.

If you have any questions, please contact us through your preferred contact method.`;
        } else if (status === 'rejected') {
          title = `Adoption Request Not Approved: ${adoption.name}`;
          content = `We regret to inform you that your adoption request for ${adoption.name} was not approved. Thank you for your interest and support.`;
        }
        if (title && content) {
          const message = new Message({
            from: welfareOrgId,
            to: request.donorId,
            title,
            content,
            isRead: false
          });
          await message.save();
        }
      }
    }

    res.json(request);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Error updating request status' });
  }
};

// Get all requests for all adoptions posted by the welfare organization
exports.getWelfareRequests = async (req, res) => {
  try {
    const welfareId = req.user.id;
    // First get all adoptions posted by this welfare
    const adoptions = await Adoption.find({ postedBy: welfareId });
    const adoptionIds = adoptions.map(adoption => adoption._id);
    
    // Then get all requests for these adoptions
    const requests = await AdoptionRequest.find({ 
      adoptionId: { $in: adoptionIds }
    }).populate({
      path: 'adoptionId',
      select: 'name type breed images'
    });
    
    // Transform the data to match the frontend interface
    const transformedRequests = requests.map(request => ({
      _id: request._id,
      adoptionId: request.adoptionId._id,
      adoption: {
        name: request.adoptionId.name,
        type: request.adoptionId.type,
        breed: request.adoptionId.breed,
        images: request.adoptionId.images
      },
      donor: {
        name: request.donorName,
        email: request.email,
        phone: request.contactNumber
      },
      status: request.status,
      reason: request.reason,
      preferredContact: request.preferredContact,
      createdAt: request.createdAt,
      paymentProof: request.paymentProof
    }));
    
    res.json(transformedRequests);
  } catch (error) {
    console.error('Error fetching welfare requests:', error);
    res.status(500).json({ message: 'Error fetching welfare requests' });
  }
}; 