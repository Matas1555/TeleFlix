import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Modal from "react-bootstrap/Modal";
import { useAuth } from "../../authContext";
import { createRoom } from "../../backend/controllers/roomController.js";
import "../css/navbar.css";

import { auth } from "../../backend/controllers/firebase-config.js";

const NavBar = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.status) {
        window.location.href = "/";
      } else {
        console.error("Logout failed:", result.error);
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred during logout.");
    }
  };

  const openRoomCreationForm = () => {
    const confirmed = window.confirm("Are you sure you want to create a room?");

    if (confirmed) {
      handleRoomCreation();
    }
  };

  const handleRoomCreation = async () => {
    const result = await createRoom(currentUser);
    if (result.status) {
      window.open(`/room?roomID=${result.roomId}`, "_self");
    } else {
      alert("There was a problem creating the room");
    }
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
            <Nav.Link className="navbar-text" href="/movies">
              Movies
            </Nav.Link>
            <Button className="navbar-button" onClick={openRoomCreationForm}>
              Watch a movie!
            </Button>
          </Nav>
          <Nav>
            {currentUser ? (
              // If a user is logged in, display their username
              <>
                <Nav.Link className="navbar-text" onClick={handleLogout}>Logout</Nav.Link>
                <Nav.Link className="navbar-text">{currentUser}</Nav.Link>
              </>
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
