import React, { useState, useEffect, useRef } from 'react';
import socket from './../../socket'; // Import the socket connection
import './../../App.css';

const Game = () => {
  const [players, setPlayers] = useState({});
  const [food, setFood] = useState({});
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    // Establish the connection to the socket server
    socket.connect();

    // Notify the server that a new player has connected
    socket.emit('newPlayer');

    // Listen for the initial game state from the server
    socket.on('init', ({ players, food }) => {
      setPlayers(players);
      setFood(food);
    });

    // Listen for updates to the game state
    socket.on('updatePlayers', ({ players, food }) => {
      setPlayers(players);
      setFood(food);
    });

    // Handle key down events to change direction
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      // Cleanup listeners on component unmount
      socket.off('init');
      socket.off('updatePlayers');
      window.removeEventListener('keydown', handleKeyDown);
      socket.disconnect(); // Disconnect from the server when the component unmounts
    };
  }, []);

  useEffect(() => {
    // Emit the new direction to the server
    socket.emit('move', direction);
  }, [direction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw each player's snake
      Object.values(players).forEach(player => {
        context.fillStyle = 'green';
        player.tail.forEach(segment => {
          context.fillRect(segment.x, segment.y, 10, 10);
        });
        context.fillRect(player.position.x, player.position.y, 10, 10);
      });

      // Draw the food
      context.fillStyle = 'red';
      context.fillRect(food.x, food.y, 10, 10);
    };

    const gameLoop = setInterval(() => {
      draw();
    }, 100);

    return () => clearInterval(gameLoop);
  }, [players, food]);

  return (
    <canvas ref={canvasRef} width={600} height={400}></canvas>
  );
};

export default Game;
