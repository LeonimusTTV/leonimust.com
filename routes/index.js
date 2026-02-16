import express from 'express';
import axios from 'axios';
import nodemailer from 'nodemailer';

const router = express.Router();

const subdomains = ["https://supercold.leonimust.com", "https://doom.leonimust.com", "https://earthwalker.leonimust.com"];

router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/projects', function (req, res, next) {
  res.render('projects');
});

const checkSubdomain = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    return { url, status: response.status, statusText: 'Up' };
  } catch (error) {
    if (error.response) {
      return { url, status: error.response.status, statusText: 'Down' };
    } else {
      return { url, status: 'No response', statusText: 'Down' };
    }
  }
};

router.get('/games', async function (req, res, next) {
  const results = await Promise.all(subdomains.map(checkSubdomain));
  res.render('games', { results });
});

// Legal pages for Subscriptions Management app
router.get('/legal/subscriptions-management/copyright', function (req, res, next) {
  res.render('legal/subscriptions-management/copyright');
});

router.get('/legal/subscriptions-management/licensing', function (req, res, next) {
  res.render('legal/subscriptions-management/licensing');
});

router.get('/legal/subscriptions-management/privacy', function (req, res, next) {
  res.render('legal/subscriptions-management/privacy');
});

// Legal pages for Package Tracking app
router.get('/legal/package-tracking/copyright', function (req, res, next) {
  res.render('legal/package-tracking/copyright');
});

router.get('/legal/package-tracking/licensing', function (req, res, next) {
  res.render('legal/package-tracking/licensing');
});

router.get('/legal/package-tracking/privacy', function (req, res, next) {
  res.render('legal/package-tracking/privacy');
});

// Legal pages for Delay Your Purchases app
router.get('/legal/delay-your-purchases/copyright', function (req, res, next) {
  res.render('legal/delay-your-purchases/copyright');
});

router.get('/legal/delay-your-purchases/licensing', function (req, res, next) {
  res.render('legal/delay-your-purchases/licensing');
});

router.get('/legal/delay-your-purchases/privacy', function (req, res, next) {
  res.render('legal/delay-your-purchases/privacy');
});

router.post('/contact/send', async function (req, res) {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  try {
    // Create a transporter using Proton Mail SMTP with app-specific password (token)
    let transporter = nodemailer.createTransport({
      host: 'smtp.protonmail.ch',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'leo@leonimust.com',
        pass: process.env.EMAIL_TOKEN || 'your-app-specific-password'
      },
      tls: {
        rejectUnauthorized: true
      }
    });

    // Email content
    let mailOptions = {
      from: `"Contact Form" <leo@leonimust.com>`,
      to: 'leo@leonimust.com',
      subject: `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h3>New Message from Contact Form</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
});

export default router;
