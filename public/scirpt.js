// Function to prompt the user for a username and store it in localStorage
function setUserName() {
    let username = localStorage.getItem('username');
    if (!username) {
      username = prompt('Please enter your username:');
      if (!username || username.trim() === '') {
        return setUserName();
      }
      localStorage.setItem('username', username);
    }
    return username;
  }
  
  // Dynamically construct the socket URL based on the current webpage's host
  const socketUrl = window.location.host.startsWith('localhost')
    ? 'http://localhost:3000'
    : `https://${window.location.host}`;
  
  // Establish a socket connection with the server
  const socket = io(socketUrl);
  
  // Get the username from localStorage or prompt the user to set it
  const username = setUserName();
  socket.emit('newUser', username);
  
  // Function to display a new message in the container
  function displayMessage(message) {
    const messageContainer = document.getElementById('message-container');
    const newMessageElement = document.createElement('div');
    newMessageElement.innerText = message;
    messageContainer.appendChild(newMessageElement);
  }
  
  // Event listener for the "Send" button
  document.getElementById('send-button').addEventListener('click', () => {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
  
    if (message) {
      socket.emit('sendMessage', { username, message });
      messageInput.value = '';
    }
  });
  
  // Event listener for the "Enter" key in the message input field
  document.getElementById('message-input').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      document.getElementById('send-button').click();
    }
  });
  
  // Receive and display new messages from the server
  socket.on('newMessage', (message) => {
    displayMessage(`${message.username}: ${message.message}`);
  });
  
  // Receive and display all existing messages from the server
  socket.on('messages', (messages) => {
    messages.forEach((message) => {
      displayMessage(`${message.username}: ${message.message}`);
    });
  });
  
  // Notify when a new user joins the chat
  socket.on('userConnected', (username) => {
    displayMessage(`${username} has joined the chat.`);
  });
  
  // Notify when a user leaves the chat
  socket.on('userDisconnected', (username) => {
    displayMessage(`${username} has left the chat.`);
  });
  