const mongoose = require('mongoose');

const allergiesSchema = new mongoose.Schema({
    
    allergyId: String, // id of the allergy, linked to the user profile
    name: String, // name of allergy
    description: String // description of allergy

});

const Allergies = mongoose.model('Allergies', allergiesSchema);

module.exports = Allergies;