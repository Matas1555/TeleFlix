import React from "react";
import ReactDOM from "react-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Navbar from "./frontend/components/navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./frontend/pages/LogInWindow";
import Register from "./frontend/pages/RegisterWindow";
import HomePage from "./frontend/pages/MainWindow";
import AddMovie from "./frontend/components/addMovie";
import EditMovie from "./frontend/components/editMovie";
import MovieList from "./frontend/pages/MovieListWindow";
import RoomPage from "./frontend/pages/RoomWindow";
import MovieInformation from "./frontend/pages/MovieInformationWindow";

function App() {
  const [ShowMovieAddForm, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMovieData, setEditMovieData] = useState(null);

  const toggleModal = () => setShowModal(!ShowMovieAddForm);
  const toggleEditModal = (movieData) => {
    setShowEditModal(!showEditModal);
    setEditMovieData(movieData);
  };

  return (
    <Router>
      <Navbar />
      <AddMovie showModal={ShowMovieAddForm} onCloseModal={toggleModal} />
      <EditMovie
        showEditModal={showEditModal}
        onCloseEditModal={toggleEditModal}
        movie={editMovieData} // Pass the movie data to the EditMovie modal
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room" element={<RoomPage />} />
        <Route
          path="/movieInformation"
          element={<MovieInformation onShowEditModal={toggleEditModal} />}
        />
        <Route
          path="/movies"
          element={<MovieList ShowMovieAddForm={toggleModal} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
