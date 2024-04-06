import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import "../css/addMovie.css";

function AddMovie({ showModal, onCloseModal }) {
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
              <Form.Control type="string" placeholder="" />
            </Col>
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Write a description for the movie"
            />
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Director
            </Form.Label>
            <Col sm="10">
              <Form.Control type="string" placeholder="" />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Actors
            </Form.Label>
            <Col sm="10">
              <Form.Control type="string" placeholder="" />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="2">
              Year
            </Form.Label>
            <Col sm="10">
              <Form.Control type="number" placeholder="" />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm="4">
              Movie poster URL
            </Form.Label>
            <Col sm="8">
              <Form.Control type="string" placeholder="" />
            </Col>
          </Form.Group>
          <Form.Group controlId="formFile" as={Row} className="mb-3">
            <Form.Label column sm="3">
              Movie file
            </Form.Label>
            <Col sm="9">
              <Form.Control type="file" />
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
            /* handle save action */ onCloseModal();
          }}
        >
          Add movie
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddMovie;
