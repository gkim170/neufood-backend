const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../route'); // Adjust path to your Express app
const Allergies = require('../models/Allergies'); // Adjust path to your Pantries model

// Set up mock Allergy for testing
const mockAllergy = {
    allergyId: "99999",
    name: "Unit Test Allergy 1",
    description: "unit test allergy 1 is an allergy that is allergic to unit testing",
};

// Before all tests, connect to the database
beforeAll(async () => {
    const mongoURI = process.env.MONGODB_URI // Use your test database URI
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Before each test, create an allergy with all of these attributes
beforeEach(async () => {
    await Allergies.create(mockAllergy);
});

// Clean up the database after each test - only delete test-created pantries
afterEach(async () => {
    // make sure you delete each variation of allergy created!
    await Allergies.deleteMany({ allergyId: "99999" }); // deletes mock allergy 1 (that was changed names ) allergyId
    await Allergies.deleteMany({ name: "Unit Test" }); // deletes all Unit Test allergies
    
});

// Close the database connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Allergies Routes', () => {

    // Test POST / route with name and description
    it('should create a new allergy', async () => {
        const res = await request(app).post('/allergies/').send({
            name: "Unit Test",
            description: "double down on unit test allergic reactions",
        });
  
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('allergyId');
        expect(res.body).toHaveProperty('name', 'Unit Test');
        expect(res.body).toHaveProperty('description', 'double down on unit test allergic reactions');
    });

    // Test POST / route without description
    it('should yell at us that name and description are required', async () => {
        const res = await request(app).post('/allergies/').send({
            name: "Unit Test",
            description: "",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Name and description are required.');
    });

    // Test GET / route on mock allergy
    it('should get the mock allergy using its allergyId with all of its data', async () => {
        const res = await request(app).get('/allergies/99999');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('allergyId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Allergy 1');
        expect(res.body).toHaveProperty('description', 'unit test allergy 1 is an allergy that is allergic to unit testing');
    });

    // Test GET route on non-existent allergy
    it('should throw an error saying that the allergy does not exist', async () => {
        const res = await request(app).get('/allergies/87123612865632187');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Allergy not found.');
    });

    // Test PUT route to update an allergy based on allergyId
    it('should change the name and description of an allergy', async () => {
        const res = await request(app).put('/allergies/99999').send({
            name: "Unit Test Change",
            description: "ooh we changed the allergy name and description",
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('allergyId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Change');
        expect(res.body).toHaveProperty('description', 'ooh we changed the allergy name and description');
    });

    // Test PUT to only update the name of an allergy based on allergyId
    it('should only change the name of an allergy', async () => {
        const res = await request(app).put('/allergies/99999').send({
            name: "Just Changing Name",
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('allergyId', '99999');
        expect(res.body).toHaveProperty('name', 'Just Changing Name');
        expect(res.body).toHaveProperty('description', 'unit test allergy 1 is an allergy that is allergic to unit testing');
    });

    // Test PUT route to update an allergy that doesn't exist
    it('should not find an allergy', async () => {
        const res = await request(app).put('/allergies/129123123123836').send({
            name: "Super Cool Pantry That Totally Exists",
            description: "yeah it doesn't actually exist",
        });

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Allergy not found.');
    });

    // Test PUT route to try and pass empty bodies to allergies
    it('should require either name or description to update', async () => {
        const res = await request(app).put('/allergies/99999').send({
            name: "",
            description: "",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Name or description is required to update.');
    });

    // Test DELETE route to delete mock allergy
    it('should delete the mock allergy', async () => {
        const res = await request(app).delete('/allergies/99999');

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('message', 'Allergy deleted successfully.');
    });

    // Test DELETE route to try and delete nonexistent allergy
    it('should not find allergy to delete', async () => {
        const res = await request(app).delete('/allergies/1231231231');

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Allergy not found.');
    });
});