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

const socketUrl = window.location.host.startsWith('localhost')
  ? 'http://localhost:3000'
  : `https://${window.location.host}`;

const socket = io(socketUrl);
const username = setUserName();
socket.emit('newUser', username);

function displayMessage(messageData) {
  if (!messageData.username || !messageData.message || !messageData.timestamp) {
    return; // If any attribute is missing, don't display the message.
  }
  
  const messageContainer = document.getElementById('message-container');
  const newMessageElement = document.createElement('pre');
  const messageText = document.createElement('span');
  const messageTime = document.createElement('span');
  
  messageText.innerText = `${messageData.username}: ${messageData.message}`;
  messageTime.innerText = messageData.timestamp;
  messageTime.className = "message-time";

  newMessageElement.appendChild(messageText);
  newMessageElement.appendChild(messageTime);
  messageContainer.appendChild(newMessageElement);
}



document.getElementById('send-button').addEventListener('click', () => {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('sendMessage', { username, message });
    messageInput.value = '';
  }
});

document.getElementById('message-input').addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    document.getElementById('send-button').click();
  }
});

socket.on('newMessage', (message) => {
  displayMessage(`${message.username}: ${message.message}`);
});

socket.on('messages', (messages) => {
  messages.forEach((message) => {
    displayMessage(`${message.username}: ${message.message}`);
  });
});

socket.on('userConnected', (username) => {
  displayMessage(`${username} has joined the chat.`);
});

socket.on('userDisconnected', (username) => {
  displayMessage(`${username} has left the chat.`);
});
socket.on('newMessage', (messageData) => {
  displayMessage(messageData);
});

socket.on('messages', (messages) => {
  messages.forEach((messageData) => {
    displayMessage(messageData);
  });
});
