import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import GameController from '../../backend/controllers/gameController'; 

const GameModal = ({ show, handleClose, userEmail }) => {
  const [gameSize, setGameSize] = useState({ width: 600, height: 400 });

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>Game Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-box">
        <GameController width={gameSize.width} height={gameSize.height} userEmail={userEmail} />
      </Modal.Body>
    </Modal>
  );
};

export default GameModal;
