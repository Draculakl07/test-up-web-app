// Import required modules
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Create the Express app and the HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// In-memory data store for messages and user information
let messages = [];
let users = {};

// Serve the static files in the "public" folder
app.use(express.static('public'));

// Handle incoming socket connections
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle incoming messages and associate them with the user
  socket.on('sendMessage', (data) => {
    const { username, message } = data;
    const userMessage = { username, message };
    messages.push(userMessage);
    io.emit('newMessage', userMessage); // Broadcast the new message to all connected users
  });

  // Handle new user connections and store their username
  socket.on('newUser', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('userConnected', username); // Notify other users that a new user has joined
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = users[socket.id];
    console.log('User disconnected:', username);
    if (username) {
      delete users[socket.id];
      socket.broadcast.emit('userDisconnected', username); // Notify other users that a user has left
    }
  });
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
