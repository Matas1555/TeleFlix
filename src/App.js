import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Navbar from "./frontend/components/navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./frontend/pages/login";
import Register from "./frontend/pages/register";
import HomePage from "./frontend/pages/homePage";
import AddMovie from "./frontend/components/addMovie";

function App() {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  return (
    <Router>
      <Navbar onShowModal={toggleModal} />
      <AddMovie showModal={showModal} onCloseModal={toggleModal} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
