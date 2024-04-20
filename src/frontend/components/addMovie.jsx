import React from 'react'
import ReactDOM from 'react-dom'
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import "../css/addMovie.css";
import { addMovie } from "../../backend/controllers/movieController";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function AddMovie({ showModal, onCloseModal }) {
  const navigate = useNavigate();
  const titleRef = useRef("");
  const descriptionRef = useRef("");
  const directorRef = useRef("");
  const actorsRef = useRef("");
  const yearRef = useRef("");
  const posterURLRef = useRef("");
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleMovieUpload = async () => {
    const title = titleRef.current.value;
    const description = descriptionRef.current.value;
    const director = directorRef.current.value;
    const actors = actorsRef.current.value;
    const year = yearRef.current.value;
    const posterURL = posterURLRef.current.value;

    if (!title || !description || !actors || !year || !file) {
      alert("Please fill in all fields.");
      return;
    }

    const movieData = {
      title,
      description,
      director,
      actors: actors.split(",").map((actor) => actor.trim()), // Assuming actors are entered as comma-separated values
      year,
      posterURL,
      file,
    };

    const response = await addMovie(movieData, file);
    if (response.status) {
      onCloseModal();
      navigate("/");
    }
  };

  return (
    <Modal show={showModal} onHide={onCloseModal}>
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>Add A New Movie</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-box">
        <Form>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Title
            </Form.Label>
            <Col sm="10">
              <Form.Control type="string" placeholder="" ref={titleRef} />
            </Col>
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Write a description for the movie"
              ref={descriptionRef}
            />
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Director
            </Form.Label>
            <Col sm="10">
              <Form.Control type="string" placeholder="" ref={directorRef} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Actors
            </Form.Label>
            <Col sm="10">
              <Form.Control type="string" placeholder="" ref={actorsRef} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Year
            </Form.Label>
            <Col sm="10">
              <Form.Control type="number" placeholder="" ref={yearRef} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="4">
              Movie poster URL
            </Form.Label>
            <Col sm="8">
              <Form.Control type="string" placeholder="" ref={posterURLRef} />
            </Col>
          </Form.Group>
          <Form.Group controlId="formFile" as={Row} className="mb-3">
            <Form.Label column sm="3">
              Movie file
            </Form.Label>
            <Col sm="9">
              <Form.Control type="file" onChange={handleFileChange} />
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="navbar-button"
          variant="secondary"
          onClick={onCloseModal}
        >
          Close
        </Button>
        <Button
          className="navbar-button"
          variant="primary"
          onClick={() => {
            handleMovieUpload();
          }}
        >
          Add movie
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddMovie;
