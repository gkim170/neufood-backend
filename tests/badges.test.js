const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../route'); // Adjust path to your Express app
const Badges = require('../models/Badges'); // Adjust path to your model

// Set up mock Badge for testing
const mockBadge = {
    badgeId: "99999",
    name: "Unit Test Badge 1",
    description: "unit test badge 1 is badge for successfully unit testing",
};

// Before all tests, connect to the database
beforeAll(async () => {
    const mongoURI = process.env.MONGODB_URI // Use your test database URI
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Before each test, create an badge with all of these attributes
beforeEach(async () => {
    await Badges.create(mockBadge);
});

// Clean up the database after each test - only delete test-created pantries
afterEach(async () => {
    // make sure you delete each variation of badge created!
    await Badges.deleteMany({ badgeId: "99999" }); // deletes mock badge 1 (that was changed names ) badgeId
    await Badges.deleteMany({ name: "Unit Test" }); // deletes all Unit Test Badges
    
});

// Close the database connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Badges Routes', () => {

    // Test POST / route with name and description
    it('should create a new badge', async () => {
        const res = await request(app).post('/badges/').send({
            name: "Unit Test",
            description: "double down on unit test allergic reactions",
        });
  
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('badgeId');
        expect(res.body).toHaveProperty('name', 'Unit Test');
        expect(res.body).toHaveProperty('description', 'double down on unit test allergic reactions');
    });

    // Test POST / route without description
    it('should yell at us that name and description are required', async () => {
        const res = await request(app).post('/badges/').send({
            name: "Unit Test",
            description: "",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Name and description are required.');
    });

    // Test GET / route on mock badge
    it('should get the mock badge using its badgeId with all of its data', async () => {
        const res = await request(app).get('/badges/99999');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('badgeId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Badge 1');
        expect(res.body).toHaveProperty('description', 'unit test badge 1 is badge for successfully unit testing');
    });

    // Test GET route on non-existent badge
    it('should throw an error saying that the badge does not exist', async () => {
        const res = await request(app).get('/badges/87123612865632187');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Badge not found.');
    });

    // Test PUT route to update an badge based on badgeId
    it('should change the name and description of an badge', async () => {
        const res = await request(app).put('/badges/99999').send({
            name: "Unit Test Change",
            description: "ooh we changed the badge name and description",
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('badgeId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Change');
        expect(res.body).toHaveProperty('description', 'ooh we changed the badge name and description');
    });

    // Test PUT to only update the name of an badge based on badgeId
    it('should only change the name of an badge', async () => {
        const res = await request(app).put('/badges/99999').send({
            name: "Just Changing Name",
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('badgeId', '99999');
        expect(res.body).toHaveProperty('name', 'Just Changing Name');
        expect(res.body).toHaveProperty('description', 'unit test badge 1 is badge for successfully unit testing');
    });

    // Test PUT route to update an badge that doesn't exist
    it('should not find an badge', async () => {
        const res = await request(app).put('/badges/129123123123836').send({
            name: "Super Cool Pantry That Totally Exists",
            description: "yeah it doesn't actually exist",
        });

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Badge not found.');
    });

    // Test PUT route to try and pass empty bodies to Badges
    it('should require either name or description to update', async () => {
        const res = await request(app).put('/badges/99999').send({
            name: "",
            description: "",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Name or description is required to update.');
    });

    // Test DELETE route to delete mock badge
    it('should delete the mock badge', async () => {
        const res = await request(app).delete('/badges/99999');

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('message', 'Badge deleted successfully.');
    });

    // Test DELETE route to try and delete nonexistent badge
    it('should not find badge to delete', async () => {
        const res = await request(app).delete('/badges/1231231231');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Badge not found.');
    });
});