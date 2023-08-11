const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    msg: {
        type: String,
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',  // Refers to the Room schema
        required: true
    }
});

const Msg = mongoose.model('Msg', msgSchema);
module.exports = Msg;
