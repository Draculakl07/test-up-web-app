const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let messages = [];
let users = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('sendMessage', (data) => {
    const { username, message } = data;
    if (!username || !message) {
        return;  // If there's no username or message, don't process.
    }
    const timestamp = new Date().toLocaleTimeString();  
    const userMessage = { username, message, timestamp };  
    messages.push(userMessage);
    io.emit('newMessage', userMessage);
});



  socket.on('newUser', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('userConnected', username);
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    console.log('User disconnected:', username);
    if (username) {
      delete users[socket.id];
      socket.broadcast.emit('userDisconnected', username);
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
