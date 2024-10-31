const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// User registration route (traditional)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new Users({
      uid: `user-${Date.now()}`, // Unique user ID
      name,
      email,
      password: hashedPassword, // Store the hashed password
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    // Respond with the token
    res.status(201).json({ token, uid: newUser.uid, message: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Respond with the token
    res.status(200).json({ token, uid: user.uid, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google sign-up/sign-in route
router.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email } = payload;

    let user = await Users.findOne({ email });

    if (!user) {
      // Create a new user if they don't exist
      user = new Users({
        uid: googleId,
        name,
        email,
        password: '', // No password for Google OAuth users
      });
      await user.save();
    }

    const jwtToken = generateToken(user);
    res.status(200).json({ token: jwtToken, uid: user.uid, message: 'Google OAuth successful' });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ message: 'Google sign-in failed', error });
  }
});

module.exports = router;