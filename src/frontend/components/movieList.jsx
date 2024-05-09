import React from "react";
import ReactDOM from "react-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import "../css/addMovie.css";
import { addMovie } from "../../backend/controllers/movieController";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMovieList } from "../../backend/controllers/movieController";

function MovieListModal({ showMovieListModal, onCloseModal }) {
  const [movieList, setMovieList] = useState(null);
  useEffect(() => {
    const getMovies = async () => {
      const movies = await getMovieList();
      setMovieList(movies || []);
    };

    getMovies();
  }, []);

  const selectMovie = (movieURL) => {
    console.log(movieURL);
  };

  return (
    <Modal show={showMovieListModal} onHide={onCloseModal}>
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
  );
}

export default MovieListModal;
