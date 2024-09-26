const mongoose = require('mongoose');

const pantriesSchema = new mongoose.Schema({
    
    pantryId: String, // Id of the pantry
    name: String, // name of the pantry
    ownerId: String, // id of the owner to grab the name for the pantry card

    collaborators: [{ // array of collaborators added to the pantry -- just user ID
        uid: String,
    },],

    ingredients: [{
        name: String, // name of ingredient
        category: String, // category of food
        quantity: Number, // number of said ingredients
        unitPrice: Number, // price by unit
        totalPrice: Number, // unit price x quantity
        purchaseDate: Date,
        expDate: Date,
    },],

});

const Pantries = mongoose.model('Pantries', pantriesSchema);

module.exports = Pantries;