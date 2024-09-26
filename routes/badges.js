const express = require('express');
const router = express.Router();
const Badges = require('../models/Badges');
const Counter = require('../models/Counter');

// POST route to create a new badge
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body; // Extract name and description from request body

        // Check if name and description are provided
        if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required.' });
        }

        // Generate a unique badgeId
        const badgeId = await generateUniqueBadgeId();

        // Create a new badge object
        const badge = new Badges({
            badgeId,
            name,
            description
        });

        // Save the badge object to the database
        const savedBadge = await badge.save();

        // Send the saved badge object as response
        res.status(201).json(savedBadge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to generate a unique badgeId
 async function generateUniqueBadgeId() {
    try {
        // Find and increment the counter for badges
        const counter = await Counter.findOneAndUpdate(
            { name: 'badgeIdCounter' },
            { $inc: { countVal: 1 } }, // Increment the counter value by 1
            { new: true, upsert: true } // Return the updated counter, create if not exists
        );
        return counter.countVal.toString(); // Use the value as the unique ID for the badge object
    } catch (error) {
        console.error('Error generating a unique badge ID:', error);
        throw error;
    }
}

// PUT route to update a badge based on badgeId
router.put('/:badgeId', async (req, res) => {
    try {
        const { badgeId } = req.params;
        const { name, description } = req.body; // Extract name and description from request body

        // Check if name or description are provided
        if (!name && !description) {
            return res.status(400).json({ error: 'Name or description is required to update.' });
        }

        // Find the badge by badgeId
        const badge = await Badges.findOneAndUpdate(
            { badgeId },
            { $set: { name, description } }, // Update name and/or description
            { new: true } // Return the updated document
        );

        // Check if the badge exists
        if (!badge) {
            return res.status(404).json({ error: 'Badge not found.' });
        }

        // Send the updated badge object as response
        res.json(badge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET route to retrieve a badge based on badgeId
router.get('/:badgeId', async (req, res) => {
    try {
        const { badgeId } = req.params;

        // Find the badge by badgeId
        const badge = await Badges.findOne({ badgeId });

        // Check if the badge exists
        if (!badge) {
            return res.status(404).json({ error: 'Badge not found.' });
        }

        // Send the badge object as response
        res.json(badge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE route to delete a badge based on badgeId
router.delete('/:badgeId', async (req, res) => {
    try {
        const { badgeId } = req.params;

        // Find and delete the badge by badgeId
        const deletedBadge = await Badges.findOneAndDelete({ badgeId });

        // Check if the badge exists
        if (!deletedBadge) {
            return res.status(404).json({ error: 'Badge not found.' });
        }

        // Send a success message as response
        res.json({ message: 'Badge deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
