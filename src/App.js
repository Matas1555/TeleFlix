import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/navbar';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Login from './pages/login';
import HomePage from './pages/homePage';

function App() {
  return (
    <Router>
        <Navbar />
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    </Router>
);
}

export default App;
