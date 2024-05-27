import React, { useEffect, useState } from "react";
import { useAuth } from "../../authContext";
import {
  getAllEvents,
  getMovies,
  addEvent,
  deleteEvent,
  updateEvent,
} from "../../backend/controllers/calendarController";
import "../css/calendar.css";

function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userEvents, setUserEvents] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [eventDate, setEventDate] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      getMonthEvents();
      // Fetch movies only if they are not already fetched
      if (movies.length === 0) {
        fetchMovies();
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      getMonthEvents();
    }
  }, [selectedDate, currentUser]);

  const getMonthEvents = async () => {
    try {
      const events = await getAllEvents(currentUser);
      setUserEvents(events);
    } catch (error) {
      console.error("Error fetching user's events:", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const moviesList = await getMovies();
      setMovies(moviesList);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  // Define a movie cache object
  const movieCache = {};

  const getMovieTitle = async (movieId) => {
    try {
      // Check if movie is already in cache
      if (movieCache[movieId]) {
        return movieCache[movieId];
      } else {
        // Fetch movies only if not in cache
        const moviesList = await getMovies();
        if (moviesList) {
          const movie = moviesList.find((movie) => movie.id === movieId);
          const movieTitle = movie ? movie.title : "Unknown";
          // Cache the movie
          movieCache[movieId] = movieTitle;
          return movieTitle;
        } else {
          console.error("Movies list is undefined");
          return "Unknown";
        }
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      return "Unknown"; // Return "Unknown" in case of error
    }
  };

  const handleAddEvent = async (date, movieId) => {
    if (movieId) {
      const event = {
        userId: currentUser,
        date: new Date(date).toISOString(),
        movieId,
      };
      const newEvent = await addEvent(event);
      setUserEvents([...userEvents, newEvent]);
    }
  };

  const handleEditEvent = async (event, movieId) => {
    if (movieId) {
      const updatedEvent = await updateEvent(event.id, { ...event, movieId });
      setUserEvents(
        userEvents.map((evt) => (evt.id === event.id ? updatedEvent : evt))
      );
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (confirmed) {
      const success = await deleteEvent(eventId);
      if (success) {
        setUserEvents(userEvents.filter((event) => event.id !== eventId));
      }
    }
  };

  const openForm = (date, currentMovieId = null) => {
    setEventDate(date);
    setSelectedMovie(currentMovieId);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEventDate(null);
    setSelectedMovie(null);
  };

  const handleMovieSelect = (event) => {
    setSelectedMovie(event.target.value);
  };

  const selectDate = (selectedDay) => {
    const year = selectedDay.getFullYear();
    const month = selectedDay.getMonth();
    const day = selectedDay.getDate(); // Extract the day from the Date object
    const selectedDayISO = selectedDay.toISOString().split("T")[0];

    const eventsForDay = userEvents.find((event) => {
      if (typeof event.date === "string") {
        const eventDate = event.date.split("T")[0];
        return eventDate === selectedDayISO;
      }
      return false;
    });

    if (eventsForDay) {
      openForm(selectedDayISO, eventsForDay.movieId);
    } else {
      openForm(selectedDayISO);
    }
  };

  const handleSaveEvent = () => {
    if (eventDate && selectedMovie) {
      const movie = movies.find((movie) => movie.title === selectedMovie);
      if (movie) {
        const movieId = movie.id;

        // Check if an event already exists for the selected day
        const existingEventIndex = userEvents.findIndex((event) => {
          if (typeof event.date === "string") {
            const eventDate = event.date.split("T")[0];
            return eventDate === selectedDate.toISOString().split("T")[0];
          }
          return false;
        });

        if (existingEventIndex !== -1) {
          // Update the existing event
          handleEditEvent(userEvents[existingEventIndex], movieId);
        } else {
          // Add a new event
          handleAddEvent(eventDate, movieId);
        }
        closeForm();
      } else {
        console.error("Selected movie not found in the list of movies");
      }
    } else {
      console.error("Event date or selected movie is not set");
    }
  };

  const prevMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
    );
  };

  const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const monthName = (month) => {
    return new Intl.DateTimeFormat("en-US", { month: "long" }).format(
      new Date(selectedDate.getFullYear(), month, 1)
    );
  };

  const renderCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const totalDaysInMonth = daysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const calendarRows = [];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (dayName, index) => (
        <th key={index} className="day">
          {dayName}
        </th>
      )
    );
    calendarRows.push(<tr key="dayNames">{dayNames}</tr>);

    let dayCount = 1;
    for (let week = 0; week < 6; week++) {
      const weekCells = [];
      for (let i = 0; i < 7; i++) {
        if (
          (week === 0 && i < firstDayOfMonth) ||
          dayCount > totalDaysInMonth
        ) {
          weekCells.push(<td key={`${week}-${i}`} className="day"></td>);
        } else {
          const currentDay = dayCount; // Capture current dayCount value
          const eventDay = new Date(year, month, currentDay)
            .toISOString()
            .split("T")[0];
          const hasEvent = userEvents.some((event) => {
            if (typeof event.date === "string") {
              const eventDate = event.date.split("T")[0];
              return eventDate === eventDay;
            } else {
              return false;
            }
          });

          const event = userEvents.find((event) => {
            if (typeof event.date === "string") {
              const eventDate = event.date.split("T")[0];
              return eventDate === eventDay;
            } else {
              return false;
            }
          });

          weekCells.push(
            <td
              key={`${year}-${month}-${currentDay}`}
              className={`day ${hasEvent ? "event-day" : ""}`}
              onClick={() => selectDate(new Date(year, month, currentDay))}
            >
              <span className={hasEvent ? "event-link" : ""}>
                {currentDay}
                {hasEvent && (
                  <div className="event-details">
                    {/* Render movie title */}
                    {(() => {
                      const event = userEvents.find((event) => {
                        if (typeof event.date === "string") {
                          const eventDate = event.date.split("T")[0];
                          return eventDate === eventDay;
                        } else {
                          return false;
                        }
                      });

                      // Get movie title if movies list is available
                      const movie = movies.find(
                        (movie) => movie.id === event.movieId
                      );
                      const movieTitle = movie ? movie.title : "Unknown";
                      return <span className="movie-name">{movieTitle}</span>;
                    })()}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                    >
                      &times;
                    </button>
                  </div>
                )}
              </span>
            </td>
          );
          dayCount++;
        }
      }
      calendarRows.push(<tr key={`week-${week}`}>{weekCells}</tr>);
    }

    return (
      <table className="calendar-grid">
        <tbody>{calendarRows}</tbody>
      </table>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <button onClick={prevMonth}>Previous Month</button>
        <h2 className="calendar_Date">
          {monthName(selectedDate.getMonth())} {selectedDate.getFullYear()}
        </h2>
        <button onClick={nextMonth}>Next Month</button>
      </div>
      <div className="calendar-grid">{renderCalendar()}</div>

      {isFormOpen && (
        <div className="modal_calendar">
          <div className="modal-content_calendar">
            <h3>Select a Movie</h3>
            <select value={selectedMovie || ""} onChange={handleMovieSelect}>
              <option value="" disabled>
                Select a movie
              </option>
              {movies.length > 0 ? (
                movies.map((movie) => (
                  <option key={movie.id} value={movie.title}>
                    {movie.title}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No movies available
                </option>
              )}
            </select>
            <button onClick={handleSaveEvent}>Save</button>
            <button onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
