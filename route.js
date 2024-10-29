const express = require("express");
const mongoose = require("mongoose");
const app = express();
const allergiesRoutes = require("./routes/allergies");
const badgesRoutes = require("./routes/badges");
const pantriesRoutes = require("./routes/pantries");
const dotenv = require('dotenv');
const authRoutes = require("./routes/auth"); // Authentication routes
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Users = require('./models/Users');
dotenv.config();

// Check if MongoDB URI is provided
if (!process.env.MONGODB_URI) {
  console.error('MongoDB URI not found. Please set it in the environment.');
  process.exit(1);
}

// Connect to MongoDB using Mongoose
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('MongoDB connection error.');
  process.exit();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Initialize Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if the user already exists in your database
    let user = await Users.findOne({ email: profile.emails[0].value });

    if (!user) {
      // Create a new user if they don't exist
      user = new Users({
        uid: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        password: '', // No password for Google OAuth users
      });
      await user.save();
    }

    done(null, user);
  } catch (error) {
    done(error, false);
  }
}));

// Initialize Passport for OAuth
app.use(passport.initialize());

// Mount routes
app.use("/allergies", allergiesRoutes);
app.use("/badges", badgesRoutes);
app.use("/pantries", pantriesRoutes);
app.use("/auth", authRoutes);

module.exports = app;