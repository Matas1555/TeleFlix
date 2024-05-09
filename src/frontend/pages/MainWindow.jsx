import React from "react";
import ReactDOM from "react-dom";
import "../css/homePage.css";
import { useState } from "react";
import { useAuth } from "../../authContext";
import { joinRoom } from "../../backend/controllers/roomController";

const HomePage = () => {
  const [roomID, setRoomID] = useState("");
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState("");
  const { currentUser, logoutUser } = useAuth();

  const handleJoinRoom = async () => {
    const result = await joinRoom(roomID, currentUser);
    if (result.status && currentUser != null) {
      window.open(`/room?roomID=${roomID}`, "_self");
      setMessage(result.message);
    } else {
      alert("There was an error joining the room");
    }
  };

  return (
    <>
      <div className="joinRoomContainer">
        <div className="inputContainer">
          <h1 className="homePageText">Join a room!</h1>
          <input
            className="joinInputText"
            type="text"
            name="text"
            placeholder="Room number"
            onChange={(e) => setRoomID(e.target.value)}
          ></input>
          <button className="submit-button" onClick={handleJoinRoom}>
            Join
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
