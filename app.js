const mongoose = require('mongoose');
const Msg = require('./models/messages');
const Room = require('./models/room');


const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const mongoDB = process.env.MONGO_DB_CONNECTION_STRING;
//const mongoDB = "mongodb+srv://admin:admin@cluster2.wafohpu.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(mongoDB).then(() => {
    console.log('connected');
}).catch(err => console.log(err));

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let rooms = {};
let users = {};

app.use(express.static('public'));
app.get('/:roomName', (req, res) => {
    res.sendFile(__dirname + '/public/chatroom.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


io.on('connection', async (socket) => {
    try {
        const allRooms = await Room.find();
        for (let room of allRooms) {
            rooms[room.name] = [];
        }
        io.emit('roomList', Object.keys(rooms));
    } catch (error) {
        console.error("Error fetching rooms:", error);
    }
    

    socket.on('createRoom', async (roomName) => {
        try {
            const newRoom = new Room({ name: roomName });
            await newRoom.save();

            // Add the room to our rooms object
            rooms[roomName] = [];
            rooms[roomName].push(socket.id);

            socket.join(roomName);
            io.emit('roomList', Object.keys(rooms));
        } catch (error) {
            console.error("Error creating room:", error);
            socket.emit('errorOnRoomCreation', 'There was an error creating the room.');
        }
    });

    socket.on('sendMessageToRoom', async (data) => {
        try {
            const room = await Room.findOne({ name: data.roomName });
            if (!room) {
                throw new Error("Room not found!");
            }
            const timestamp = new Date();
            const messageToSave = new Msg({ msg: data.message, room: room._id, username: data.username, timestamp: timestamp });
            await messageToSave.save();

            room.messages.push(messageToSave);
            await room.save();

            const { roomName, username, message } = data;
           // const timestamp = new Date().toLocaleTimeString();
            const userMessage = { username, message, timestamp };
            io.in(roomName).emit('newMessage', userMessage);
        } catch (error) {
            console.error("Error saving the message:", error);
            socket.emit('errorOnSend', 'There was an error sending your message.');
        }
    });
    
    socket.on('joinRoom', async (roomName) => {
        try {
            const room = await Room.findOne({ name: roomName }).populate('messages');
            if (!room) {
                throw new Error("Room not found!");
            }
    
            if (!rooms[roomName]) { // If room doesn't exist in the rooms object
                rooms[roomName] = [];
            }
    
            rooms[roomName].push(socket.id);
            
            socket.join(roomName);  // Let the client join the room
            socket.emit('joinedRoom', roomName); // Notify the client that they have joined

            const messages = room.messages.map(m => ({ 
                username: m.username, 
                message: m.msg, 
                timestamp: m.timestamp.toISOString() 
            }));
            
            
            socket.emit('initialMessages', messages);  // Send all the messages of that room
        } catch (error) {
            console.error("Error joining the room:", error);
            socket.emit('errorOnJoin', 'There was an error joining the room.');
        }
    });
    

    socket.on('disconnect', () => {
        for (let room in rooms) {
            rooms[room] = rooms[room].filter(id => id !== socket.id);
            if (rooms[room].length === 0) delete rooms[room];
        }
        io.emit('roomList', Object.keys(rooms));
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
