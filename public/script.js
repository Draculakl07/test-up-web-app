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
  ? 'https://node-demo1.azurewebsites.net'
  : `https://${window.location.host}`;

const socket = io.connect(socketUrl);
const username = setUserName();
let currentRoom = null;

window.addEventListener("popstate", function(event) {
  handleURLChange();
});

function handleURLChange() {
  const roomNameFromURL = window.location.pathname.replace('/', '');
  if (roomNameFromURL) {
      socket.emit('joinRoom', roomNameFromURL);
  } else {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) chatContainer.style.display = 'none';
      const roomContainer = document.getElementById('room-container');
      if (roomContainer) roomContainer.style.display = 'block';
  }
}



document.addEventListener('DOMContentLoaded', () => {
  handleURLChange();
  
  const createRoomButton = document.getElementById('create-room-button');
  if (createRoomButton) {
      createRoomButton.addEventListener('click', () => {
          const roomName = prompt("Enter room name:");
          if (roomName) socket.emit('createRoom', roomName);
      });
  }

  
  // ... other DOM-related code ...
  const leaveButton = document.getElementById('leave-button');
  if (leaveButton) {
      leaveButton.addEventListener('click', leaveRoom);
  }

  const backButton = document.getElementById('back-button');
  if (backButton) {
      backButton.addEventListener('click', () => {
          window.history.back();
      });
  }
  socket.on('roomList', (rooms) => {
    const roomList = document.getElementById('room-list');
    roomList.innerHTML = '';
    rooms.forEach(room => {
        const li = document.createElement('li');
        li.innerText = room;
        li.addEventListener('click', () => {
            currentRoom = room;
            // Update the URL without reloading the page
            history.pushState({room: room}, '', '/' + room);
            handleURLChange();
        });
        roomList.appendChild(li);
    });
  });
  socket.on('initialMessages', (messages) => {
    // Clear out previous messages first
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = '';

    messages.forEach(message => {
        displayMessage(message);
    });
});

});


document.getElementById('send-button').addEventListener('click', () => {
  const message = document.getElementById('message-input').value;
  if (message.trim()) {
      socket.emit('sendMessageToRoom', { roomName: currentRoom, username, message });
      document.getElementById('message-input').value = '';
  }
});

socket.on('joinedRoom', (roomName) => {
  const roomContainer = document.getElementById('room-container');
  const chatContainer = document.getElementById('chat-container');
  roomContainer.style.display = 'none';
  chatContainer.style.display = 'flex';
});
socket.on('newMessage', (message) => {
  displayMessage(message);
});

function displayMessage(message) {
  const messageContainer = document.getElementById('message-container');
  const messageElement = document.createElement('pre');

  let formattedTimestamp;
  try {
      formattedTimestamp = new Date(message.timestamp).toLocaleTimeString();
  } catch (e) {
      formattedTimestamp = message.timestamp;
  }
  
  messageElement.textContent = `${message.username} (${formattedTimestamp}): ${message.message}`;
  messageContainer.appendChild(messageElement);
}

function leaveRoom() {
  localStorage.removeItem('currentRoom');
  socket.emit('leaveRoom');
  history.pushState(null, '', '/');
  handleURLChange();
}




