import React from "react";
import ReactDOM from "react-dom";
import "../css/homePage.css";
import { useState } from "react";
import { useAuth } from "../../authContext";
import { addUserToRoom } from "../../backend/controllers/roomController";

const HomePage = () => {
  const [roomID, setRoomID] = useState("");
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const { currentUser, logoutUser } = useAuth();

  const handleJoinRoom = async () => {
    setIsLoading(true);
    setInputError("");
    
    try {
      const result = await addUserToRoom(roomID, currentUser);
      if (result.status) {
        window.open(`/room?roomID=${roomID}`, "_self");
        setMessage(result.message);
      } else {
        setInputError("Failed to join room. Please check the room code and try again.");
      }
    } catch (error) {
      setInputError("An error occurred while joining the room.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateCode = async () => {
    if (roomID.length === 6) {
      await handleJoinRoom();
    } else {
      setInputError("Room code must be exactly 6 characters long");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setRoomID(value);
    setInputError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      validateCode();
    }
  };

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Watch Together, 
            <span className="accent-text"> Anywhere</span>
          </h1>
          <p className="hero-subtitle">
            Create or join a room to watch movies with friends in real-time. 
            Vote, chat, and enjoy synchronized viewing experiences.
          </p>
        </div>
      </div>

      {/* Join Room Section */}
      <div className="join-section">
        <div className="join-card">
          <div className="card-header">
            <h2 className="card-title">Join a Room</h2>
            <p className="card-description">
              Enter the 6-character room code to join your friends
            </p>
          </div>
          
          <div className="input-group">
            <div className="input-wrapper">
              <input
                className={`room-input ${inputError ? 'error' : ''}`}
                type="text"
                placeholder="Enter room code"
                value={roomID}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                maxLength={6}
                disabled={isLoading}
              />
              <div className="input-focus-border"></div>
            </div>
            
            {inputError && (
              <div className="error-message">
                {inputError}
              </div>
            )}
            
            <button 
              className={`join-button ${isLoading ? 'loading' : ''}`}
              onClick={validateCode}
              disabled={isLoading || roomID.length === 0}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Join Room'
              )}
            </button>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3>Vote Together</h3>
              <p>Democratically choose what to watch</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⏸️</div>
              <h3>Sync Controls</h3>
              <p>Pause, play, and seek in sync</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💬</div>
              <h3>Real-time Chat</h3>
              <p>Share reactions and comments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Animation */}
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
    </div>
  );
};

export default HomePage;
