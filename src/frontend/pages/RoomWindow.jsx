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
import { getMovieList } from "../../backend/controllers/movieController";
import {
  updateRoomMovieStatus,
  getRoomCreator,
  updateRoomMoviePlayingStatus,
  updateRoomMovieTimeStatus,
} from "../../backend/controllers/roomController";
import VideoJS from "../components/VideoJS";
import { useAuth } from "../../authContext";
import GameModal from './../components/game.jsx';
import GameAlert from "../components/gameAlert.jsx";

function RoomPage() {
  const [roomID, setRoomID] = useState("");
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [selectedMovieURL, setselectedMovieURL] = useState("");
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [isMoviePlaying, setIsMoviePlaying] = useState(false);
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

    if (id) {
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
        } else {
          console.log("No such room!");
        }
      });

      // Cleanup this component
      return () => unsubscribe();
    }
  }, []);

  const [movieList, setMovieList] = useState(null);
  useEffect(() => {
    const getMovies = async () => {
      const movies = await getMovieList();
      setMovieList(movies || []);
    };

    getMovies();
  }, []);

  const selectMovie = (movieURL) => {
    //setselectedMovieURL(movieURL);
    updateRoomMovieStatus(roomID, movieURL);
    handleModalClose();
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

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  const handleGameShow = () => setShowGame(true);
  const handleGameClose = () => setShowGame(false);

  const handlePlayerReady = async (player) => {
    playerRef.current = player;

    player.on("dispose", () => {
      console.log("player will dispose");
    });
  };

  return (
    <>
      <GameAlert />
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
                    <Button onClick={() => selectMovie(movie.movieURL)}>
                      Select Movie
                    </Button>{" "}
                    {/* Add your selectMovie function if needed */}
                  </Col>
                </Row>
              ))}
          </Form>
        </Modal.Body>
      </Modal>
      <GameModal show={showGame} handleClose={handleGameClose} userEmail={currentUser} />
      <div className="roomContainer">
        <div className="movieContainer">
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
            <button className="room-button"onClick={handleGameShow}>Start game</button>
            <button className="room-button">Predict what happens</button>
          </div>
          {isRoomCreator ? (
            <div className="sidebarButtons">
              <button className="room-button" onClick={handleModalShow}>
                Choose a movie
              </button>
              <button className="room-button">Vote for a movie</button>
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
