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
  const { currentUser, logoutUser } = useAuth();

  const handleJoinRoom = async () => {
    const result = await addUserToRoom(roomID, currentUser);
    if (result.status && currentUser != null) {
      window.open(`/room?roomID=${roomID}`, "_self");
      setMessage(result.message);
    } else {
      alert("There was an error joining the room");
    }
  };

  const validateCode = async () => {
    if (roomID.length == 6) {
      const result = await handleJoinRoom();
    } else {
      alert("The room code must be 6 characters long");
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
          <button className="submit-button" onClick={validateCode}>
            Join
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
