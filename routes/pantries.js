const express = require('express');
const router = express.Router();
const Pantries = require('../models/Pantries');
const Users = require("../models/Users");
const Counter = require('../models/Counter');

//Note: Gave an example for the respective route, what we would have to send via the frontend in order to properly hit the route. 

// POST route to create a new pantry
router.post('/', async (req, res) => {
    try {
/*keep in mind when sending info collaborators/ingredients structure is an array of JSON in proper structure. can be null
curl -X POST -H "Content-Type: application/json" -d '{
                "name": "ThorPantry",
                "ownerId": "12345"
}' http://localhost:8080/pantries/
*/
        //extract name and description from request body. Format above. Null if not specified in order to not crash, but name and ownerId are required in future
        // edit: no need to have collaborators or ingredients in the post route, pantries will be made before ingredients are added
        const { name, ownerId } = req.body; 

        //check if provided name and ownerId, need those to continue
        if (!name || !ownerId) {
            return res.status(400).json({error: 'For creating a new pantry, `name` of pantry and `ownerId` fields are required.'});
        }

        //generate unique pantryId
        const pantryId = await generateUniquePantryId();

        // creates new pantry using mongoose Pantries schema, null values allowed but incorrect types are not 
        const pantry = new Pantries({
            pantryId: pantryId,
            name: name,
            ownerId: ownerId,
            imageSource: imageSource,
            collaborators: [], //if null, initialize to empty array **** should always be null on creation / post
            ingredients: [], // same here, should be null regardless on post
        });

        //save pantry to db
        const savedPantry = await pantry.save();

        const uid = ownerId;
        const user = await Users.findOne({ uid });

        if (user) {
            user.pantries.push({ pantryId });
            await user.save();  // Save the user to persist the updated pantries array
        } else {
            return res.status(404).json({ error: 'User not found' });
        }

        // send saved pantry as response and 201 CREATED for POST
        res.status(201).json(savedPantry);
    } catch (error) {
        // oh no!
        console.error(error);
        res.status(500).json({ error: 'Internal server error creating a new pantry' });
    }
});

// GET route to retrieve a pantry by pantryId => 
//      this would be used for all interaction for getting information from pantries.
//      Ex: want to display all ingredients in a pantry? GET by pantryId and sort through JSON response for the ingredients array.
//      "but thor how do we get the pantryIds???" they should be in a nice array in the user route :)
router.get('/:pantryId', async (req, res) => {
    try {
/*
curl -X GET -H "Content-Type: application/json" -d '' http://localhost:8080/pantries/1
*/
        // did you know... req.params comes from /:pantryId, and req.body comes from '' above?
        const { pantryId } = req.params;
        
        //find pantry by pantryId
        const pantry = await Pantries.findOne(
            { pantryId }
        );

        //check if exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //send pantry as JSON object as response and 200 OK for GET
        res.status(200).json(pantry);
    } catch (error) {
        // oh no x9
        console.error(error);
        res.status(500).json({ error: 'Internal server error fetching from pantry' });
    }
});

// PUT route to change the owner of a pantry given the pantry id
router.put('/:pantryId/changeOwner', async (req, res) => {
    try {

        const { pantryId } = req.params;
        const { newOwnerId } = req.body;

        const pantry = await Pantries.findOne({ pantryId });

        // check if exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.' });
        }

        // set the pantry's owner id to the new owner id
        pantry.ownerId = newOwnerId;

        //save updated
        const updatedPantry = await pantry.save();

        // send updated pantry as response and 202 ACCEPTED for PUT
        res.status(202).json(updatedPantry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error changing OwnerId' });
    }
});

// PUT route to change the name of a pantry given the Id
router.put('/:pantryId/changeName', async (req, res) => {
    try {

        const { pantryId } = req.params;
        const { newName } = req.body;

        const pantry = await Pantries.findOne({ pantryId });

        // check if exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.' });
        }

        // set the pantry's name to the new name
        pantry.name = newName;

        // save updated pantry
        const updatedPantry = await pantry.save();

        // send updated pantry as response and 202 ACCEPTED for PUT
        res.status(202).json(updatedPantry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error changing pantry name' });
    }
});


