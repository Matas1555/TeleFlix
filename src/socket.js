import io from "socket.io-client";

// Connect to the server
const socket = io("http://localhost:5000", {
  withCredentials: true, // Ensure credentials are included
});

export default socket;
