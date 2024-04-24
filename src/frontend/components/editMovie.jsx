import React from "react";
import ReactDOM from "react-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import "../css/addMovie.css";
import { addMovie } from "../../backend/controllers/movieController";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateMovie } from "../../backend/controllers/movieController";

function EditMovie({ showEditModal, onCloseEditModal, movie }) {
  const navigate = useNavigate();
  const titleRef = useRef("");
  const descriptionRef = useRef("");
  const directorRef = useRef("");
  const actorsRef = useRef("");
  const yearRef = useRef("");
  const posterURLRef = useRef("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    director: "",
    actors: "",
    year: "",
    posterURL: "",
  });

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        description: movie.description,
        director: movie.director,
        actors: movie.actors.join(", "), // Convert actors array to string
        year: movie.year,
        posterURL: movie.posterURL,
      });
    }
  }, [movie]);

  const handleMovieValidation = () => {
    const title = titleRef.current.value;
    const description = descriptionRef.current.value;
    const director = directorRef.current.value;
    const actors = actorsRef.current.value;
    const year = yearRef.current.value;
    const posterURL = posterURLRef.current.value;

    if (!title || !description || !actors || !director || !year) {
      alert("Please fill in all fields.");
      return;
    }

    const url =
      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
    if (!url.test(posterURL)) {
      alert("posterURL is not a valid URL");
      return;
    }

    const movieData = {
      title,
      description,
      director,
      actors: actors.split(",").map((actor) => actor.trim()), // Assuming actors are entered as comma-separated values
      year,
      posterURL,
    };

    handleMovieUpload(movieData);
  };

  const handleMovieUpload = async (movieData) => {
    const queryParams = new URLSearchParams(window.location.search);
    const movieId = queryParams.get("movieId");
    try {
      await updateMovie(movieId, movieData);
      console.log("Movie updated successfully");
      navigate(0);
    } catch (e) {
      console.log("Error updating movie", e);
      alert("Error updating movie");
    }
  };

  return (
    <Modal show={showEditModal} onHide={onCloseEditModal}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>Update movie</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-box">
        <Form>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Title
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="string"
                placeholder=""
                defaultValue={formData.title}
                ref={titleRef}
              />
            </Col>
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder=""
              defaultValue={formData.description}
              ref={descriptionRef}
            />
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Director
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="string"
                placeholder=""
                defaultValue={formData.director}
                ref={directorRef}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Actors
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="string"
                placeholder=""
                defaultValue={formData.actors}
                ref={actorsRef}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Year
            </Form.Label>
            <Col sm="10">
              <Form.Control
                type="number"
                placeholder=""
                defaultValue={formData.year}
                ref={yearRef}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="4">
              Movie poster URL
            </Form.Label>
            <Col sm="8">
              <Form.Control
                type="string"
                placeholder=""
                defaultValue={formData.posterURL}
                ref={posterURLRef}
              />
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="navbar-button"
          variant="primary"
          onClick={handleMovieValidation}
        >
          Update movie
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditMovie;