// DELETE route to delete pantry by pantryId
router.delete('/:pantryId', async (req, res) => {
    try {
/*
curl -X DELETE -H "Content-Type: application/json" -d '' http://localhost:8080/pantries/1
*/
        const { pantryId } = req.params;
        
        //find pantry by pantryId and then delete it. Note that this returns an instance of the previously deleted pantry in deletedPantry, so we can do the existance checking below
        const deletedPantry = await Pantries.findOneAndDelete(
            { pantryId }
        );

        //check if exists (as previously mentioned)
        if (!deletedPantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //send deleted pantry as object as response and 202 ACCEPTED for DELETE
        res.status(202).json({ message: 'Pantry deleted successfully.', deletedPantry});
    } catch (error) {
        // default error oh no wow what a surprise
        console.error(error);
        res.status(500).json({ error: 'Internal server error deleting pantry' });
    }
});

// PUT route to add collaborator(s) to a pantry
//      takes in same structure of schema, array of collaborator objects
router.put('/:pantryId/addCollaborators', async (req, res) => {
    try {
/*
curl -X PUT -H "Content-Type: application/json" -d '{
    "collaborators": [{"uid": "1234123"},
                  {"uid": "555555"}]
}' http://localhost:8080/pantries/4/addCollaborators
*/
        const { pantryId } = req.params;
        const { collaborators } = req.body; // dont know why this was originally `const { collaborators } = req.body ? req.body : null;`

        //find pantry by pantryId
        const pantry = await Pantries.findOne(
            { pantryId }
        );

        //check if pantry exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //check if exists
        if (!collaborators) {
            return res.status(404).json({ error: 'For adding collaborators to a pantry, `collaborators` (Array of collaborator objects) field is required.'});
        }

        //append (push) the new array to collaborators array in pantries.
        pantry.collaborators.push(...collaborators);

        //save updated
        const updatedPantry = await pantry.save();

        // send updated pantry as response and 202 ACCEPTED for PUT
        res.status(202).json(updatedPantry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE route to delete collaborator(s) from a pantry
router.delete('/:pantryId/deleteCollaborators', async (req, res) => {
    try {
    /*
    curl -X DELETE -H "Content-Type: application/json" -d '{
        "collaboratorNames": ["1234123", "555555"]
    }' http://localhost:8080/pantries/4/deleteCollaborators
    */
        const { pantryId } = req.params;
        const { collaboratorNames } = req.body ? req.body : null;

        // Check if collaboratorNames is provided and is an array
        if (!collaboratorNames || !Array.isArray(collaboratorNames)) {
            return res.status(400).json({ error: 'For deleting collaborators from a pantry, `collaboratorNames` (Array of strings) field is required.' });
        }

        // Find the pantry by pantryId
        const pantry = await Pantries.findOne({ pantryId });

        // Check if the pantry exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.' });
        }

        // Check if the collaborators exist in the pantry
        const existingCollaborators = pantry.collaborators.filter(collaborator =>
            collaboratorNames.includes(collaborator.uid)
        );

        // If not all collaborators are found, return an error
        if (existingCollaborators.length !== collaboratorNames.length) {
            return res.status(404).json({ error: 'One or more collaborators do not exist in the pantry.' });
        }

        // Proceed to remove the collaborators
        const updatedPantry = await Pantries.findOneAndUpdate(
            { pantryId },
            { $pull: { collaborators: { uid: { $in: collaboratorNames } } } },
            { new: true } // Return the updated pantry
        );

        // Send the updated pantry as the response
        res.status(202).json(updatedPantry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT route to add ingredient(s) to a pantry
//      takes in same structure of schema, array of ingredient objects
router.put('/:pantryId/addIngredients', async (req, res) => {
    try {
/*
curl -X PUT -H "Content-Type: application/json" -d '{
    "ingredients": [{"name": "9999", "category": "Nut", "quantity": 10, "unitPrice": 2.5, "totalPrice": 25, "purchaseDate": "2023-11-22", "expDate": "2025-11-22"},
                  {"name": "Cashew", "category": "Nut", "quantity": 10, "unitPrice": 2.5, "totalPrice": 25, "purchaseDate": "2023-11-22", "expDate": "2025-11-22"}]
}' http://localhost:8080/pantries/4/addIngredients
*/
        const { pantryId } = req.params;
        const { ingredients } = req.body ? req.body : null;

        //find pantry by pantryId
        const pantry = await Pantries.findOne(
            { pantryId }
        );

        //check if exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //check if exists
        if (!ingredients) {
            return res.status(404).json({ error: 'For adding ingredients to a pantry, `ingredients` (Array of ingredient objects) field is required.'});
        }

        //append (push) the new array to ingredients array in pantries.
        pantry.ingredients.push(...ingredients);

        //save updated
        const updatedPantry = await pantry.save();

        // send updated pantry as response and 202 ACCEPTED for PUT
        res.status(202).json(updatedPantry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT route to modify an ingredient within a pantry
// takes in an ingredient object and matches the name to an existing name within the pantry to update the elements
// WILL NOT CHANGE NAME, NEXT ROUTE IS FOR THAT
router.put('/:pantryId/modifyIngredient', async (req, res) => {
    try {

        const { pantryId } = req.params;
        const { modifiedIngredient } = req.body;
        
        // Find the pantry by ID
        const pantry = await Pantries.findOne({ pantryId });

        if (!pantry) {
            return res.status(404).json({ message: "Pantry not found" });
        }

        // Find the index of the ingredient to be modified
        const index = pantry.ingredients.findIndex(item => item.name === modifiedIngredient.name);

        if (index === -1) {
            console.log(modifiedIngredient.name);
            console.log("Modified Ingredient Name:", modifiedIngredient.name);
            console.log("Pantry Ingredient Name:", pantry.ingredients.name);

            return res.status(404).json({ message: "Ingredient not found in the pantry." });
        }

        // Update the ingredient
        pantry.ingredients[index] = {
            name: modifiedIngredient.name,
            category: modifiedIngredient.category,
            quantity: modifiedIngredient.quantity,
            unitPrice: modifiedIngredient.unitPrice,
            totalPrice: modifiedIngredient.totalPrice,
            purchaseDate: modifiedIngredient.purchaseDate,
            expDate: modifiedIngredient.expDate
        };

        //save updated
        const updatedPantry = await pantry.save();

        // send updated pantry as response and 202 ACCEPTED for PUT
        res.status(202).json(updatedPantry);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }

});

// PUT route to modify an ingredient's name within a pantry
// takes in an object with 2 elements, previousName and newName
router.put('/:pantryId/modifyIngredientName', async (req, res) => {
    try {
        const { pantryId } = req.params;
        const { updatedIngredient } = req.body;

        // Find the pantry by pantryId, not _id
        const pantry = await Pantries.findOne({ pantryId: pantryId });

        if (!pantry) {
            return res.status(404).json({ message: "Pantry not found" });
        }

        // Find the index of the ingredient to be modified
        const index = pantry.ingredients.findIndex(
            item => item.name === updatedIngredient.previousName
        );

        if (index === -1) {
            return res.status(404).json({ message: "Ingredient not found in the pantry" });
        }

        // Update the ingredient name
        pantry.ingredients[index].name = updatedIngredient.newName;

        // Save updated pantry
        const updatedPantry = await pantry.save();

        // Send updated pantry as response and 202 ACCEPTED for PUT
        res.status(202).json(updatedPantry);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


// DELETE route to delete ingredient(s) from a pantry
//      takes in array of ingredient names (ex. ingredientNames = ["9999", "Cashew"]; )
router.delete('/:pantryId/deleteIngredients', async (req, res) => {
    try {
/*
curl -X DELETE -H "Content-Type: application/json" -d '{
    "ingredientNames": ["9999", "Cashew"]
}' http://localhost:8080/pantries/4/deleteIngredients
*/
        const { pantryId } = req.params;
        const { ingredientNames } = req.body ? req.body : null;

        //find pantry by pantryId
        const pantry = await Pantries.findOneAndUpdate(
            { pantryId },
            // use $pull to remove elements matching any name in ingredientNames array
            { $pull: { ingredients: {name: { $in: ingredientNames }}}},
            { new: true}
        );

        //check if exists
        if (!pantry) {
            return res.status(404).json({ error: 'Pantry not found.'});
        }

        //check if exists
        if (!ingredientNames) {
            return res.status(404).json({ error: 'For deleting ingredients from a pantry, `ingredientNames` (Array of strings) field is required.'});
        }

        // send updated pantry update params as response and 202 ACCEPTED for DELETE
        res.status(202).json(pantry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to generate a unique pantryId (thanks Mike) ((you're welcome))
async function generateUniquePantryId() {
    try {
        // Find and increment the counter for pantries
        const counter = await Counter.findOneAndUpdate(
            { name: 'pantryIdCounter' },
            { $inc: { countVal: 1 } }, // Increment the counter value by 1
            { new: true, upsert: true } // Return the updated counter, create if not exists
        );
        return counter.countVal.toString(); // Use the value as the unique ID for the pantry object
    } catch (error) {
        console.error('Error generating a unique pantry ID:', error);
        throw error;
    }
}

module.exports = router;