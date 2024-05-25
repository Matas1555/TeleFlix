const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Import the cors package
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs for players

const app = express();
const server = http.createServer(app);

// Use CORS middleware to allow cross-origin requests
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: ['GET', 'POST'], // Allow these HTTP methods
  credentials: true, // Allow cookies to be sent with requests
}));

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

let players = {}; // Store all players' data
let food = generateFood(); // Generate the initial food position

// Function to generate food at a random position
function generateFood() {
  return { x: Math.floor(Math.random() * 60) * 10, y: Math.floor(Math.random() * 40) * 10 };
}

// Handle new player connection
io.on('connection', (socket) => {
  console.log(`New player connected: ${socket.id}`);

  // Listen for the custom 'newPlayer' event
  socket.on('newPlayer', () => {
    // Initialize player data
    players[socket.id] = {
      id: socket.id,
      position: { x: 0, y: 0 },
      direction: { x: 1, y: 0 },
      tail: [],
      length: 1,
    };

    // Send initial game state to the newly connected player
    socket.emit('init', { players, food });

    // Notify all players of the new player
    io.emit('updatePlayers', { players, food });
  });

  // Listen for move events from the client
  socket.on('move', (direction) => {
    if (players[socket.id]) {
      players[socket.id].direction = direction;
    }
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('updatePlayers', { players, food });
    console.log(`Player disconnected: ${socket.id}`);
  });
});

// Game loop to update player positions and check for collisions
function gameLoop() {
  for (let id in players) {
    let player = players[id];
    let newPosition = {
      x: player.position.x + player.direction.x * 10,
      y: player.position.y + player.direction.y * 10,
    };

    // Check if the player has eaten the food
    if (newPosition.x === food.x && newPosition.y === food.y) {
      player.length += 1;
      food = generateFood(); // Generate new food
    }

    // Update player's tail and position
    player.tail.push({ ...player.position });
    if (player.tail.length > player.length) {
      player.tail.shift();
    }

    player.position = newPosition;
  }

  // Emit the updated game state to all connected clients
  io.emit('updatePlayers', { players, food });
}

// Run the game loop every 100 milliseconds
setInterval(gameLoop, 100);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
