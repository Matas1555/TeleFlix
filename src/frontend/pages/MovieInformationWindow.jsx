import {
  deleteMovie,
  getMovie,
  postComment, 
  getCommentsByMovieId,
  deleteComment,
  editComment 
} from "../../backend/controllers/movieController";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/movieInformation.css";
import { useAuth } from '../../authContext';



function MovieInformation({ onShowEditModal }) {
  const { currentUser } = useAuth(); 
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [movieId, setMovieID] = useState(null);
  const [comments, setComments] = useState([]);
  
  const [commentText, setCommentText] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null); // State to store the ID of the comment being edited



  useEffect(() => {
    const fetchMovieData = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const movieId = queryParams.get("movieId");
      setMovieID(movieId);
      try {
        const movieData = await getMovie(movieId);
        console.log(movieData);
        setMovie(movieData);
      } catch (error) {
        console.error("Error fetching movie:", error);
      }
    };

    fetchMovieData();
  }, []);

  useEffect(() => {
    if (movieId) {
      getComments();
    }
  }, [movieId]);

  const handleCommentSubmit = async () => {
    try {
      await postComment(movieId, commentText, currentUser);
      const updatedComments = await getCommentsByMovieId(movieId);
      setComments(updatedComments);
      setCommentText(""); // Clear input after submission
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
  };

  const getComments = async() => {
    try {
      const comments = await getCommentsByMovieId(movieId);
      setComments(comments);
    } catch (error) {
      console.error("Error getting comments:", error);
    }
  }

  const handleMovieDeletion = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this movie?"
    );
    if (confirmed) {
      const queryParams = new URLSearchParams(window.location.search);
      const movieId = queryParams.get("movieId");
      try {
        await deleteMovie(movieId);
        navigate("/movies");
      } catch (e) {
        console.log("error deleting movie", e);
      }
    }
  };

  const handleMovieEdit = () => {
    onShowEditModal(movie);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      // After deleting, fetch updated comments
      await getComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = async (commentId) => {
   
    setEditingCommentId(commentId);
  };

  const handleUpdateComment = async (updatedText) => {
    try {
      await editComment(editingCommentId, updatedText);
      // Clear the editingCommentId state after updating the comment
      setEditingCommentId(null);
      // After updating, fetch updated comments
      await getComments();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  useEffect(() => {
    // Set the initial value of commentText when the component mounts
    if (editingCommentId !== null) {
      const editedComment = comments.find(comment => comment.id === editingCommentId);
      if (editedComment) {
        setCommentText(editedComment.text);
      }
    }
  }, [editingCommentId]);
  
  useEffect(() => {
    // Reset the commentText when editingCommentId is set to null
    if (editingCommentId === null) {
      setCommentText("");
    }
  }, [editingCommentId]);

  return (
    <div>
      {movie ? (
        <div className="movie-information-main-container">
          <img className="movie-information-poster" src={movie.posterURL}></img>
          <div className="movie-information-card">
            <div className="title-year">
              <h2 className="movie-title">{movie.title}</h2>
              <h2 className="movie-year">{movie.year}</h2>
              <button className="edit-button" onClick={handleMovieEdit}>
                <i className="fa-solid fa-pencil"></i>
              </button>
              <button className="delete-button" onClick={handleMovieDeletion}>
                <i className="fa-solid fa-x"></i>
              </button>
            </div>

            <p className="movie-description">{movie.description}</p>
            <div>
              <p className="actors-word">Actors</p>
              <div className="actors-list">
                {movie.actors.map((actor) => (
                  <p key={actor} className="movie-actors">
                    {actor}
                  </p>
                ))}
              </div>
            </div>

            {movie.director ? (
              <div>
                <p className="actors-word">Director {movie.director}</p>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}

          <div className="comment-container">
            <h3>Comments</h3>
            <div className="comment-section">
              {comments.map((comment , index) => (
                
                <div key={index} className="comment">
                  {editingCommentId === comment.id ? (
                    <div>
                      <textarea
                        className="comment-edit-field"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      ></textarea>
                      <button className="comment-control" onClick={() => handleUpdateComment(commentText)}>Update</button>
                    </div>
                  ) : (
                    <div>
                      <p><b>{comment.user}</b>
                        {comment.user === currentUser && (
                          <button className="comment-control" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                        )}
                        {comment.user === currentUser && (
                          <button className="comment-control" onClick={() => handleEditComment(comment.id)}>Edit</button>
                        )}
                      </p>
                      <p>{comment.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          
        
        
        {showCommentForm && (
          <div>
            <textarea
              className="comment-field"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
            ></textarea>
            <button className="comment-button" onClick={handleCommentSubmit}>
              Post Comment
            </button>
          </div>
        )}
        
        {!showCommentForm && (
          <button className="comment-button" onClick={toggleCommentForm}>
            Add Comment
          </button>
        )}
      </div>
      </div>
    
  );
}

export default MovieInformation;