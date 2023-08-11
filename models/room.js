const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // Each room name should be unique
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Msg'  // Refers to the Message schema
    }]
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
