import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    // This allows Node to accept self-signed certs (ONLY if really needed)
    rejectUnauthorized: false,
  },
});

const sendEmail = async (to, subject, htmlContent, attachments) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    html: htmlContent,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Error sending email');
  }
};

export default sendEmail;
