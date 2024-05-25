import React, { useEffect } from 'react';
import io from 'socket.io-client';

const GameAlert = () => {
  useEffect(() => {
    const socket = io('http://localhost:5000'); // Establish a connection with the server
    socket.emit('alert')
    // Listen for the 'gameStarted' event from the server
    socket.on('gameStarted', () => {
      window.alert('The game has started!'); // Display a browser alert when the event is received
    });

    return () => {
      socket.disconnect(); // Clean up the socket connection when the component unmounts
    };
  }, []);

  return null; // This component doesn't render anything, it just listens for events
};

export default GameAlert;