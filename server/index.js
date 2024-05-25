const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));

const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

let players = {};
let food = generateFood();
let blueCube = generateFood();
let gameRunning = false;
let gameInterval;

function generateFood() {
  return { x: Math.floor(Math.random() * 60) * 10, y: Math.floor(Math.random() * 40) * 10 };
}

io.on('connection', (socket) => {
  console.log(`New player connected: ${socket.id}`);

  socket.on('startGame', () => {
    players[socket.id] = {
      id: socket.id,
      position: { x: 0, y: 0 },
      direction: { x: 1, y: 0 },
      tail: [],
      length: 1,
      score: 0,
    };
    io.emit('init', { players, food, blueCube });
    io.emit('updatePlayers', { players, food, blueCube });
    if (!gameRunning) {
      startGame();
    }
  });

  socket.on('move', (direction) => {
    if (players[socket.id]) {
      players[socket.id].direction = direction;
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('updatePlayers', { players, food, blueCube });
    console.log(`Player disconnected: ${socket.id}`);
    if (Object.keys(players).length === 0) {
      stopGame();
    }
  });
});

function gameLoop() {
  for (let id in players) {
    let player = players[id];
    let newPosition = {
      x: player.position.x + player.direction.x * 10,
      y: player.position.y + player.direction.y * 10,
    };

    if (newPosition.x < 0 || newPosition.x >= 600 || newPosition.y < 0 || newPosition.y >= 400) {
      io.to(id).emit('playerKilled', `You stepped outside the bounds! Score: ${player.score}`, player.score);
      delete players[id];
      io.emit('updatePlayers', { players, food, blueCube });
      continue;
    }

    if (newPosition.x >= blueCube.x && newPosition.x < blueCube.x + 30 &&
        newPosition.y >= blueCube.y && newPosition.y < blueCube.y + 30) {
      io.to(id).emit('playerKilled', `You hit the blue cube! Score: ${player.score}`);
      delete players[id];
      blueCube = generateFood();
      io.emit('updatePlayers', { players, food, blueCube });
      continue;
    }

    if (newPosition.x === food.x && newPosition.y === food.y) {
      player.length += 1;
      player.score += 1;
      food = generateFood();
    }

    player.tail.push({ ...player.position });
    if (player.tail.length > player.length) {
      player.tail.shift();
    }

    player.position = newPosition;
  }

  io.emit('updatePlayers', { players, food, blueCube });
}

function startGame() {
  gameRunning = true;
  gameInterval = setInterval(gameLoop, 100);
  io.emit('gameStarted');
}

function stopGame() {
  gameRunning = false;
  clearInterval(gameInterval);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
