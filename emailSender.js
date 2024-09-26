const nodemailer = require("nodemailer");
require("dotenv").config();

// Define your nodemailer transporter (configure as needed)
const transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send verification email
const sendVerificationEmail = (email, callback) => {
  const verificationLink = `http://localhost:3010/registration/verify?email=${encodeURIComponent(
    email
  )}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Please verify your email address",
    // text: `Thank you for signing up! Please verify your email address by clicking the link below: ${verificationLink}`,
    html: `<div>
      <p style="font-size: 16px; font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        Thank you for signing up! Please verify your email address by clicking the link below:
      </p>
      <p>
        <a href="${verificationLink}" style="font-size: 16px; font-family: Arial, sans-serif; color: #00BFFF; text-decoration: none; font-weight: bold;">
          Verify your email
        </a>
      </p>
      <p style="font-size: 14px; font-family: Arial, sans-serif; color: #555; margin-top: 20px;">
        If you can't find the email, please check your spam or junk folder.
      </p>
    </div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending verification email:", error);
      return callback(error, null);
    }
    console.log("Verification email sent:", info.response);
    return callback(null, info);
  });
};

module.exports = {
  sendVerificationEmail,
};
