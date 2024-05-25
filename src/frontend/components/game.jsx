import React, { useState } from 'react';
import { Modal } from 'react-bootstrap'; // Assuming you're using Bootstrap for modals
import Game from './../../backend/controllers/game'; // Import your Game component

const GameModal = ({ show, handleClose }) => {
  const [gameSize, setGameSize] = useState({ width: 600, height: 400 });



  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>Game Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-box">
        <Game width={gameSize.width} height={gameSize.height} />
      </Modal.Body>
    </Modal>
  );
};

export default GameModal;
