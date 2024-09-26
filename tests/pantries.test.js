const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../route'); // Adjust path to your Express app
const Pantries = require('../models/Pantries'); // Adjust path to your Pantries model

// Set up mock pantry for testing
const mockPantry = {
    pantryId: "99999",
    name: "Unit Test Pantry 1",
    ownerId: "12321",
    collaborators: [{ uid: "3" }, { uid: "4" }],
    ingredients: [
        {
        name: "Hot Dog Bun",
        category: "Bread",
        quantity: 2,
        unitPrice: 1.5,
        totalPrice: 3.0,
        purchaseDate: new Date(),
        expDate: new Date(),
        },
    ],
};


// Before all tests, connect to the database
beforeAll(async () => {
    const mongoURI = process.env.MONGODB_URI // Use your test database URI
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
});

// Before each test, create a pantry with all of these attributes
beforeEach(async () => {
    await Pantries.create(mockPantry);
});

// Clean up the database after each test - only delete test-created pantries
afterEach(async () => {
    // make sure you delete each variation of pantry created!
    await Pantries.deleteMany({ ownerId: "12322" }); // deletes the mock pantry after the ownerId change test
    await Pantries.deleteMany({ ownerId: "12321" }); // deletes the mock pantry as long as ownerId doesnt change
});

// Close the database connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});


