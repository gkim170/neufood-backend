const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../route'); // Adjust path to your Express app
const Users = require('../models/Users'); // Adjust path to your model

// Set up mock User for testing
const mockUser = {
    uid: "user123",
    name: "John Doe",
    email: "johndoe@example.com",
    password: "password123",
    badges: [{ "badgeId": "badge001", "dateAchieved": new Date() }],
    allergies: [{ "allergyId": "allergy001" }],
    pantries: [{ "pantryId": "pantry001" }],
    friends: [{ "uid": "friend001" }],
};

// Before all tests, connect to the database
beforeAll(async () => {
    const mongoURI = process.env.MONGODB_URI // Use your test database URI
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Before each test, create an User with all of these attributes
beforeEach(async () => {
    await Users.create(mockUser);
});

// Clean up the database after each test - only delete test-created pantries
afterEach(async () => {
    // make sure you delete each variation of User created!
    await Users.deleteMany({ uid: "user123" }); // deletes mock User 1 (that was changed names ) uid
    await Users.deleteMany({ name: "John Doe" }); // deletes all Unit Test Users
    await Users.deleteMany({ name: "Unit Test" }); // deletes all Unit Test Users
    
});

// Close the database connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Users Routes', () => {
/*
    // Test POST / route with name and description
    it('should create a new User', async () => {
        const res = await request(app).post('/users/signup').send({
            uid: "user456",
            name: "Unit Test",
            email: "thor@test.com",
            password: "thisismypassword",
        });
  
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('uid');
        expect(res.body).toHaveProperty('name', 'Unit Test');
        expect(res.body).toHaveProperty('email', 'thor@test.com');
        expect(res.body).toHaveProperty('password');
    });

    // Test POST / route without email
    it('should yell at us that name and email are required', async () => {
        const res = await request(app).post('/users/signup').send({
            name: "Unit Test",
            password: "thisismypassword",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Missing required fields.');
    });

    // Test GET / route on mock User
    it('should get the mock User using its uid with all of its data', async () => {
        const res = await request(app).get('/users/user123');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('uid', 'user123');
        expect(res.body).toHaveProperty('name', 'John Doe');

            // Test badges array and its properties
        expect(res.body).toHaveProperty('badges');
        expect(res.body.badges.length).toBe(1);
        expect(res.body.badges[0]).toHaveProperty('badgeId', 'badge001');
        expect(res.body.badges[0]).toHaveProperty('dateAchieved');
        
        // Test allergies array and its properties
        expect(res.body).toHaveProperty('allergies');
        expect(res.body.allergies.length).toBe(1);
        expect(res.body.allergies[0]).toHaveProperty('allergyId', 'allergy001');
        
        // Test pantries array and its properties
        expect(res.body).toHaveProperty('pantries');
        expect(res.body.pantries.length).toBe(1);
        expect(res.body.pantries[0]).toHaveProperty('pantryId', 'pantry001');
        
        // Test friends array and its properties
        expect(res.body).toHaveProperty('friends');
        expect(res.body.friends.length).toBe(1);
        expect(res.body.friends[0]).toHaveProperty('uid', 'friend001');
    });

    // Test GET route on non-existent User
    it('should throw an error saying that the User does not exist', async () => {
        const res = await request(app).get('/users/87123612865632187');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'User not found.');
    });

    // Test PUT route to change name based on uid
    it('should change the name of an User', async () => {
        const res = await request(app).put('/users/user123/changeName').send({
            name: "Unit Test",
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('uid', 'user123');
        expect(res.body).toHaveProperty('name', 'Unit Test');
    });

    // Test PUT to only update the email of an User based on uid
    it('should only change the email of an User', async () => {
        const res = await request(app).put('/users/user123/changeEmail').send({
            email: "newEmail@lehigh.edu",
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('uid', 'user123');
        expect(res.body).toHaveProperty('name', 'Unit Test');
        expect(res.body).toHaveProperty('email', 'newEmail@lehigh.edu');
    });

    // Test PUT route to update a password
    it('should change password', async () => {
        const res = await request(app).put('/users/user123/changePassword').send({
            password: "newpassword",
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('uid', 'user123');
        expect(res.body).toHaveProperty('password');
    });

    // Test PUT route to try and pass empty bodies to change passwordUsers
    it('should require a password to update', async () => {
        const res = await request(app).put('/users/user123/changePassword').send({
            name: "",
            password: "",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Name or email is required to update.');
    });

    // Test DELETE route to delete mock User
    it('should delete the mock User', async () => {
        const res = await request(app).delete('/users/user123');

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('message', 'User deleted successfully.');
    });

    // Test DELETE route to try and delete nonexistent User
    it('should not find User to delete', async () => {
        const res = await request(app).delete('/users/1231231231');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'User not found.');
    });*/
});