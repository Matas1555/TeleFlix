import React from "react";
import ReactDOM from "react-dom";
import "../css/roomPage.css";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/controllers/firebase-config.js";
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
} from "../../backend/controllers/roomController";
import VideoJS from "../components/VideoJS";
import { useAuth } from "../../authContext";

function RoomPage() {
  const [roomID, setRoomID] = useState("");
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMovieURL, setselectedMovieURL] = useState("");
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [isMoviePlaying, setIsMoviePlaying] = useState(false);
  const { currentUser, logoutUser } = useAuth();
  const playerRef = React.useRef(null);
  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: selectedMovieURL,
        type: "video/mp4",
      },
    ],
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get("roomID");
    setRoomID(id);

    if (id) {
      const roomRef = doc(db, "rooms", id);

      const unsubscribe = onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
          console.log("Current data:", doc.data());
          const roomData = doc.data();
          setUsers(roomData.users || []);
          if (roomData.isMoviePlaying) {
            setselectedMovieURL(roomData.movieURL);
          }
          console.log(`Updated users in room ${id}:`, roomData.users); // Log when users array changes
        } else {
          console.log("No such room!");
        }
      });

      getRoomCreator(id)
        .then((creator) => {
          if (creator.status && creator.roomCreator === currentUser) {
            setIsRoomCreator(true);
          }
        })
        .catch((error) =>
          console.error("Failed to fetch room creator:", error)
        );

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

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      console.log("player is waiting");
    });

    player.on("dispose", () => {
      console.log("player will dispose");
    });
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
      <div className="roomContainer">
        <div className="movieContainer">
          {isRoomCreator ? (
            <>
              <button className="room-button" onClick={handleModalShow}>
                Choose a movie
              </button>
              <button className="room-button">Vote for a movie</button>
              {selectedMovieURL && (
                <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
              )}
            </>
          ) : (
            <>
              {selectedMovieURL && (
                <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
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
