const express = require('express');
const router = express.Router();
const Allergies = require('../models/Allergies');
const Counter = require('../models/Counter');

// POST route to create a new allergy
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body; // Extract name and description from request body

        // Check if name and description are provided
        if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required.' });
        }

        // Generate a unique allergyId
        const allergyId = await generateUniqueAllergyId();

        // Create a new allergy object
        const allergy = new Allergies({
            allergyId,
            name,
            description
        });

        // Save the allergy object to the database
        const savedAllergy = await allergy.save();

        // Send the saved allergy object as response and 201 created post
        res.status(201).json(savedAllergy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to generate a unique allergyId
 async function generateUniqueAllergyId() {
    try {
        // Find and increment the counter for allergies
        const counter = await Counter.findOneAndUpdate(
            { name: 'allergyIdCounter' },
            { $inc: { countVal: 1 } }, // Increment the counter value by 1
            { new: true, upsert: true } // Return the updated counter, create if not exists
        );
        return counter.countVal.toString(); // Use the value as the unique ID for the allergy object
    } catch (error) {
        console.error('Error generating a unique allergy ID:', error);
        throw error;
    }
}

// PUT route to update an allergy based on allergyId
router.put('/:allergyId', async (req, res) => {
    try {
        const { allergyId } = req.params;
        const { name, description } = req.body; // Extract name and description from request body

        // Check if name or description are provided
        if (!name && !description) {
            return res.status(400).json({ error: 'Name or description is required to update.' });
        }

        // Find the allergy by allergyId
        const allergy = await Allergies.findOneAndUpdate(
            { allergyId },
            { $set: { name, description } }, // Update name and/or description
            { new: true } // Return the updated document
        );

        // Check if the allergy exists
        if (!allergy) {
            return res.status(404).json({ error: 'Allergy not found.' });
        }

        // Send the updated allergy object as response and 202 ACCEPTED for PUT
        res.status(202).json(allergy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET route to retrieve an allergy based on allergyId
router.get('/:allergyId', async (req, res) => {
    try {
        const { allergyId } = req.params;

        // Find the allergy by allergyId
        const allergy = await Allergies.findOne({ allergyId });

        // Check if the allergy exists
        if (!allergy) {
            return res.status(404).json({ error: 'Allergy not found.' });
        }

        // Send the allergy object as response and 200 OK for GET
        res.status(200).json(allergy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE route to delete an allergy based on allergyId
router.delete('/:allergyId', async (req, res) => {
    try {
        const { allergyId } = req.params;

        // Find and delete the allergy by allergyId
        const deletedAllergy = await Allergies.findOneAndDelete({ allergyId });

        // Check if the allergy exists
        if (!deletedAllergy) {
            return res.status(404).json({ error: 'Allergy not found.' });
        }

        // Send a success message as response and 202 ACCEPTED for DELETE
        res.status(202).json({ message: 'Allergy deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
