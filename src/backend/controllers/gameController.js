import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { db } from './firebase-config'; // Adjust the path as needed
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import './../../App.css';

const socket = io('http://localhost:5000', {
  withCredentials: true,
});

const GameController = ({ userEmail, width, height }) => {
  const [players, setPlayers] = useState({});
  const [food, setFood] = useState({});
  const [blueCube, setBlueCube] = useState({});
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    socket.on('init', ({ players, food, blueCube }) => {
      setPlayers(players);
      setFood(food);
      setBlueCube(blueCube);
    });

    socket.on('updatePlayers', ({ players, food, blueCube }) => {
      setPlayers(players);
      setFood(food);
      setBlueCube(blueCube);
    });

    socket.on('playerKilled', async (message, score) => {
      alert(message);
      setGameStarted(false);
      setPlayers({});
      setFood({});
      setBlueCube({});
      await updatePoints(userEmail, score); // Update points in Firestore
    });

    return () => {
      socket.off('init');
      socket.off('updatePlayers');
      socket.off('playerKilled');
    };
  }, [score, userEmail]);

  useEffect(() => {
    if (gameStarted) {
      socket.emit('startGame', userEmail);

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [gameStarted, userEmail]);

  useEffect(() => {
    if (gameStarted) {
      socket.emit('move', direction);
    }
  }, [direction, gameStarted]);

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

  const handleStartGame = () => {
    setGameStarted(true);
    setScore(0);
    socket.emit('startGame', userEmail);
  };

  const updatePoints = async (email, points) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
  
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      console.log("User document data:", userDoc.data()); // Log user document data
      const userRef = doc(db, 'users', userDoc.id);
      await updateDoc(userRef, {
        points: (userDoc.data().points || 0) + points,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      Object.values(players).forEach(player => {
        context.fillStyle = 'green';
        player.tail.forEach(segment => {
          context.fillRect(segment.x, segment.y, 10, 10);
        });
        context.fillRect(player.position.x, player.position.y, 10, 10);
      });

      context.fillStyle = 'red';
      context.fillRect(food.x, food.y, 10, 10);

      context.fillStyle = 'blue';
      context.fillRect(blueCube.x, blueCube.y, 30, 30);
    };

    const gameLoop = setInterval(() => {
      draw();
    }, 100);

    return () => clearInterval(gameLoop);
  }, [players, food, blueCube]);

  return (
    <div>
      {!gameStarted && <button onClick={handleStartGame}>Start Game</button>}
      <canvas ref={canvasRef} width={width} height={height}></canvas>
    </div>
  );
};

export default GameController;
