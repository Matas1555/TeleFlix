import React, { useState, useEffect } from "react";
import "../css/movieList.css";
import {
  getMovieList,
  deleteMovie,
  updateMovie,
} from "../../backend/controllers/movieController";

function MovieList({ ShowMovieAddForm }) {
  const [movies, setMovies] = useState([]);
  const [editedMovie, setEditedMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      const loadedMovies = await getMovieList();
      if (loadedMovies) {
        setMovies(loadedMovies);
      }
    };
    fetchMovies();
  }, []);

  const handleMovieAdd = () => {
    ShowMovieAddForm();
  };

  const handleImageClick = (movie) => {
    // Open new window with MovieInformationWindow and pass the movie data
    window.open(`/movieInformation?movieId=${movie}`, "_self");
  };

  return (
    <>
      <div className="movieListAddContainer">
        <button className="navbar-button" onClick={handleMovieAdd}>
          Add a Movie
        </button>
        <button className="navbar-button">Filter</button>
      </div>
      <div className="main-container">
        <div className="movie-list-container">
          <div className="movie-list">
            {movies.map((movie) => (
              <div className="card-overlay" disabled="true">
                <div className="movie-card" key={movie.id}>
                  <img
                    src={movie.posterURL}
                    alt={movie.title}
                    className="img-fluid clickable-image"
                    onClick={() => handleImageClick(movie.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default MovieList;
