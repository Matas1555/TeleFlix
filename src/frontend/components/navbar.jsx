import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import "../css/navbar.css";

function NavBar({ onShowModal }) {
  return (
    <Navbar expand="lg">
      <Container fluid>
        <Navbar.Brand href="/" className="navbar-title">
          TeleFlix
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: "100px" }}
            navbarScroll
          >
            <Button className="navbar-button" href="/">
              Watch a movie!
            </Button>
            <Button className="navbar-button" onClick={onShowModal}>
              Add a movie
            </Button>
            <Nav.Link className="navbar-text" href="/">
              Home
            </Nav.Link>
            <Nav.Link className="navbar-text" href="/calendar">
              Calendar
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link className="navbar-text" href="/login">
              Login
            </Nav.Link>
            <Nav.Link className="navbar-text" href="/register">
              Register
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