describe('Pantries Routes', () => {

    // Test POST / route with no collaboraters or ingredients
    it('should create a new pantry with no collaboraters or ingredients', async () => {
        const res = await request(app).post('/pantries/').send({
            name: "Unit Test Pantry 2",
            ownerId: "12321",
        });
  
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('name', 'Unit Test Pantry 2');
        expect(res.body).toHaveProperty('ownerId', '12321');
        expect(res.body).toHaveProperty('collaborators', []);
        expect(res.body).toHaveProperty('ingredients', []);
    });

    // Test GET / route on mock pantry
    it('should get the mock pantry using its pantryID with all of its data', async () => {
        const res = await request(app).get('/pantries/99999');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('pantryId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Pantry 1');
        expect(res.body).toHaveProperty('ownerId', '12321');
        
        
        // Check that the collaborators array contains the expected object
        expect(res.body.collaborators).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ uid: "3" }),
                expect.objectContaining({ uid: "4" })
            ])
        );

        // Check that the ingredients array contains the expected object
        expect(res.body.ingredients).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Hot Dog Bun",
                    category: "Bread",
                    quantity: 2,
                    unitPrice: 1.5,
                    totalPrice: 3.0,
                }),
            ])
        );
    });

    // Test PUT route to change owner ID of pantry given pantry ID
    it('should change the owner ID', async () => {
        const res = await request(app).put('/pantries/99999/changeOwner').send({
            newOwnerId: "12322"
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('pantryId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Pantry 1');
        expect(res.body).toHaveProperty('ownerId', '12322');
        
        
        // Check that the collaborators array contains the expected object
        expect(res.body.collaborators).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ uid: "3" }),
                expect.objectContaining({ uid: "4" })
            ])
        );

        // Check that the ingredients array contains the expected object
        expect(res.body.ingredients).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Hot Dog Bun",
                    category: "Bread",
                    quantity: 2,
                    unitPrice: 1.5,
                    totalPrice: 3.0,
                }),
            ])
        );
    });

    // Test PUT route to change name of pantry given the pantry ID
    it('should change the pantry name', async () => {
        const res = await request(app).put('/pantries/99999/changeName').send({
            newName: "Mike's Pantry"
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('pantryId', '99999');
        expect(res.body).toHaveProperty('name', 'Mike\'s Pantry');
        expect(res.body).toHaveProperty('ownerId', '12321');
        
        
        // Check that the collaborators array contains the expected object
        expect(res.body.collaborators).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ uid: "3" }),
                expect.objectContaining({ uid: "4" })
            ])
        );

        // Check that the ingredients array contains the expected object
        expect(res.body.ingredients).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Hot Dog Bun",
                    category: "Bread",
                    quantity: 2,
                    unitPrice: 1.5,
                    totalPrice: 3.0,
                }),
            ])
        );
    });

    // Test DELETE / route on mock pantry
    it('should delete the mock pantry using its pantryID', async () => {
        const res = await request(app).delete('/pantries/99999');

        expect(res.statusCode).toBe(202);
    });

    // Test PUT / route on mock pantry to add collaborators
    it('should add collaborators to the pantry', async () => {
        const res = await request(app).put('/pantries/99999/addCollaborators').send({
            collaborators: [{ uid: "10" }, { uid: "737" }]
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('pantryId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Pantry 1');
        expect(res.body).toHaveProperty('ownerId', '12321');
        
        
        // Check that the collaborators array contains the expected object
        expect(res.body.collaborators).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ uid: "3" }),
                expect.objectContaining({ uid: "4" }),
                expect.objectContaining({ uid: "10" }),
                expect.objectContaining({ uid: "737" })
            ])
        );

        // Check that the ingredients array contains the expected object
        expect(res.body.ingredients).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Hot Dog Bun",
                    category: "Bread",
                    quantity: 2,
                    unitPrice: 1.5,
                    totalPrice: 3.0,
                }),
            ])
        );
    });

    // Test DELETE / route on mock pantry to remove collaborators
    it('should remove collaborators from the pantry', async () => {
        const res = await request(app).delete('/pantries/99999/deleteCollaborators').send({
            collaboratorNames: ["3"]
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('pantryId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Pantry 1');
        expect(res.body).toHaveProperty('ownerId', '12321');
        
        
        // Check that the collaborators array contains the expected object
        expect(res.body.collaborators).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ uid: "4" })
            ])
        );

        // Check that the ingredients array contains the expected object
        expect(res.body.ingredients).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Hot Dog Bun",
                    category: "Bread",
                    quantity: 2,
                    unitPrice: 1.5,
                    totalPrice: 3.0,
                }),
            ])
        );
    });

    // Test PUT / route on mock pantry to add ingredients
    it ('should add the given ingredients to a pantry using pantryId', async () => {
        const res = await request(app).put('/pantries/99999/addIngredients').send({
            ingredients: [
                { "name": "Donut", "category": "Baked Goods", "quantity": 2, "unitPrice": 2.5, "totalPrice": 5, "purchaseDate": "2024-09-11T00:00:00.000Z", "expDate": "2024-10-11T00:00:00.000Z" },
                { "name": "Chicken Tenders", "category": "Frozen Dinners", "quantity": 3, "unitPrice": 4, "totalPrice": 12, "purchaseDate": "2024-10-12T00:00:00.000Z", "expDate": "2024-11-12T00:00:00.000Z" }
            ]
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('pantryId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Pantry 1');
        expect(res.body).toHaveProperty('ownerId', '12321');
        
        
        // Check that the collaborators array contains the expected object
        expect(res.body.collaborators).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ uid: "3" }),
                expect.objectContaining({ uid: "4" })
            ])
        );

        // Check that the ingredients array contains the expected object
        expect(res.body.ingredients).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Hot Dog Bun",
                    category: "Bread",
                    quantity: 2,
                    unitPrice: 1.5,
                    totalPrice: 3.0,
                }),
                expect.objectContaining({
                    name: "Donut",
                    category: "Baked Goods",
                    quantity: 2,
                    unitPrice: 2.5,
                    totalPrice: 5.0,
                    purchaseDate: "2024-09-11T00:00:00.000Z",
                    expDate: "2024-10-11T00:00:00.000Z",
                }),
                expect.objectContaining({
                    name: "Chicken Tenders",
                    category: "Frozen Dinners",
                    quantity: 3,
                    unitPrice: 4,
                    totalPrice: 12,
                    purchaseDate: "2024-10-12T00:00:00.000Z",
                    expDate: "2024-11-12T00:00:00.000Z",
                })
            ])
        );
    });

    // Test PUT / route on mock pantry to modify ingredients
    it ('should modify the given ingredient using pantryId and ingredient name, and can/will not change ingredient name', async () => {
        const res = await request(app).put('/pantries/99999/modifyIngredient').send({
            modifiedIngredient: { 
                "name": "Hot Dog Bun", 
                "category": "Bread", 
                "quantity": 1, 
                "unitPrice": 2.5, 
                "totalPrice": 2.5, 
                "purchaseDate": "2024-09-11T00:00:00.000Z", 
                "expDate": "2024-10-11T00:00:00.000Z" 
            }
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('pantryId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Pantry 1');
        expect(res.body).toHaveProperty('ownerId', '12321');
        
        
        // Check that the collaborators array contains the expected object
        expect(res.body.collaborators).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ uid: "3" }),
                expect.objectContaining({ uid: "4" })
            ])
        );

        // Check that the ingredients array contains the expected object
        expect(res.body.ingredients).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Hot Dog Bun",
                    category: "Bread",
                    quantity: 1,
                    unitPrice: 2.5,
                    totalPrice: 2.5,
                    purchaseDate: "2024-09-11T00:00:00.000Z",
                    expDate: "2024-10-11T00:00:00.000Z",
                })
            ])
        );
    });

    // Test PUT / route on mock pantry to modify ingredient name based on ingredient name
    it ('should modify the name of the given ingredient using pantryId and ingredient name', async () => {
        const res = await request(app).put('/pantries/99999/modifyIngredientName').send({
            updatedIngredient: { previousName: "Hot Dog Bun", newName: "Hot Dog Roll" }
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('pantryId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Pantry 1');
        expect(res.body).toHaveProperty('ownerId', '12321');
        
        
        // Check that the collaborators array contains the expected object
        expect(res.body.collaborators).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ uid: "3" }),
                expect.objectContaining({ uid: "4" })
            ])
        );

        // Check that the ingredients array contains the expected object
        expect(res.body.ingredients).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Hot Dog Roll",
                    category: "Bread",
                    quantity: 2,
                    unitPrice: 1.5,
                    totalPrice: 3.0,
                }),
            ])
        );
    });

    // Test DELETE / route on mock pantry to delete an ingredient using ingredient name and pantryId
    it ('should delete the given ingredient based on name and pantryId', async () => {
        const res = await request(app).delete('/pantries/99999/deleteIngredients').send({
            ingredientNames: [ "Hot Dog Bun" ]
        });

        expect(res.statusCode).toBe(202);
        expect(res.body).toHaveProperty('pantryId', '99999');
        expect(res.body).toHaveProperty('name', 'Unit Test Pantry 1');
        expect(res.body).toHaveProperty('ownerId', '12321');
        
        
        // Check that the collaborators array contains the expected object
        expect(res.body.collaborators).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ uid: "3" }),
                expect.objectContaining({ uid: "4" })
            ])
        );
    });

});