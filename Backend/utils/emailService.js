const nodemailer = require('nodemailer');

/**
 * Create a transporter for sending emails using Gmail
 * @returns {nodemailer.Transporter} - Nodemailer transporter
 */
const createTransporter = () => {
  // Create a transporter object using Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  
  return transporter;
};

/**
 * Send an email with the temporary password to a doctor
 * @param {string} to - Recipient email address
 * @param {string} name - Doctor's name
 * @param {string} tempPassword - Temporary password
 * @returns {Promise<Object>} - Email info
 */
const sendTempPasswordEmail = async (to, name, tempPassword) => {
  try {
    const transporter = createTransporter();
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: to,
      subject: 'Your CryptoPaws Temporary Password',
      text: `Hello ${name},\n\nYou have been registered as a doctor on the CryptoPaws platform. Here is your temporary password: ${tempPassword}\n\nPlease log in and change your password as soon as possible.\n\nBest regards,\nThe CryptoPaws Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #6200ea;">Welcome to CryptoPaws!</h2>
          <p>Hello ${name},</p>
          <p>You have been registered as a doctor on the CryptoPaws platform.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Your temporary password:</p>
            <p style="font-family: monospace; font-size: 18px; background: #e0e0e0; padding: 10px; border-radius: 3px; text-align: center;">${tempPassword}</p>
          </div>
          <p><strong>Please log in and change your password as soon as possible.</strong></p>
          <p>Best regards,<br>The CryptoPaws Team</p>
        </div>
      `,
    });
    
    console.log('Message sent: %s', info.messageId);
    
    return {
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Generic function to send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email text content
 * @param {string} html - Optional HTML content
 * @returns {Promise<Object>} - Email info
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to,
      subject,
      text
    };
    
    if (html) {
      mailOptions.html = html;
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    
    return {
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendTempPasswordEmail,
  sendEmail
};
