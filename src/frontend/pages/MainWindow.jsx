import "../css/homePage.css";

const homePage = () => {
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
          ></input>
          <button className="submit-button" type="submit">
            Join
          </button>
        </div>
      </div>
    </>
  );
};

export default homePage;
