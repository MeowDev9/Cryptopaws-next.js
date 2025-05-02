const WelfareOrganization = require('../models/WelfareOrganization');
const nodemailer = require('nodemailer');

// Email sending function
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

// Approve welfare organization
const approveWelfare = async (req, res) => {
  try {
    const welfare = await WelfareOrganization.findById(req.params.id);
    if (!welfare) {
      return res.status(404).json({ message: 'Welfare not found' });
    }

    // Update status to "approved"
    welfare.status = 'approved';
    await welfare.save();

    // Send approval email
    const emailContent = `
      Dear ${welfare.name},
      
      Your account has been approved. You can now log in using the credentials you provided during registration.
      
      Email: ${welfare.email}
      Password: [The password you provided during registration]
      
      Login here: http://localhost:3000/login
      
      Thank you,
      CryptoPaws Team
    `;

    await sendEmail(welfare.email, 'Account Approved', emailContent);

    res.json({ message: 'Welfare approved successfully' });
  } catch (error) {
    console.error('Error approving welfare:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject welfare organization
const rejectWelfare = async (req, res) => {
  try {
    const welfare = await WelfareOrganization.findById(req.params.id);
    if (!welfare) {
      return res.status(404).json({ message: 'Welfare not found' });
    }

    // Update status to "rejected"
    welfare.status = 'rejected';
    await welfare.save();

    // Send rejection email
    const emailContent = `
      Dear ${welfare.name},
      
      We regret to inform you that your account request has been rejected.
      
      If you have any questions, please contact us at support@cryptopaws.com.
      
      Thank you,
      CryptoPaws Team
    `;

    await sendEmail(welfare.email, 'Account Request Rejected', emailContent);

    res.json({ message: 'Welfare rejected successfully' });
  } catch (error) {
    console.error('Error rejecting welfare:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  approveWelfare,
  rejectWelfare,
};