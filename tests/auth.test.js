const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../route'); // Adjust path to your Express app
const Users = require('../models/Users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Mock environment variables for JWT
process.env.JWT_SECRET = 'testsecret';

// Set up mock User for testing
const mockUser = {
  uid: `user-${Date.now()}`,  // Ensure a unique UID by using a timestamp
  name: "John Doe",
  email: "johndoe@example.com",
  password: bcrypt.hashSync("password123", 10), // Hash the password for testing
};

// Before all tests, connect to the database
beforeAll(async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/testdb';
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Before each test, create a mock user
beforeEach(async () => {
  await Users.deleteMany({});
  await Users.create(mockUser);
});

// Clean up the database after each test
afterEach(async () => {
  await Users.deleteMany({});
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Routes', () => {

  // Test user registration
  it('should register a new user', async () => {
    const res = await request(app).post('/auth/register').send({
      name: "Jane Doe",
      email: "janedoe@example.com",
      password: "password456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body).toHaveProperty('token');
  });

  // Test registration with an existing user
  it('should not register an existing user', async () => {
    const res = await request(app).post('/auth/register').send({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  // Test user login
  it('should log in an existing user', async () => {
    const res = await request(app).post('/auth/login').send({
      email: "johndoe@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
  });

  // Test Google OAuth callback with a new user
  it('should handle Google OAuth and register a new user', async () => {
    const res = await request(app).get('/auth/google/callback');

    expect(res.statusCode).toBe(302);
    //expect(res.header['location']).toContain('token='); // Check that token is in the redirect URL
  });
});
