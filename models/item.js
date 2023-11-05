const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: String,
    description: String,
    imagePath: String, // Store the image path
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;