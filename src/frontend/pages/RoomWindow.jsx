import React from "react";
import ReactDOM from "react-dom";
import "../css/roomPage.css";

const roomPage = () => {
  return (
    <>
      <div className="roomContainer">
        <div className="movieContainer"></div>
        <div className="sideBar">
          <div className="room_text_code">
            <p className="roomText">
              Share this code so your friends can join!
            </p>
            <h1 className="roomCode">XXXXX</h1>
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
};

export default roomPage;
