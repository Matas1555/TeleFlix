import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Navbar from "./frontend/components/navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./frontend/pages/LogInWindow";
import Register from "./frontend/pages/RegisterWindow";
import HomePage from "./frontend/pages/MainWindow";
import AddMovie from "./frontend/components/addMovie";
import MovieList from "./frontend/pages/MovieListWindow";

function App() {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  return (
    <Router>
      <Navbar />
      <AddMovie showModal={showModal} onCloseModal={toggleModal} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/movies"
          element={<MovieList onShowModal={toggleModal} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
