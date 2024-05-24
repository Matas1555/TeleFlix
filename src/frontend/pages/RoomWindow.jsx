import React from "react";
import ReactDOM from "react-dom";
import "../css/roomPage.css";
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
} from "../../backend/controllers/roomController";
import VideoJS from "../components/VideoJS";
import { useAuth } from "../../authContext";

function RoomPage() {
  const [roomID, setRoomID] = useState("");
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedMovieURL, setselectedMovieURL] = useState("");
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [isMoviePlaying, setIsMoviePlaying] = useState(false);
  const [votedMovie, setVotedMovie] = useState("");
  const [movieList, setMovieList] = useState(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(true);
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
      //setUsers(roomData.users || []);
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
          console.log(`Updated users in room ${id}:`, roomData.users); // Log when users array changes

          // if (roomData.isMoviePlaying !== isMoviePlaying) {
          //   setIsMoviePlaying(roomData.isMoviePlaying);
          //   if (playerRef.current) {
          //     console.log("player is playing");
          //   }
          // }

          if (!isRoomCreator) {
            if (roomData.isMoviePlaying) {
              handlePlay();
            } else {
              handlePause();
            }

            // if (
            //   playerRef.current &&
            //   Math.abs(playerRef.current.currentTime() - roomData.currentTime) >
            //     1
            // ) {
            //   playerRef.current.currentTime(roomData.currentTime);
            // }
          }

          if (roomData.hasVotingStarted) {
            setButtonsDisabled(false);
            setShowVoteModal(true);
          } else {
            setButtonsDisabled(false);
            setShowVoteModal(false);
          }
        } else {
          console.log("No such room!");
        }
      });

      // Cleanup this component
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
    //setselectedMovieURL(movieURL);
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
        console.log(result.movies.length);
        if (result.movies.length > 1) {
          if (isRoomCreator) {
            const confirmed = window.confirm(
              "More than one movie recieved the most amount of votes, would like to start the vote again? if Yes click 'OK', if you would like to choose one of those movies click 'Cancel'"
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
        } else {
          console.log(result.movies[0].movieURL);
          if (isRoomCreator) {
            handleMovieSelection(
              result.movies[0].movieURL,
              result.movies[0].title +
                " was selected, would you like to play it?"
            );
          }
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

  return (
    <>
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>Choose a movie</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-box">
          <Form>
            {movieList &&
              movieList.map((movie, index) => (
                <Row key={index} className="mb-3">
                  {" "}
                  {/* mb-3 adds margin bottom for spacing */}
                  <Col>
                    <Form.Label>{movie.title}</Form.Label>{" "}
                    {/* Assuming each movie object has a 'title' property */}
                  </Col>
                  <Col>
                    <Button
                      onClick={() =>
                        handleMovieSelection(
                          movie.movieURL,
                          "Are you sure you want to select this movie?"
                        )
                      }
                    >
                      Select Movie
                    </Button>{" "}
                    {/* Add your selectMovie function if needed */}
                  </Col>
                </Row>
              ))}
          </Form>
        </Modal.Body>
      </Modal>
      <Modal
        backdrop="static"
        show={showVoteModal}
        onHide={handleVoteModalClose}
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>Vote for a movie</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-box">
          <Timer onTimerEnd={handleTimerEnd}></Timer>
          <Form>
            {movieList &&
              movieList.map((movie, index) => (
                <Row key={index} className="mb-3">
                  {" "}
                  {/* mb-3 adds margin bottom for spacing */}
                  <Col>
                    <Form.Label>{movie.title}</Form.Label>{" "}
                    {/* Assuming each movie object has a 'title' property */}
                  </Col>
                  <Col>
                    <Button
                      onClick={() => handleFormInput(movie)}
                      disabled={buttonsDisabled}
                    >
                      Select Movie
                    </Button>{" "}
                    {/* Add your selectMovie function if needed */}
                  </Col>
                </Row>
              ))}
          </Form>
        </Modal.Body>
      </Modal>
      <div className="roomContainer">
        <div className="movieContainer">
          {selectedMovieURL ? (
            <>
              <button onClick={handleMovieClose} className="movieCloseButton">
                X
              </button>
            </>
          ) : (
            <></>
          )}
          {isRoomCreator ? (
            <>
              {selectedMovieURL && (
                <VideoJS
                  options={videoJsOptions}
                  onReady={handlePlayerReady}
                  room={roomID}
                  isRoomCreator={isRoomCreator}
                />
              )}
            </>
          ) : (
            <>
              {selectedMovieURL && (
                <VideoJS
                  options={videoJsOptions}
                  onReady={handlePlayerReady}
                  room={roomID}
                  isRoomCreator={isRoomCreator}
                />
              )}
            </>
          )}
        </div>
        <div className="sideBar">
          <div className="room_text_code">
            <p className="roomText">
              Share this code so your friends can join!
            </p>
            <h1 className="roomCode">{roomID}</h1>
          </div>
          <div className="sidebarButtons">
            <button className="room-button">Start game</button>
            <button className="room-button">Predict what happens</button>
          </div>
          {isRoomCreator ? (
            <div className="sidebarButtons">
              <button
                className="room-button"
                onClick={() => openMovieSelectionForm(false)}
              >
                Choose a movie
              </button>
              <button className="room-button" onClick={handleMovieVoteStart}>
                Vote for a movie
              </button>
            </div>
          ) : (
            <></>
          )}

          <div className="message-window">
            <div className="messages">
              <p className="user_name">useername123</p>
              <p className="user_message">this is a message</p>
            </div>
            <div className="chatInteraction">
              <input
                type="text"
                placeholder="Write your message here..."
                className="messageInput"
              ></input>
              <button className="room-button">Send</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RoomPage;
