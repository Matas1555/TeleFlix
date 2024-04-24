import {
  deleteMovie,
  getMovie,
} from "../../backend/controllers/movieController";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/movieInformation.css";

function MovieInformation({ onShowEditModal }) {
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [movieId, setMovieID] = useState(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const movieId = queryParams.get("movieId");
      setMovieID(movieId);
      try {
        const movieData = await getMovie(movieId);
        console.log(movieData);
        setMovie(movieData);
      } catch (error) {
        console.error("Error fetching movie:", error);
      }
    };

    fetchMovieData();
  }, []);

  const handleMovieDeletion = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this movie?"
    );
    if (confirmed) {
      const queryParams = new URLSearchParams(window.location.search);
      const movieId = queryParams.get("movieId");
      try {
        await deleteMovie(movieId);
        navigate("/movies");
      } catch (e) {
        console.log("error deleting movie", e);
      }
    }
  };

  const handleMovieEdit = () => {
    onShowEditModal(movie);
  };

  return (
    <div>
      {movie ? (
        <div className="movie-information-main-container">
          <img className="movie-information-poster" src={movie.posterURL}></img>
          <div className="movie-information-card">
            <div className="title-year">
              <h2 className="movie-title">{movie.title}</h2>
              <h2 className="movie-year">{movie.year}</h2>
              <button className="edit-button" onClick={handleMovieEdit}>
                <i className="fa-solid fa-pencil"></i>
              </button>
              <button className="delete-button" onClick={handleMovieDeletion}>
                <i className="fa-solid fa-x"></i>
              </button>
            </div>

            <p className="movie-description">{movie.description}</p>
            <div>
              <p className="actors-word">Actors</p>
              <div className="actors-list">
                {movie.actors.map((actor) => (
                  <p key={actor} className="movie-actors">
                    {actor}
                  </p>
                ))}
              </div>
            </div>

            {movie.director ? (
              <div>
                <p className="actors-word">Director {movie.director}</p>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default MovieInformation;
