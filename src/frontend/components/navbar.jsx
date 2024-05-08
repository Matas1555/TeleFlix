import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Modal from "react-bootstrap/Modal";
import { useAuth } from '../../authContext';
import "../css/navbar.css";



import { auth } from "../../backend/controllers/firebase-config.js";

const NavBar = () => {

  const { currentUser, logoutUser } = useAuth();

  const handleLogout = () => {
    // Call logout method from the authentication context
    logoutUser();
  };

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
            <Button className="navbar-button" href="/room"> {/* This should be a Nav.Link */}
              Watch a movie!
            </Button>
            <Nav.Link className="navbar-text" href="/movies">
              Movies
            </Nav.Link>
            <Nav.Link className="navbar-text" href="/calendar">
              Calendar
            </Nav.Link>
          </Nav>
          <Nav>
            {currentUser ? (
              // If a user is logged in, display their username
              <Nav.Link className="navbar-text">{currentUser}</Nav.Link>
            ) : (
              // If no user is logged in, display login and register links
              <>
                <Nav.Link className="navbar-text" href="/login">
                  Login
                </Nav.Link>
                <Nav.Link className="navbar-text" href="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;

