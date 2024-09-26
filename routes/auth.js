const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/Users'); // Import the Users model
const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// User registration route
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
      uid: `user-${Date.now()}`, // Generate a unique user ID (you can customize this)
      name,
      email,
      password: hashedPassword, // Store the hashed password
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    // Respond with the token
    res.status(201).json({ token, message: 'User registered successfully' });

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
    res.status(200).json({ token, message: 'Login successful' });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
  try {
    const { id, displayName, emails } = req.user;

    // Check if the user already exists
    let user = await Users.findOne({ email: emails[0].value });
    
    if (!user) {
      // Create a new user if they don't exist
      user = new Users({
        uid: id, // Use Google's unique user ID
        name: displayName,
        email: emails[0].value,
        password: '', // No password for Google OAuth users
      });
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    // Redirect with token (or handle it via API response for an SPA)
    res.redirect(`https://your-frontend.com?token=${token}`);
  } catch (error) {
    res.status(500).json({ message: 'Google OAuth failed', error });
  }
});ls


module.exports = router;
