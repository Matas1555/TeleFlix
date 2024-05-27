import React, { useState, useEffect } from "react";
import "../css/movieList.css";
import {
  getMovieList,
  deleteMovie,
    updateMovie,
    getUser,
} from "../../backend/controllers/movieController";
import { useAuth } from '../../authContext';

function MovieList({ ShowMovieAddForm }) {
  const [movies, setMovies] = useState([]);
    const [editedMovie, setEditedMovie] = useState(null);
    const { currentUser } = useAuth()
    const [admin, setAdmin] = useState(null);
  useEffect(() => {
      const fetchMovies = async () => {
          const loadedMovies = await getMovieList(currentUser);
        if (loadedMovies) {
            setMovies(loadedMovies);
        }
    };
    fetchMovies();
  }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const adminData = await getUser(currentUser);
                console.log(adminData);
                setAdmin(adminData);
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchUserData();
    }, [currentUser]);

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
              {admin === true ? (
                  <>
                      <button className="navbar-button" onClick={handleMovieAdd}>
                          Add a Movie
                      </button>
                  </>
              ) : null}
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
