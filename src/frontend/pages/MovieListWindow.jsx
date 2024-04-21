import "../css/movieList.css";

function movieList({ onShowModal }) {
  return (
    <>
      <div className="">
        <div className="inputContainer">
          <button className="navbar-button" onClick={onShowModal}>
            Add a movie
          </button>
        </div>
      </div>
    </>
  );
}

export default movieList;
