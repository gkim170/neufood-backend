const mongoose = require('mongoose');

const badgesSchema = new mongoose.Schema({
    
    badgeId: String, // id of the badge, linked to the user profile
    name: String, // name of badge
    description: String // description of badge

});

const Badges = mongoose.model('Badges', badgesSchema);

module.exports = Badges;