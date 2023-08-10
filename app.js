const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let rooms = {};
let users = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    socket.on('createRoom', (roomName) => {
        if (!rooms[roomName]) {
            rooms[roomName] = [];
        }
        rooms[roomName].push(socket.id);
        socket.join(roomName);
        io.emit('roomList', Object.keys(rooms));
    });

    socket.on('joinRoom', (roomName) => {
        if (rooms[roomName]) {
            rooms[roomName].push(socket.id);
            socket.join(roomName);
            socket.emit('joinedRoom', roomName);
        }
    });

    socket.on('sendMessageToRoom', (data) => {
      const { roomName, username, message } = data;
      const timestamp = new Date().toLocaleTimeString();
      const userMessage = { username, message, timestamp };
      io.in(roomName).emit('newMessage', userMessage);  // Sending message to all users in the room, including sender
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
