import React, { useState, useEffect } from "react";
import "../css/movieList.css";
import {
  getAllMovies,
  deleteMovie,
  updateMovie,
} from "../../backend/controllers/movieController";

function MovieList({ onShowModal }) {
  const [movies, setMovies] = useState([]);
  const [editedMovie, setEditedMovie] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      const loadedMovies = await getAllMovies();
      if (loadedMovies) {
        setMovies(loadedMovies);
      }
    };

    fetchMovies();
  }, []);

  const handleDelete = async (movieId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this movie?"
    );
    if (confirmed) {
      await deleteMovie(movieId);
      const updatedMovies = movies.filter((movie) => movie.id !== movieId);
      setMovies(updatedMovies);
    }
  };

  const handleEdit = (movieId) => {
    const movieToEdit = movies.find((movie) => movie.id === movieId);
    setEditedMovie(movieToEdit);
  };

  const handleSave = async () => {
    if (!editedMovie) return;

    await updateMovie(editedMovie.id, editedMovie);
    const updatedMovies = movies.map((movie) =>
      movie.id === editedMovie.id ? editedMovie : movie
    );
    setMovies(updatedMovies);
    setEditedMovie(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedMovie((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <>
      <div className="movieListAddContainer">
        <button className="navbar-button" onClick={onShowModal}>
          Add a Movie
        </button>
        <button className="navbar-button">Filter</button>
      </div>
      <div className="movie-list-container">
        <div className="movie-list">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Actors</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td>
                    {editedMovie && editedMovie.id === movie.id ? (
                      <input
                        type="text"
                        name="title"
                        className="movieEditInput"
                        value={editedMovie.title}
                        onChange={handleChange}
                      />
                    ) : (
                      movie.title
                    )}
                  </td>
                  <td>
                    {editedMovie && editedMovie.id === movie.id ? (
                      <textarea
                        type="text"
                        name="description"
                        className="movieEditInputTextArea"
                        value={editedMovie.description}
                        onChange={handleChange}
                      />
                    ) : (
                      movie.description
                    )}
                  </td>
                  <td>
                    {editedMovie && editedMovie.id === movie.id ? (
                      <input
                        type="text"
                        name="actors"
                        className="movieEditInput"
                        value={editedMovie.actors}
                        onChange={handleChange}
                      />
                    ) : (
                      movie.actors.join(", ")
                    )}
                  </td>
                  <td>
                    {editedMovie && editedMovie.id === movie.id ? (
                      <input
                        type="text"
                        name="year"
                        className="movieEditInput"
                        value={editedMovie.year}
                        onChange={handleChange}
                      />
                    ) : (
                      movie.year
                    )}
                  </td>
                  <td className="actions-tab">
                    {editedMovie && editedMovie.id === movie.id ? (
                      <>
                        <button className="navbar-button" onClick={handleSave}>
                          Save
                        </button>
                        <button
                          className="navbar-button"
                          onClick={() => setEditedMovie(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="navbar-button"
                          onClick={() => handleEdit(movie.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="navbar-button"
                          onClick={() => handleDelete(movie.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default MovieList;
