// utils/sendEmail.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports like 587
    auth: {
      user: process.env.EMAIL_USER.replace(/'/g, ''), // Remove any single quotes
      pass: process.env.EMAIL_PASS.replace(/'/g, '')  // Remove any single quotes
    },
    // For development with services like Mailtrap
    tls: {
      rejectUnauthorized: false
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // 3) Actually send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;