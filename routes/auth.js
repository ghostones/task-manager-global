const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { validateRegistration } = require('../middleware/validate');
const router = express.Router();

/**
 * User Registration
 */
router.post('/register', validateRegistration, async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed });
  await user.save();
  res.json({ message: 'User registered successfully' });
});

/**
 * User Login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ message: 'Invalid email or password' });
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
  res.json({ token, user: { name: user.name, email: user.email, _id: user._id } });
});

/**
 * Forgot Password
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'No user found with that email.' });

  // Create a reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Set up Nodemailer with your SMTP settings (use real SMTP in prod)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS
    }
  });

  const resetURL = `https://your-frontend-url/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  await transporter.sendMail({
    to: user.email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetURL}">this link</a> to reset your password. Link valid for 1 hour.</p>`
  });

  res.json({ message: 'Password reset link sent. Check your email.' });
});

/**
 * Reset Password
 */
router.post('/reset-password', async (req, res) => {
  const { email, token, password } = req.body;
  const user = await User.findOne({
    email,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password updated successfully!' });
});

module.exports = router;
