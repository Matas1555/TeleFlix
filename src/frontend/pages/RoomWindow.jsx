import React from "react";
import ReactDOM from "react-dom";
import "../css/roomPage.css";
import "../css/comments.css";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/controllers/firebase-config.js";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Timer from "../components/timer.jsx";
import { getMovieList } from "../../backend/controllers/movieController";
import {
  updateRoomMovieStatus,
  getRoomCreator,
  updateRoomMoviePlayingStatus,
  updateRoomMovieTimeStatus,
  updateUserMovieHistory,
  updateRoomVoteStatus,
  closeMovie,
  addUserToRoom,
  createVote,
  addVotes,
  countVotes,
  addEvent,
  updateRoomEventPredictionStatus,
  getPrediction,
  addUserPrediction,
  checkUserAnswers,
} from "../../backend/controllers/roomController";
import VideoJS from "../components/VideoJS";
import { useAuth } from "../../authContext";

function RoomPage() {
  //MODALS
  const [showModal, setShowModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [isEventCreationVisable, setShowCreationForm] = useState(false);
  const [hasPredictionStarted, setShowPredictionForm] = useState(false);

  //VARIABLES
  const [prediction, setPrediction] = useState("");
  const [users, setUsers] = useState([]);
  const [roomID, setRoomID] = useState("");
  const [selectedMovieURL, setselectedMovieURL] = useState("");
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [isMoviePlaying, setIsMoviePlaying] = useState(false);
  const [votedMovie, setVotedMovie] = useState("");
  const [movieList, setMovieList] = useState(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const { currentUser } = useAuth();
  const playerRef = React.useRef(null);
  const videoJsOptions = React.useMemo(
    () => ({
      autoplay: false,
      controls: isRoomCreator,
      responsive: true,
      fluid: true,
      userActions: {
        doubleClick: !isRoomCreator,
      },
      sources: [
        {
          src: selectedMovieURL,
          type: "video/mp4",
        },
      ],
    }),
    [selectedMovieURL, isRoomCreator]
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get("roomID");
    setRoomID(id);

    const newUser = async (roomID) => {
      const result = await addUserToRoom(roomID, currentUser);
      if (result.status) {
        console.log("new user joined by link");
      }
    };

    const setEventPrediction = async (roomID) => {
      const result = await getPrediction(roomID);
      if (result.status) {
        setPrediction(result.prediction);
      } else {
        setPrediction("");
      }
    };

    if (id) {
      newUser(id);
      const roomRef = doc(db, "rooms", id);

      getRoomCreator(id)
        .then((creator) => {
          if (creator.status && creator.roomCreator === currentUser) {
            setIsRoomCreator(true);
            console.log("user is creator " + currentUser);
          } else {
            console.log("user is not creator");
          }
        })
        .catch((error) =>
          console.error("Failed to fetch room creator:", error)
        );

      const unsubscribe = onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
          console.log("Current data:", doc.data());
          const roomData = doc.data();

          setUsers(roomData.users || []);

          if (
            roomData.movieURL != null &&
            roomData.movieURL !== selectedMovieURL
          ) {
            console.log("movie url was changed");
            setselectedMovieURL(roomData.movieURL);
          } else {
            setselectedMovieURL("");
          }
          console.log(`Updated users in room ${id}:`, roomData.users);

          if (!isRoomCreator) {
            if (roomData.isMoviePlaying) {
              handlePlay();
            } else {
              handlePause();
            }
          }

          if (roomData.hasVotingStarted) {
            setButtonsDisabled(false);
            setShowVoteModal(true);
          } else {
            setButtonsDisabled(false);
            setShowVoteModal(false);
          }

          if (roomData.isEventPredictionActive) {
            setEventPrediction(id);
            setShowPredictionForm(true);
          } else {
            setShowPredictionForm(false);
          }
        } else {
          console.log("No such room!");
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const getMovies = async () => {
    const movies = await getMovieList();
    setMovieList(movies || []);
  };

  useEffect(() => {
    getMovies();
  }, []);

  const handleMovieSelection = (movieURL, caption) => {
    const confirmed = window.confirm(caption);

    if (confirmed) {
      updateRoomMovieStatus(roomID, movieURL);

      const foundMovie = movieList.find((movie) => movie.movieURL === movieURL);

      updateUserMovieHistory(currentUser, foundMovie.title);
      handleModalClose();
    }
  };

  const handleFormInput = async (title) => {
    const result = await addVotes(roomID, title);
    setButtonsDisabled(true);
    setVotedMovie(title);
    console.log(title);
  };

  const handleTimerEnd = async () => {
    setShowVoteModal(false);
    try {
      const result = await countVotes(roomID);
      console.log(result.status);
      if (result.status) {
        if (result.movies.length > 1) {
          if (isRoomCreator) {
            const confirmed = window.confirm(
              "More than one movie has the most amount of votes, would like to start the vote again? if Yes click 'OK', if you would like to choose one of those movies click 'Cancel'"
            );
            if (confirmed) {
              handleVoteModalClose();
              handleMovieVoteStart();
            } else {
              setMovieList(result.movies);
              openMovieSelectionForm(true);
              handleVoteModalClose();
            }
          }
        } else if (result.movies.length === 1) {
          console.log(result.movies[0].movieURL);
          if (isRoomCreator) {
            handleMovieSelection(
              result.movies[0].movieURL,
              result.movies[0].title +
                " was selected, would you like to play it?"
            );
          }
          handleVoteModalClose();
        } else {
          alert("No one voted for a movie");
          handleVoteModalClose();
        }
      }
    } catch {
      console.error("Error handling timer end: ");
    }
  };

  const handlePlay = async () => {
    try {
      await playerRef.current.play();
    } catch (error) {
      console.error("Error playing the video:", error);
    }
  };

  const handlePause = async () => {
    try {
      if (!playerRef.current.paused()) {
        await playerRef.current.pause();
      }
    } catch (error) {
      console.error("Error pausing the video:", error);
    }
  };

  const handleMovieVoteStart = async () => {
    setButtonsDisabled(false);
    const result = await getMovies();
    setShowVoteModal(true);
    try {
      const result = await createVote(roomID);
      if (result.status) {
        await updateRoomVoteStatus(roomID, true);
      } else {
        console.error("Failed to create vote:", result.error);
      }
    } catch (error) {
      console.error("Error starting movie vote:", error);
    }
  };

  const handleVoteModalClose = () => {
    setButtonsDisabled(false);
    setShowVoteModal(false);
    if (isRoomCreator) {
      updateRoomVoteStatus(roomID, false);
    }
  };

  const openMovieSelectionForm = async (forVoting) => {
    setButtonsDisabled(false);
    if (!forVoting) {
      try {
        const result = await getMovies();
      } catch {
        console.log("Error fetching movies");
      }
    }

    setShowModal(true);
  };
  const handleModalClose = () => setShowModal(false);

  const handlePlayerReady = async (player) => {
    playerRef.current = player;

    player.on("dispose", () => {
      console.log("player will dispose");
    });
  };

  const handleMovieClose = () => {
    closeMovie(roomID);
    setselectedMovieURL("");
  };

  const handleMovieEventStart = async () => {
    setShowCreationForm(true);
  };

  const handleEventCreation = () => {
    const prediction = document.getElementById("eventPrediction").value;
    const result = addEvent(roomID, prediction);
    if (result.status) {
      alert("You left the field empty");
    } else {
      updateRoomEventPredictionStatus(roomID, true);
      setShowCreationForm(false);
      setShowPredictionForm(true);
    }
  };

  const handleCreationFormClose = () => {
    setShowCreationForm(false);
  };

  const handlePredictionFormClose = () => {
    if (isRoomCreator) {
      updateRoomEventPredictionStatus(roomID, false);
    }
    setShowPredictionForm(false);
  };

  const handleUserPrediction = (response) => {
    addUserPrediction(roomID, currentUser, response);
    setShowPredictionForm(false);
  };

  const handleVoteEnd = async (response) => {
    updateRoomEventPredictionStatus(roomID, false);
    const result = await checkUserAnswers(roomID, response);
    if (!isRoomCreator) {
      if (result.correctUsers.includes(currentUser)) {
        alert(
          "You have made the right descision, your account recieved 100 points:)"
        );
      } else {
        alert("You are a failure");
      }
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // TODO: Implement chat functionality
      console.log("Sending message:", chatMessage);
      setChatMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="room-container">
      {/* Movie Selection Modal */}
      <Modal show={showModal} onHide={handleModalClose} className="modern-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">Choose a Movie</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <div className="movie-grid">
            {movieList &&
              movieList.map((movie, index) => (
                <button
                  key={index}
                  className="movie-option"
                  onClick={() =>
                    handleMovieSelection(
                      movie.movieURL,
                      "Are you sure you want to select this movie?"
                    )
                  }
                >
                  <span className="movie-title">{movie.title}</span>
                </button>
              ))}
          </div>
        </Modal.Body>
      </Modal>

      {/* Vote Modal */}
      <Modal
        backdrop="static"
        show={showVoteModal}
        onHide={handleVoteModalClose}
        className="modern-modal"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title className="modal-title">Vote for a Movie</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <div className="vote-timer">
            <Timer onTimerEnd={handleTimerEnd} />
          </div>
          <div className="movie-grid">
            {movieList &&
              movieList.map((movie, index) => (
                <button
                  key={index}
                  className={`movie-option ${buttonsDisabled ? 'disabled' : ''}`}
                  onClick={() => handleFormInput(movie)}
                  disabled={buttonsDisabled}
                >
                  <span className="movie-title">{movie.title}</span>
                </button>
              ))}
          </div>
        </Modal.Body>
      </Modal>

      {/* Main Room Layout */}
      <div className="room-layout">
        {/* Video Player Section */}
        <div className="video-section">
          {selectedMovieURL && isRoomCreator && (
            <button onClick={handleMovieClose} className="close-movie-btn">
              <span>×</span>
            </button>
          )}
          
          {selectedMovieURL ? (
            <div className="video-container">
              <VideoJS
                options={videoJsOptions}
                onReady={handlePlayerReady}
                room={roomID}
                isRoomCreator={isRoomCreator}
              />
            </div>
          ) : (
            <div className="no-movie-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">🎬</div>
                <h3>No Movie Selected</h3>
                <p>Choose a movie to start watching together</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Section */}
        <div className="sidebar">
          {/* Room Info */}
          <div className="room-info">
            <div className="room-code-section">
              <h3 className="room-code-label">Room Code</h3>
              <div className="room-code-display">
                <span className="room-code">{roomID}</span>
                <button className="copy-code-btn" onClick={() => navigator.clipboard.writeText(roomID)}>
                  📋
                </button>
              </div>
              <p className="room-code-hint">Share this code with friends to join!</p>
            </div>
          </div>

          {/* Room Controls */}
          {isRoomCreator && (
            <div className="room-controls">
              <div className="control-buttons">
                <button className="control-btn primary" onClick={() => openMovieSelectionForm(false)}>
                  <span className="btn-icon">🎬</span>
                  Choose Movie
                </button>
                <button className="control-btn secondary" onClick={handleMovieVoteStart}>
                  <span className="btn-icon">🗳️</span>
                  Start Vote
                </button>
                <button className="control-btn tertiary" onClick={handleMovieEventStart}>
                  <span className="btn-icon">🔮</span>
                  Predict Event
                </button>
              </div>
            </div>
          )}

          {/* Chat Section */}
          <div className="chat-section">
            <div className="chat-header">
              <h3>Live Chat</h3>
              <span className="online-users">{users.length} online</span>
            </div>
            
            <div className="chat-messages">
              <div className="message">
                <span className="message-user">username123</span>
                <span className="message-text">this is a message</span>
              </div>
              {/* More messages would be rendered here */}
            </div>
            
            <div className="chat-input-section">
              <input
                type="text"
                placeholder="Type your message..."
                className="chat-input"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="send-btn" onClick={handleSendMessage}>
                <span>➤</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Creation Overlay */}
      {isEventCreationVisable && (
        <div className="overlay">
          <div className="overlay-content">
            <button onClick={handleCreationFormClose} className="close-overlay-btn">
              <span>×</span>
            </button>
            <div className="overlay-body">
              <h3>Predict Movie Event</h3>
              <p>What event do you think will happen in the movie?</p>
              <input
                id="eventPrediction"
                type="text"
                className="overlay-input"
                placeholder="Enter your prediction..."
              />
              <button onClick={handleEventCreation} className="overlay-btn">
                Submit Prediction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Overlay */}
      {hasPredictionStarted && (
        <div className="overlay">
          <div className="overlay-content">
            <button onClick={handlePredictionFormClose} className="close-overlay-btn">
              <span>×</span>
            </button>
            <div className="overlay-body">
              {isRoomCreator ? (
                <>
                  <h3>Did the Event Happen?</h3>
                  <p className="prediction-text">{prediction}</p>
                  <div className="prediction-buttons">
                    <button onClick={() => handleVoteEnd(true)} className="prediction-btn yes">
                      ✅ Yes
                    </button>
                    <button onClick={() => handleVoteEnd(false)} className="prediction-btn no">
                      ❌ No
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>Make Your Prediction</h3>
                  <p className="prediction-text">{prediction}</p>
                  <div className="prediction-buttons">
                    <button onClick={() => handleUserPrediction(true)} className="prediction-btn yes">
                      ✅ Yes
                    </button>
                    <button onClick={() => handleUserPrediction(false)} className="prediction-btn no">
                      ❌ No
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomPage;
