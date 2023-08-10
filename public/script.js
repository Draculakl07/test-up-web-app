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
let currentRoom = null;

document.getElementById('create-room-button').addEventListener('click', () => {
  const roomName = prompt("Enter room name:");
  if (roomName) socket.emit('createRoom', roomName);
});

socket.on('roomList', (rooms) => {
  const roomList = document.getElementById('room-list');
  roomList.innerHTML = '';
  rooms.forEach(room => {
      const li = document.createElement('li');
      li.innerText = room;
      li.addEventListener('click', () => {
          currentRoom = room;
          socket.emit('joinRoom', room);
      });
      roomList.appendChild(li);
  });
});

socket.on('joinedRoom', (roomName) => {
  const roomContainer = document.getElementById('room-container');
  const chatContainer = document.getElementById('chat-container');
  roomContainer.style.display = 'none';
  chatContainer.style.display = 'flex';

  document.getElementById('send-button').addEventListener('click', () => {
      const message = document.getElementById('message-input').value;
      if (message.trim()) {
          socket.emit('sendMessageToRoom', { roomName: currentRoom, username, message });
          displayMessage({ username, message, timestamp: new Date().toLocaleTimeString() });  // Display the message for the sender
          document.getElementById('message-input').value = '';
      }
  });

  socket.on('newMessage', (message) => {
      displayMessage(message);
  });
});

function displayMessage(message) {
  const messageContainer = document.getElementById('message-container');
  const messageElement = document.createElement('pre');
  messageElement.textContent = `${message.username} (${message.timestamp}): ${message.message}`;
  messageContainer.appendChild(messageElement);
}
