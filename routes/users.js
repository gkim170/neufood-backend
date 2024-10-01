const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const Counter = require('../models/Counter');


/*
* POST route to create a new User
* Takes in a UID, name, email, and password 
* For google sign on, password can be null
* For Neufood-only sign on, uid can be null
*/
// Question: Will this be non-google sign up only? What happens with google sign on?
router.post('/signup', async (req, res) => {
    try {

        const { uid, name, email, password } = req.body; 

        // check if provided information, minus password
        if (!name || !email) {
            return res.status(400).json({error: 'Missing required fields.'});
        }

        if (!uid) {
            generateUniqueUserId();
        }

        // create a new user using the user schema
        const user = new Users({
            uid: uid,
            name: name,
            email: email,
            password: password ? password : null, // password can be null if a google sign on
            badges: [],
            allergies: [],
            pantries: [],
            friends: [],
        });

        //save user to db
        const savedUser = await user.save();

        // send saved user as response
        res.status(201).json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error creating a new user' });
    }
});

// PUT route to modify a user's name based on userId
router.put('/:uid/changeName', async (req, res) => {
    try {
        const { uid } = req.params;
        const { name } = req.body; // Extract name from request body

        // Check if name is provided
        if (!name) {
            return res.status(400).json({ error: 'Name is required to update.' });
        }

        // Find the user by uid
        const user = await Users.findOneAndUpdate(
            { uid },
            { $set: { name } }, // Update name
            { new: true } // Return the updated document
        );

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Send the updated user object as response
        res.status(202).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT route to modify a user's email based on userId
router.put('/:uid/changeEmail', async (req, res) => {
    try {
        const { uid } = req.params;
        const { email } = req.body; // Extract name from request body

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ error: 'Email is required to update.' });
        }

        // Find the user by uid
        const user = await Users.findOneAndUpdate(
            { uid },
            { $set: { email } }, // Update email
            { new: true } // Return the updated document
        );

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Send the updated user object as response
        res.status(202).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT route to modify a user's password based on userId
router.put('/:uid/changePassword', async (req, res) => {
    try {
        const { uid } = req.params;
        const { password } = req.body; // Extract password from request body

        // Check if password is provided
        if (!password) {
            return res.status(400).json({ error: 'Password is required to update.' });
        }

        // Find the user by uid
        const user = await Users.findOneAndUpdate(
            { uid },
            { $set: { password } }, // Update password
            { new: true } // Return the updated document
        );

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Send the updated user object as response
        res.status(202).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET route to retrieve a user object based on userId
router.get('/:uid', async (req, res) => {
    try {
        
        const { uid } = req.params;
        
        //find pantry by pantryId
        const user = await Users.findOne(
            { uid }
        );

        //check if user exists
        if (!uid) {
            return res.status(404).json({ error: 'User not found.'});
        }

        //send user as JSON object as response
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error fetching from pantry' });
    }
});

// DELETE route to delete a user given their userId
router.delete('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        // Find and delete the user by uid
        const user = await Users.findOneAndDelete({ uid });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Send a success message as response
        res.status(202).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT route to add a badge or multiple badges to the badge array
router.put('/:uid/addBadge', async (req, res) => {
    try {

        const { uid } = req.params;
        const { badges } = req.body;

        //find user by uid
        const user = await Pantries.findOne(
            { uid }
        );

        //check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found.'});
        }

        //check if the badge parameter has any value
        if (!badges) {
            return res.status(404).json({ error: 'Badge field must not be empty.'});
        }

        //append the badge object(s) to the badge array
        user.badges.push(...badges);

        // save the updated user profile
        const updatedUser = await user.save();

        // send updated user as response
        res.status(202).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE route to dete a badge or badges
router.delete('/:uid/deleteBadge', async (req, res) => {
    try {

        const { uid } = req.params;
        const { badges } = req.body ? req.body : null;

        // find user by uid
        const user = await Users.updateOne(
            { uid },
            // use $pull to remove elements matching any name in badges array
            { $pull: { badges: { badgeId: { $in: badges }}}}, // may be incorrect because of dual element, must test
            { new: true}
        );

        //check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found.'});
        }

        //check if exists
        if (!badges) {
            return res.status(404).json({ error: 'Badges field is required.'});
        }

        // send updated user update params as response
        res.status(202).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to generate a unique userId 
async function generateUniqueUserId() {
    try {
        // Find and increment the counter for users
        const counter = await Counter.findOneAndUpdate(
            { name: 'UserIdCounter' },
            { $inc: { countVal: 1 } }, // Increment the counter value by 1
            { new: true, upsert: true } // Return the updated counter, create if not exists
        );
        return counter.countVal.toString(); // Use the value as the unique ID for the user object
    } catch (error) {
        console.error('Error generating a unique user ID:', error);
        throw error;
    }
}

module.exports = router;